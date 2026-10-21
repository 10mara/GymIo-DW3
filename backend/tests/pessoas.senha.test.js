const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const ID = "11111111-1111-1111-1111-111111111111";

function montar() {
  const gravado = { pessoa: null };
  stubModule("modules/pessoas/pessoas.repository.js", {
    transaction: async (fn) => fn({}),
    findAtivaBasica: async () => ({ id: ID }),
    updatePessoa: async (id, data) => { gravado.pessoa = data; return { id, ...data }; },
    findAlunoAtivo: async () => null,
    createCompleta: async ({ pessoa }) => { gravado.pessoa = pessoa; return { ...pessoa, id: ID, alunos: [], funcionarios: [{ id: "f" }] }; },
  });
  return { service: freshRequire("modules/pessoas/pessoas.service.js"), gravado };
}

test("PUT com a senha mascarada vinda da listagem NÃO altera a senha", async () => {
  const { service, gravado } = montar();
  await service.atualizar(ID, { nome: "Ana", senha: "••••••••" });
  assert.equal("password" in gravado.pessoa, false);
});

test("PUT com senha vazia não altera a senha", async () => {
  const { service, gravado } = montar();
  await service.atualizar(ID, { nome: "Ana", senha: "" });
  assert.equal("password" in gravado.pessoa, false);
});

test("PUT com senha nova grava o hash", async () => {
  const { service, gravado } = montar();
  await service.atualizar(ID, { nome: "Ana", senha: "nova-senha" });
  assert.ok(gravado.pessoa.password);
  assert.notEqual(gravado.pessoa.password, "nova-senha");
});

test("POST com máscara não grava senha", async () => {
  const { service, gravado } = montar();
  await service.criar({ nome: "A", cpf: "12345678901", telefone: "1", email: "a@a.com", isFuncionario: true, senha: "••••••••" });
  assert.equal(gravado.pessoa.password, null);
});
