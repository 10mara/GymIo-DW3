const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");

const env = require("../config/env");
const schema = require("./schema");

/**
 * ============================================================
 * POOL POSTGRESQL
 * ============================================================
 */

const pool = new Pool({
  connectionString: env.databaseUrl,

  max: env.dbPoolMax,

  idleTimeoutMillis: env.dbIdleTimeoutMs,

  connectionTimeoutMillis: env.dbConnectionTimeoutMs,

  ssl: env.dbSsl
    ? {
        rejectUnauthorized: env.dbSslRejectUnauthorized,
      }
    : undefined,
});

/**
 * ============================================================
 * EVENTO DE ERRO DO POOL
 * ============================================================
 */

pool.on("error", (error) => {
  console.error(
    "Erro inesperado no pool PostgreSQL:",
    error
  );
});

/**
 * ============================================================
 * DRIZZLE ORM
 * ============================================================
 */

const db = drizzle(pool, {
  schema,
});

/**
 * ============================================================
 * TESTE DE CONEXÃO
 * ============================================================
 */

async function checkDatabaseConnection() {
  const result = await pool.query(
    "SELECT NOW() AS now"
  );

  return result.rows[0];
}

/**
 * ============================================================
 * ENCERRAR CONEXÃO
 * ============================================================
 */

async function closeDatabaseConnection() {
  await pool.end();
}

module.exports = {
  db,
  pool,
  checkDatabaseConnection,
  closeDatabaseConnection,
};