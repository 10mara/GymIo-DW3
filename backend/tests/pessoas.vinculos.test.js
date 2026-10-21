const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const ID = "11111111-1111-1111-1111-111111111111";
const PLANO_ID = "22222222-2222-2222-2222-222222222222";
const CARGO_ID = "33333333-3333-3333-3333-333333333333";

function montar({ aluno = null, funcionario = null, assinatura = null } = {}) {
  const chamadas = [];
  stubModule("modules/pessoas/pessoas.repository.js", {
    transaction: async (fn) => fn({}),
    findAtivaBasica: async () => ({ id: ID }),
    updatePessoa: async (id, dados) => ({ id, ...dados }),
    findAlunoAtivo: async () => aluno,
    createAlunoCompleto: async (...args) => chamadas.push(["criarAluno", ...args]),
    updateAluno: async (...args) => chamadas.push(["atualizarAluno", ...args]),
    softDeleteAluno: async (...args) => chamadas.push(["excluirAluno", ...args]),
    findAssinaturaMaisRecente: async () => assinatura,
    updateAssinatura: async (...args) => chamadas.push(["atualizarAssinatura", ...args]),
    findFuncionarioAtivo: async () => funcionario,
    createFuncionario: async (...args) => chamadas.push(["criarFuncionario", ...args]),
    updateFuncionario: async (...args) => chamadas.push(["atualizarFuncionario", ...args]),
    softDeleteFuncionario: async (...args) => chamadas.push(["excluirFuncionario", ...args]),
  });

  return {
    service: freshRequire("modules/pessoas/pessoas.service.js"),
    chamadas,
  };
}

test("PUT cria os vínculos de aluno e funcionário marcados", async () => {
  const { service, chamadas } = montar();

  await service.atualizar(ID, {
    isAluno: true,
    isFuncionario: true,
    status: "Ativo",
    plano_id: PLANO_ID,
    cargo_id: CARGO_ID,
    dataMatricula: "2026-01-15",
    dataAdmissao: "2026-02-02",
  });

  const criarAluno = chamadas.find(([operacao]) => operacao === "criarAluno");
  assert.equal(criarAluno[1], ID);
  assert.equal(criarAluno[2].status, "Ativo");
  assert.equal(criarAluno[3].planoId, PLANO_ID);
  assert.equal(criarAluno[3].dataInicio.toISOString().slice(0, 10), "2026-01-15");

  const criarFuncionario = chamadas.find(([operacao]) => operacao === "criarFuncionario");
  assert.equal(criarFuncionario[1], ID);
  assert.equal(criarFuncionario[2].cargoId, CARGO_ID);
  assert.equal(criarFuncionario[2].dataAdmissao.toISOString().slice(0, 10), "2026-02-02");
});

test("PUT exclui logicamente vínculos desmarcados", async () => {
  const { service, chamadas } = montar({
    aluno: { id: "aluno-id" },
    funcionario: { id: "funcionario-id" },
  });

  await service.atualizar(ID, { isAluno: false, isFuncionario: false });

  assert.equal(chamadas.find(([op]) => op === "excluirAluno")[1], "aluno-id");
  assert.equal(chamadas.find(([op]) => op === "excluirFuncionario")[1], "funcionario-id");
});

test("PUT atualiza plano/status e cargo/data dos vínculos existentes", async () => {
  const { service, chamadas } = montar({
    aluno: { id: "aluno-id" },
    funcionario: { id: "funcionario-id" },
    assinatura: { id: "assinatura-id", dataFim: null },
  });

  await service.atualizar(ID, {
    isAluno: true,
    isFuncionario: true,
    status: "Cancelado",
    plano_id: PLANO_ID,
    cargo_id: CARGO_ID,
    dataMatricula: "2026-01-15",
    dataAdmissao: "2026-02-02",
  });

  const atualizarAluno = chamadas.find(([op]) => op === "atualizarAluno");
  assert.equal(atualizarAluno[1], "aluno-id");
  assert.equal(atualizarAluno[2].status, "Cancelado");
  assert.equal(atualizarAluno[2].dataMatricula.toISOString().slice(0, 10), "2026-01-15");

  const atualizarAssinatura = chamadas.find(([op]) => op === "atualizarAssinatura");
  assert.equal(atualizarAssinatura[2].planoId, PLANO_ID);
  assert.equal(atualizarAssinatura[2].statusAssinatura, "Cancelado");

  const atualizarFuncionario = chamadas.find(([op]) => op === "atualizarFuncionario");
  assert.equal(atualizarFuncionario[1], "funcionario-id");
  assert.equal(atualizarFuncionario[2].cargoId, CARGO_ID);
  assert.equal(atualizarFuncionario[2].dataAdmissao.toISOString().slice(0, 10), "2026-02-02");
});
