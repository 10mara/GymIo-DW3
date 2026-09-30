const { pool } = require("../config/database");

function gerarIniciais(nome) {
  if (!nome) return "NA";

  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

// ============================================================
// LISTAR TRANSAÇÕES
// ============================================================

async function listarTransacoes(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        mf.id,
        mf.tipo_movimentacao AS tipo,
        mf.valor,
        mf.data_movimentacao,
        mf.descricao,
        mf.assinatura_id,
        mf.manutencao_id,
        mf.aluno_id,
        mf.vencimento,
        mf.status,
        mf.categoria,

        COALESCE(p.nome, 'Não informado') AS aluno,
        p.cpf AS cpf_aluno

      FROM public.movimentacao_financeira mf

      LEFT JOIN public.aluno a
        ON a.id = mf.aluno_id

      LEFT JOIN public.pessoa p
        ON p.id = a.pessoa_id

      WHERE mf.deleted_at IS NULL

      ORDER BY mf.data_movimentacao DESC
    `);

    const transacoes = rows.map((item) => ({
      id: item.id,
      tipo: item.tipo,
      aluno: item.aluno,
      cpfAluno: item.cpf_aluno || "",
      initials: gerarIniciais(item.aluno),
      valor: Number(item.valor),
      vencimento: item.vencimento,
      categoria: item.categoria || "",
      status: item.status || "Pendente",
      descricao: item.descricao || "",
      criadoEm: item.data_movimentacao,
      assinaturaId: item.assinatura_id,
      manutencaoId: item.manutencao_id,
      alunoId: item.aluno_id,
    }));

    return res.json(transacoes);
  } catch (error) {
    console.error("Erro ao listar transações:", error);

    return res.status(500).json({
      message: "Erro ao buscar as transações financeiras.",
    });
  }
}

// ============================================================
// RESUMO FINANCEIRO
// ============================================================

async function buscarResumoFinanceiro(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN tipo_movimentacao IN ('receber', 'entrada')
              THEN valor
              ELSE 0
            END
          ),
          0
        ) AS receber,

        COALESCE(
          SUM(
            CASE
              WHEN tipo_movimentacao IN ('pagar', 'saida', 'saída')
              THEN valor
              ELSE 0
            END
          ),
          0
        ) AS pagar,

        COALESCE(
          SUM(
            CASE
              WHEN tipo_movimentacao IN ('pagar', 'saida', 'saída')
                AND categoria = 'Despesas fixas'
                AND DATE_TRUNC('month', data_movimentacao)
                    = DATE_TRUNC('month', CURRENT_DATE)
              THEN valor
              ELSE 0
            END
          ),
          0
        ) AS despesas_fixas

      FROM public.movimentacao_financeira

      WHERE deleted_at IS NULL
    `);

    const receber = Number(rows[0].receber);
    const pagar = Number(rows[0].pagar);
    const despesasFixas = Number(rows[0].despesas_fixas);

    return res.json({
      receber,
      pagar,
      saldo: receber - pagar,
      despesasFixas,
    });
  } catch (error) {
    console.error("Erro ao buscar resumo financeiro:", error);

    return res.status(500).json({
      message: "Erro ao buscar o resumo financeiro.",
    });
  }
}

// ============================================================
// GRÁFICO DE FLUXO DE CAIXA
// ============================================================

async function buscarGraficoFinanceiro(req, res) {
  try {
    const { rows } = await pool.query(`
      WITH meses AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS mes
      )

      SELECT
        TO_CHAR(meses.mes, 'YYYY-MM') AS chave,

        CASE EXTRACT(MONTH FROM meses.mes)
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Fev'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Abr'
          WHEN 5 THEN 'Mai'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Ago'
          WHEN 9 THEN 'Set'
          WHEN 10 THEN 'Out'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dez'
        END AS mes,

        COALESCE(
          SUM(
            CASE
              WHEN mf.tipo_movimentacao IN ('receber', 'entrada')
              THEN mf.valor
              ELSE 0
            END
          ),
          0
        ) AS receitas,

        COALESCE(
          SUM(
            CASE
              WHEN mf.tipo_movimentacao IN ('pagar', 'saida', 'saída')
              THEN mf.valor
              ELSE 0
            END
          ),
          0
        ) AS despesas

      FROM meses

      LEFT JOIN public.movimentacao_financeira mf
        ON DATE_TRUNC('month', mf.data_movimentacao) = meses.mes
        AND mf.deleted_at IS NULL

      GROUP BY meses.mes

      ORDER BY meses.mes ASC
    `);

    return res.json(
      rows.map((item) => ({
        chave: item.chave,
        mes: item.mes,
        receitas: Number(item.receitas),
        despesas: Number(item.despesas),
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar gráfico financeiro:", error);

    return res.status(500).json({
      message: "Erro ao buscar os dados do gráfico financeiro.",
    });
  }
}

// ============================================================
// CRIAR TRANSAÇÃO
// ============================================================

async function criarTransacao(req, res) {
  const client = await pool.connect();

  try {
    const {
      tipo,
      aluno,
      valor,
      vencimento,
      categoria,
      status,
      descricao,
    } = req.body;

    if (!tipo || !valor || !vencimento || !categoria) {
      return res.status(400).json({
        message: "Tipo, valor, vencimento e categoria são obrigatórios.",
      });
    }

    await client.query("BEGIN");

    // Busca a primeira conta disponível.
    const contaResult = await client.query(`
      SELECT id
      FROM public.conta
      WHERE delete_at IS NULL
      ORDER BY data DESC NULLS LAST
      LIMIT 1
    `);

    if (!contaResult.rows.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Nenhuma conta financeira foi cadastrada. Cadastre uma conta antes de criar uma movimentação.",
      });
    }

    const contaId = contaResult.rows[0].id;

    let alunoId = null;

    if (aluno && aluno.trim() && aluno.trim() !== "Não informado") {
      const alunoResult = await client.query(
        `
        SELECT a.id
        FROM public.aluno a
        INNER JOIN public.pessoa p
          ON p.id = a.pessoa_id

        WHERE a.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND LOWER(TRIM(p.nome)) = LOWER(TRIM($1))

        LIMIT 1
        `,
        [aluno.trim()]
      );

      if (alunoResult.rows.length) {
        alunoId = alunoResult.rows[0].id;
      }
    }

    const result = await client.query(
      `
      INSERT INTO public.movimentacao_financeira (
        tipo_movimentacao,
        valor,
        descricao,
        aluno_id,
        vencimento,
        status,
        categoria,
        conta_id,
        data_movimentacao
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        NOW()
      )
      RETURNING id
      `,
      [
        tipo,
        Number(valor),
        descricao || null,
        alunoId,
        vencimento,
        status || "Pendente",
        categoria,
        contaId,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Transação criada com sucesso.",
      id: result.rows[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao criar transação:", error);

    return res.status(500).json({
      message: "Erro ao criar a transação financeira.",
    });
  } finally {
    client.release();
  }
}

// ============================================================
// ATUALIZAR TRANSAÇÃO
// ============================================================

async function atualizarTransacao(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      tipo,
      aluno,
      valor,
      vencimento,
      categoria,
      status,
      descricao,
    } = req.body;

    await client.query("BEGIN");

    let alunoId = null;

    if (aluno && aluno.trim() && aluno.trim() !== "Não informado") {
      const alunoResult = await client.query(
        `
        SELECT a.id
        FROM public.aluno a
        INNER JOIN public.pessoa p
          ON p.id = a.pessoa_id

        WHERE a.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND LOWER(TRIM(p.nome)) = LOWER(TRIM($1))

        LIMIT 1
        `,
        [aluno.trim()]
      );

      if (alunoResult.rows.length) {
        alunoId = alunoResult.rows[0].id;
      }
    }

    const result = await client.query(
      `
      UPDATE public.movimentacao_financeira

      SET
        tipo_movimentacao = $1,
        valor = $2,
        descricao = $3,
        aluno_id = $4,
        vencimento = $5,
        status = $6,
        categoria = $7

      WHERE id = $8
        AND deleted_at IS NULL

      RETURNING id
      `,
      [
        tipo,
        Number(valor),
        descricao || null,
        alunoId,
        vencimento,
        status || "Pendente",
        categoria,
        id,
      ]
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Transação não encontrada.",
      });
    }

    await client.query("COMMIT");

    return res.json({
      message: "Transação atualizada com sucesso.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao atualizar transação:", error);

    return res.status(500).json({
      message: "Erro ao atualizar a transação financeira.",
    });
  } finally {
    client.release();
  }
}

// ============================================================
// EXCLUIR TRANSAÇÃO
// ============================================================

async function excluirTransacao(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE public.movimentacao_financeira

      SET deleted_at = NOW()

      WHERE id = $1
        AND deleted_at IS NULL

      RETURNING id
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "Transação não encontrada.",
      });
    }

    return res.json({
      message: "Transação excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);

    return res.status(500).json({
      message: "Erro ao excluir a transação financeira.",
    });
  }
}


// ============================================================
// BUSCAR ALUNOS PARA O FINANCEIRO
// ============================================================

async function buscarAlunosFinanceiro(req, res) {
  try {
    const nome = (req.query.nome || "").trim();

    if (!nome) {
      return res.json([]);
    }

    const { rows } = await pool.query(
      `
      SELECT
        a.id AS aluno_id,
        p.nome,
        p.cpf
      FROM public.aluno a
      INNER JOIN public.pessoa p
        ON p.id = a.pessoa_id
      WHERE a.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND p.nome ILIKE $1
      ORDER BY p.nome ASC
      LIMIT 10
      `,
      [`%${nome}%`]
    );

    return res.json(
      rows.map((aluno) => ({
        id: aluno.aluno_id,
        nome: aluno.nome,
        cpf: aluno.cpf || "",
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar alunos para o Financeiro:", error);

    return res.status(500).json({
      message: "Erro ao buscar alunos.",
    });
  }
}

module.exports = {
  listarTransacoes,
  buscarResumoFinanceiro,
  buscarGraficoFinanceiro,
  buscarAlunosFinanceiro,
  criarTransacao,
  atualizarTransacao,
  excluirTransacao,
};