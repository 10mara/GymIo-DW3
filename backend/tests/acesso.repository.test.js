const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

test("agrega entradas no banco com intervalo limitado e sem trazer eventos individuais", async () => {
  let consulta;
  stubModule("config/prisma.js", {
    prisma: {
      $queryRaw: async (strings, ...values) => {
        consulta = { sql: strings.join("?"), values };
        return [{ dia: "2026-10-21", hora: 18, total: 8 }];
      },
    },
  });

  const repository = freshRequire("modules/acesso/acesso.repository.js");
  const desde = new Date("2026-10-15T03:00:00.000Z");
  const ate = new Date("2026-10-22T03:00:00.000Z");
  const resultado = await repository.resumirEntradasDashboard(desde, ate);

  assert.deepEqual(resultado, [{ dia: "2026-10-21", hora: 18, total: 8 }]);
  assert.match(consulta.sql, /COUNT\(\*\)::int AS total/);
  assert.match(consulta.sql, /data_hora_acesso >= \?/);
  assert.match(consulta.sql, /data_hora_acesso < \?/);
  assert.deepEqual(consulta.values, ["America/Sao_Paulo", "America/Sao_Paulo", desde, ate]);
});
