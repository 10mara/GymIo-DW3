const { pool } = require("../config/database");

// ============================================================
// LISTAR CONTAS
// ============================================================

async function listarContas() {
  const query = `
    SELECT
      id,
      saldo,
      data
    FROM conta
    WHERE delete_at IS NULL
    ORDER BY data DESC NULLS LAST
  `;

  const result = await pool.query(query);

  return result.rows;
}

// ============================================================
// BUSCAR CONTA POR ID
// ============================================================

async function buscarContaPorId(id) {
  const query = `
    SELECT
      id,
      saldo,
      data
    FROM conta
    WHERE id = $1
      AND delete_at IS NULL
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

// ============================================================
// BUSCAR CONTA PRINCIPAL
// ============================================================

async function buscarContaPrincipal() {
  const query = `
    SELECT
      id,
      saldo,
      data
    FROM conta
    WHERE delete_at IS NULL
    ORDER BY data DESC NULLS LAST
    LIMIT 1
  `;

  const result = await pool.query(query);

  return result.rows[0] || null;
}

module.exports = {
  listarContas,
  buscarContaPorId,
  buscarContaPrincipal,
};