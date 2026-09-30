const { pool } = require("../config/database");

// ============================================================
// LISTAR MOVIMENTAÇÕES
// ============================================================

async function listarMovimentacoes() {
  const query = `
    SELECT
      mf.id,
      mf.aluno_id,
      mf.tipo_movimentacao AS tipo,
      mf.descricao,
      mf.valor,
      mf.vencimento,
      mf.status,
      mf.categoria,
      mf.data_movimentacao AS criado_em,
      mf.assinatura_id,
      mf.manutencao_id,
      mf.conta_id,

      p.nome AS aluno

    FROM movimentacao_financeira mf

    LEFT JOIN aluno a
      ON mf.aluno_id = a.id

    LEFT JOIN pessoa p
      ON a.pessoa_id = p.id

    WHERE mf.deleted_at IS NULL

    ORDER BY mf.data_movimentacao DESC
  `;

  const result = await pool.query(query);

  return result.rows;
}

// ============================================================
// BUSCAR MOVIMENTAÇÃO POR ID
// ============================================================

async function buscarMovimentacaoPorId(id) {
  const query = `
    SELECT
      mf.id,
      mf.aluno_id,
      mf.tipo_movimentacao AS tipo,
      mf.descricao,
      mf.valor,
      mf.vencimento,
      mf.status,
      mf.categoria,
      mf.data_movimentacao AS criado_em,
      mf.assinatura_id,
      mf.manutencao_id,
      mf.conta_id,

      p.nome AS aluno

    FROM movimentacao_financeira mf

    LEFT JOIN aluno a
      ON mf.aluno_id = a.id

    LEFT JOIN pessoa p
      ON a.pessoa_id = p.id

    WHERE mf.id = $1
      AND mf.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
}

// ============================================================
// ENCONTRAR ALUNO PELO NOME
// ============================================================

async function buscarAlunoPorNome(nome) {
  if (!nome || !nome.trim()) {
    return null;
  }

  const query = `
    SELECT
      a.id,
      p.nome
    FROM aluno a
    INNER JOIN pessoa p
      ON a.pessoa_id = p.id
    WHERE LOWER(TRIM(p.nome)) = LOWER(TRIM($1))
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    LIMIT 1
  `;

  const result = await pool.query(query, [nome.trim()]);

  return result.rows[0] || null;
}

// ============================================================
// CRIAR MOVIMENTAÇÃO
// ============================================================

async function criarMovimentacao(dados) {
  const {
    aluno_id,
    tipo,
    descricao,
    valor,
    vencimento,
    status,
    categoria,
    assinatura_id,
    manutencao_id,
    conta_id,
  } = dados;

  const query = `
    INSERT INTO movimentacao_financeira (
      aluno_id,
      tipo_movimentacao,
      descricao,
      valor,
      vencimento,
      status,
      categoria,
      assinatura_id,
      manutencao_id,
      conta_id
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
      $9,
      $10
    )
    RETURNING *
  `;

  const values = [
    aluno_id || null,
    tipo,
    descricao || null,
    valor,
    vencimento,
    status,
    categoria,
    assinatura_id || null,
    manutencao_id || null,
    conta_id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

// ============================================================
// ATUALIZAR MOVIMENTAÇÃO
// ============================================================

async function atualizarMovimentacao(id, dados) {
  const {
    aluno_id,
    tipo,
    descricao,
    valor,
    vencimento,
    status,
    categoria,
    assinatura_id,
    manutencao_id,
    conta_id,
  } = dados;

  const query = `
    UPDATE movimentacao_financeira
    SET
      aluno_id = $1,
      tipo_movimentacao = $2,
      descricao = $3,
      valor = $4,
      vencimento = $5,
      status = $6,
      categoria = $7,
      assinatura_id = $8,
      manutencao_id = $9,
      conta_id = $10
    WHERE id = $11
      AND deleted_at IS NULL
    RETURNING *
  `;

  const values = [
    aluno_id || null,
    tipo,
    descricao || null,
    valor,
    vencimento,
    status,
    categoria,
    assinatura_id || null,
    manutencao_id || null,
    conta_id,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

// ============================================================
// EXCLUSÃO LÓGICA
// ============================================================

async function excluirMovimentacao(id) {
  const query = `
    UPDATE movimentacao_financeira
    SET deleted_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
}

module.exports = {
  listarMovimentacoes,
  buscarMovimentacaoPorId,
  buscarAlunoPorNome,
  criarMovimentacao,
  atualizarMovimentacao,
  excluirMovimentacao,
};