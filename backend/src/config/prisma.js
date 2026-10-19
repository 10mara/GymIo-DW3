/**
 * ÚNICA instância do Prisma Client do projeto.
 * Todos os módulos (repositories) devem importar daqui:
 *   const { prisma } = require("../../config/prisma");
 * Nunca faça `new PrismaClient()` em outro lugar.
 */
const { PrismaClient } = require("@prisma/client");
const env = require("./env");

// Em desenvolvimento (nodemon) o módulo pode ser recarregado: reaproveita a instância.
const globalRef = globalThis;

const prisma =
  globalRef.__gymioPrisma ||
  new PrismaClient({
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
