const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

test("agrega os indicadores de assinaturas em uma consulta", async () => {
  let consulta;
  stubModule("config/prisma.js", {
    prisma: {
      $queryRaw: async (strings, ...values) => {
        consulta = { sql: strings.join("?"), values };
        return [{
          total: 10,
          ativas: 7,
          inadimplentes: 2,
          vencendoHoje: 1,
        }];
      },
    },
  });

  const repository = freshRequire("modules/dashboard/dashboard.repository.js");
  const hoje = new Date("2026-10-21T00:00:00.000Z");
  const [resumo] = await repository.resumoAssinaturas(hoje);

  assert.deepEqual(resumo, {
    total: 10,
    ativas: 7,
    inadimplentes: 2,
    vencendoHoje: 1,
  });
  assert.match(consulta.sql, /COUNT\(\*\) FILTER/);
  assert.equal(consulta.values[0], hoje);
});

test("agrega receitas e despesas do mês em uma consulta", async () => {
  let consulta;
  stubModule("config/prisma.js", {
    prisma: {
      $queryRaw: async (strings, ...values) => {
        consulta = { sql: strings.join("?"), values };
        return [{ receita: "1500.00", receitaAnterior: "1000.00", despesa: "400.00" }];
      },
    },
  });

  const repository = freshRequire("modules/dashboard/dashboard.repository.js");
  const atual = new Date("2026-10-01T03:00:00.000Z");
  const proximo = new Date("2026-11-01T03:00:00.000Z");
  const anterior = new Date("2026-09-01T03:00:00.000Z");
  const [resumo] = await repository.resumoFinanceiro(atual, proximo, anterior);

  assert.equal(resumo.receita, "1500.00");
  assert.equal(resumo.receitaAnterior, "1000.00");
  assert.equal(resumo.despesa, "400.00");
  assert.match(consulta.sql, /SUM\(valor\) FILTER/);
  assert.deepEqual(consulta.values, [atual, proximo, anterior, atual, atual, proximo, anterior, proximo]);
});
