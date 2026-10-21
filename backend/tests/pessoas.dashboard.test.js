const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

test("agrega alunos ativos e matrículas mensais em uma consulta", async () => {
  let consulta;
  stubModule("config/prisma.js", {
    prisma: {
      $queryRaw: async (strings, ...values) => {
        consulta = { sql: strings.join("?"), values };
        return [{
          alunosAtivos: 42,
          novosMes: 5,
          novosMesAnterior: 4,
          cancelamentos: 1,
        }];
      },
    },
  });

  const service = freshRequire("modules/pessoas/pessoas.service.js");
  const resumo = await service.resumoDashboard();

  assert.deepEqual(resumo, {
    alunosAtivos: 42,
    novosMes: 5,
    cancelamentos: 1,
    crescimento: 25,
  });
  assert.match(consulta.sql, /INNER JOIN pessoa/);
  assert.match(consulta.sql, /COUNT\(\*\) FILTER/);
  assert.equal(consulta.values.length, 6);
});
