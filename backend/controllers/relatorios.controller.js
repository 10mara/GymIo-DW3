const { pool } = require("../db");

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function formatarData(data) {
  if (!data) return "-";

  const texto = String(data).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length === 3 && partes.every(Boolean)) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function periodoTexto(inicio, fim) {
  if (!inicio && !fim) return "Todos os registros";

  return `${formatarData(inicio)} até ${formatarData(fim)}`;
}

function validarPeriodo(inicio, fim) {
  const formatoData = /^\d{4}-\d{2}-\d{2}$/;

  if (inicio && !formatoData.test(inicio)) {
    throw new Error("Parâmetro 'inicio' inválido. Use YYYY-MM-DD.");
  }

  if (fim && !formatoData.test(fim)) {
    throw new Error("Parâmetro 'fim' inválido. Use YYYY-MM-DD.");
  }

  if (inicio && fim && inicio > fim) {
    throw new Error(
      "A data inicial não pode ser posterior à data final."
    );
  }
}

// ============================================================
// RELATÓRIO DE ALUNOS
// ============================================================

async function gerarRelatorioAlunos(inicio, fim) {
  const { rows } = await pool.query(
    `
    SELECT
      a.id,
      a.status,
      a.data_matricula,
      p.nome,
      p.cpf,
      p.telefone,
      p.email
    FROM public.aluno a
    INNER JOIN public.pessoa p
      ON p.id = a.pessoa_id
    WHERE a.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND ($1::date IS NULL OR a.data_matricula >= $1::date)
      AND (
        $2::date IS NULL
        OR a.data_matricula < $2::date + INTERVAL '1 day'
      )
    ORDER BY p.nome ASC
    `,
    [inicio || null, fim || null]
  );

  return {
    titulo: "Relatório de Alunos",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      {
        label: "Total de alunos",
        valor: rows.length,
      },
      {
        label: "Alunos ativos",
        valor: rows.filter(
          (item) => item.status?.toLowerCase() === "ativo"
        ).length,
      },
      {
        label: "Alunos inativos",
        valor: rows.filter(
          (item) => item.status?.toLowerCase() === "inativo"
        ).length,
      },
    ],
    colunas: [
      "Nome",
      "CPF",
      "Telefone",
      "E-mail",
      "Status",
      "Matrícula",
    ],
    tabela: rows.map((item) => [
      item.nome || "-",
      item.cpf || "-",
      item.telefone || "-",
      item.email || "-",
      item.status || "-",
      formatarData(item.data_matricula),
    ]),
  };
}

// ============================================================
// RELATÓRIO DE RECEITA
// ============================================================

async function gerarRelatorioReceita(inicio, fim) {
  const { rows } = await pool.query(
    `
    SELECT
      tipo_movimentacao,
      valor,
      data_movimentacao,
      descricao
    FROM public.movimentacao_financeira
    WHERE deleted_at IS NULL
      AND (
        $1::date IS NULL
        OR data_movimentacao >= $1::date
      )
      AND (
        $2::date IS NULL
        OR data_movimentacao < $2::date + INTERVAL '1 day'
      )
    ORDER BY data_movimentacao DESC
    `,
    [inicio || null, fim || null]
  );

  const entradas = rows
    .filter((item) =>
      ["entrada", "receber"].includes(
        item.tipo_movimentacao?.toLowerCase()
      )
    )
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  const saidas = rows
    .filter((item) =>
      ["saida", "saída", "pagar"].includes(
        item.tipo_movimentacao?.toLowerCase()
      )
    )
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  return {
    titulo: "Relatório de Receita",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      {
        label: "Entradas",
        valor: formatarMoeda(entradas),
      },
      {
        label: "Saídas",
        valor: formatarMoeda(saidas),
      },
      {
        label: "Saldo",
        valor: formatarMoeda(entradas - saidas),
      },
    ],
    colunas: ["Tipo", "Valor", "Data", "Descrição"],
    tabela: rows.map((item) => [
      item.tipo_movimentacao || "-",
      formatarMoeda(item.valor),
      formatarData(item.data_movimentacao),
      item.descricao || "-",
    ]),
  };
}

// ============================================================
// RELATÓRIO DE INADIMPLÊNCIA
// ============================================================

async function gerarRelatorioInadimplencia(inicio, fim) {
  const { rows } = await pool.query(
    `
    SELECT
      ass.id,
      ass.status_assinatura,
      ass.data_inicio,
      ass.data_fim,
      p.nome AS aluno_nome,
      p.cpf AS aluno_cpf,
      p.telefone AS aluno_telefone,
      p.email AS aluno_email,
      pl.nome_plano,
      pl.valor AS plano_valor
    FROM public.assinatura ass
    INNER JOIN public.aluno a
      ON a.id = ass.aluno_id
      AND a.deleted_at IS NULL
    INNER JOIN public.pessoa p
      ON p.id = a.pessoa_id
      AND p.deleted_at IS NULL
    LEFT JOIN public.plano pl
      ON pl.id = ass.plano_id
      AND pl.deleted_at IS NULL
    WHERE ass.deleted_at IS NULL
      AND LOWER(ass.status_assinatura) = 'inadimplente'
      AND (
        $1::date IS NULL
        OR ass.data_inicio >= $1::date
      )
      AND (
        $2::date IS NULL
        OR ass.data_inicio < $2::date + INTERVAL '1 day'
      )
    ORDER BY p.nome ASC
    `,
    [inicio || null, fim || null]
  );

  const total = rows.reduce(
    (soma, item) => soma + Number(item.plano_valor || 0),
    0
  );

  return {
    titulo: "Relatório de Inadimplência",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      {
        label: "Total inadimplente",
        valor: rows.length,
      },
      {
        label: "Valor em atraso",
        valor: formatarMoeda(total),
      },
    ],
    colunas: [
      "Aluno",
      "CPF",
      "Telefone",
      "E-mail",
      "Plano",
      "Valor",
      "Status",
    ],
    tabela: rows.map((item) => [
      item.aluno_nome || "-",
      item.aluno_cpf || "-",
      item.aluno_telefone || "-",
      item.aluno_email || "-",
      item.nome_plano || "-",
      formatarMoeda(item.plano_valor),
      item.status_assinatura || "-",
    ]),
  };
}

// ============================================================
// RELATÓRIO DE FREQUÊNCIA
// ============================================================

async function gerarRelatorioFrequencia(inicio, fim) {
  const { rows } = await pool.query(
    `
    SELECT
      ac.tipo_acesso,
      ac.data_hora_acesso,
      p.nome AS aluno_nome
    FROM public.acesso ac
    LEFT JOIN public.aluno a
      ON a.id = ac.aluno_id
      AND a.deleted_at IS NULL
    LEFT JOIN public.pessoa p
      ON p.id = a.pessoa_id
      AND p.deleted_at IS NULL
    WHERE ac.deleted_at IS NULL
      AND (
        $1::date IS NULL
        OR ac.data_hora_acesso >= $1::date
      )
      AND (
        $2::date IS NULL
        OR ac.data_hora_acesso < $2::date + INTERVAL '1 day'
      )
    ORDER BY ac.data_hora_acesso DESC
    `,
    [inicio || null, fim || null]
  );

  return {
    titulo: "Relatório de Frequência",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      {
        label: "Total de acessos",
        valor: rows.length,
      },
    ],
    colunas: ["Aluno", "Tipo", "Data/Hora"],
    tabela: rows.map((item) => [
      item.aluno_nome || "-",
      item.tipo_acesso || "-",
      formatarData(item.data_hora_acesso),
    ]),
  };
}

// ============================================================
// RELATÓRIO DE EQUIPAMENTOS
// ============================================================

async function gerarRelatorioEquipamentos() {
  const { rows } = await pool.query(`
    SELECT
      nome_equipamento,
      data_aquisicao,
      status_conservacao
    FROM public.equipamento
    WHERE deleted_at IS NULL
    ORDER BY nome_equipamento ASC
  `);

  return {
    titulo: "Relatório de Equipamentos",
    periodo: "Todos os registros",
    resumo: [
      {
        label: "Total de equipamentos",
        valor: rows.length,
      },
    ],
    colunas: [
      "Equipamento",
      "Data de Aquisição",
      "Status",
    ],
    tabela: rows.map((item) => [
      item.nome_equipamento || "-",
      formatarData(item.data_aquisicao),
      item.status_conservacao || "-",
    ]),
  };
}

// ============================================================
// RELATÓRIO GERAL
// ============================================================

async function gerarRelatorioGeral(inicio, fim) {
  const [
    alunos,
    receita,
    frequencia,
    equipamentos,
  ] = await Promise.all([
    gerarRelatorioAlunos(inicio, fim),
    gerarRelatorioReceita(inicio, fim),
    gerarRelatorioFrequencia(inicio, fim),
    gerarRelatorioEquipamentos(),
  ]);

  const indicadores = [
    ...alunos.resumo,
    ...receita.resumo,
    ...frequencia.resumo,
    ...equipamentos.resumo,
  ];

  return {
    titulo: "Relatório Geral",
    periodo: periodoTexto(inicio, fim),
    resumo: indicadores,
    colunas: ["Indicador", "Valor"],
    tabela: indicadores.map((item) => [
      item.label,
      item.valor,
    ]),
  };
}

// ============================================================
// ROTA PRINCIPAL DOS RELATÓRIOS
// ============================================================

async function gerarRelatorio(req, res) {
  try {
    const { tipo } = req.params;
    const { inicio, fim } = req.query;

    validarPeriodo(inicio, fim);

    let relatorio;

    if (tipo === "alunos") {
      relatorio = await gerarRelatorioAlunos(inicio, fim);
    } else if (tipo === "receita" || tipo === "financeiro") {
      relatorio = await gerarRelatorioReceita(inicio, fim);
    } else if (tipo === "inadimplencia") {
      relatorio = await gerarRelatorioInadimplencia(inicio, fim);
    } else if (tipo === "frequencia" || tipo === "acessos") {
      relatorio = await gerarRelatorioFrequencia(inicio, fim);
    } else if (tipo === "equipamentos") {
      relatorio = await gerarRelatorioEquipamentos();
    } else if (tipo === "geral") {
      relatorio = await gerarRelatorioGeral(inicio, fim);
    } else {
      return res.status(400).json({
        erro: "Tipo de relatório inválido",
      });
    }

    return res.json(relatorio);
  } catch (erro) {
    console.error("Erro ao gerar relatório:", erro);

    const erroDeValidacao =
      erro.message?.includes("Parâmetro '") ||
      erro.message?.includes("data inicial");

    return res.status(erroDeValidacao ? 400 : 500).json({
      erro: erroDeValidacao
        ? erro.message
        : "Erro ao gerar relatório",
    });
  }
}

module.exports = {
  gerarRelatorio,
};