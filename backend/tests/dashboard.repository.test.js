const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

test("atividades recentes não consultam matrículas com data futura", async () => {
  let consulta;
  stubModule("config/prisma.js", {
    prisma: {
      assinatura: {
        findMany: async (args) => {
          consulta = args;
          return [];
        },
      },
    },
  });

  const repository = freshRequire("modules/dashboard/dashboard.repository.js");
  const limite = new Date("2026-10-21T00:00:00.000Z");
  await repository.findUltimasMatriculas(5, limite);

  assert.equal(consulta.where.dataAssinatura.lte, limite);
  assert.equal(consulta.take, 5);
});
