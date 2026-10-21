/**
 * ÚNICA instância do Prisma Client do projeto.
 * Todos os módulos (repositories) devem importar daqui:
 *   const { prisma } = require("../../config/prisma");
 * Nunca faça `new PrismaClient()` em outro lugar.
 */
const { PrismaClient } = require("@prisma/client");
const env = require("./env");

const databaseUrl = new URL(env.databaseUrl);
if (!databaseUrl.searchParams.has("connection_limit")) {
  databaseUrl.searchParams.set("connection_limit", String(env.databaseConnectionLimit));
}

// Em desenvolvimento (nodemon) o módulo pode ser recarregado: reaproveita a instância.
const globalRef = globalThis;

const prisma =
  globalRef.__gymioPrisma ||
  new PrismaClient({
    datasources: { db: { url: databaseUrl.toString() } },
    log: env.isProd ? ["error"] : ["warn", "error"],
  });

if (!env.isProd) globalRef.__gymioPrisma = prisma;

async function checkDatabaseConnection() {
  const rows = await prisma.$queryRaw`SELECT NOW() AS now`;
  return rows[0];
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

module.exports = { prisma, checkDatabaseConnection, disconnectDatabase };
