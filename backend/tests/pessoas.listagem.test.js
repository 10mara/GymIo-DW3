const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

test("listagem de alunos filtra pessoas sem vínculo ativo de aluno", async () => {
  const consultas = [];
  stubModule("config/prisma.js", {
    prisma: {
      pessoa: {
        findMany: async (consulta) => {
          consultas.push(consulta);
          return [];
        },
      },
    },
  });

  const repository = freshRequire("modules/pessoas/pessoas.repository.js");
  await repository.findAll();
  await repository.findAll("aluno");

  assert.equal(consultas[0].where.alunos, undefined);
  assert.deepEqual(consultas[1].where.alunos, {
    some: { deletedAt: null },
  });
});

test("serializer mantém datas e IDs ausentes como null", () => {
  const serializer = freshRequire("modules/pessoas/pessoas.serializer.js");
  const item = serializer.toListItem({
    id: "pessoa-id",
    nome: "Ana",
    alunos: [],
    funcionarios: [],
  });

  assert.equal(item.matricula, null);
  assert.equal(item.plano_id, null);
  assert.equal(item.cargo_id, null);
  assert.equal(item.data_admissao, null);
});
