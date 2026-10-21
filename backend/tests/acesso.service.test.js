const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const CPF = "123.456.789-01";
const dia = (iso) => new Date(`${iso}T00:00:00.000Z`);

function montar(estado = {}) {
  const chamadas = { bloqueios: 0, entradas: 0, saidas: 0, lockAlunos: [], cpfCandidatos: null };
  const e = {
    aluno: { id: "a1", status: "Ativo", pessoa: { id: "p1", nome: "Maria", cpf: CPF } },
    assinaturas: [{ statusAssinatura: "Ativo", dataInicio: dia("2020-01-01"), dataFim: null }],
    entradaAberta: null,
    ultimaSaida: null,
    ...estado,
  };
  const registro = (extra) => ({
    id: "x1", alunoId: "a1", dataHoraAcesso: new Date(), tipoAcesso: "entrada",
    horaEntrada: new Date(), horaSaida: null, deletedAt: null, ...extra,
  });
  stubModule("modules/acesso/acesso.repository.js", {
    findAlunoPorCpf: async (c) => { chamadas.cpfCandidatos = c; return e.aluno; },
    findAssinaturasDoAluno: async () => e.assinaturas,
    findEntradaAberta: async () => e.entradaAberta,
    findUltimaSaida: async () => e.ultimaSaida,
    createEntrada: async () => { chamadas.entradas++; return registro(); },
    createBloqueio: async () => { chamadas.bloqueios++; return registro({ tipoAcesso: "bloqueado" }); },
    updateSaida: async (id) => { chamadas.saidas++; return registro({ id, horaSaida: new Date() }); },
    comLockDoAluno: async (id, fn) => { chamadas.lockAlunos.push(id); return fn({}); },
    existsAluno: async () => true,
    findAll: async () => [],
    findEntradasDesde: async () => [],
  });
  return { service: freshRequire("modules/acesso/acesso.service.js"), chamadas };
}

const rejeita = (p, status, trecho) =>
  assert.rejects(p, (err) => err.status === status && (!trecho || err.message.includes(trecho)));

test("CPF inválido -> 400", async () => {
  const { service } = montar();
  await rejeita(service.registrar({ identificador: "123", tipo: "entrada" }), 400, "CPF inválido");
});

test("tipo ausente/inválido -> 400", async () => {
  const { service } = montar();
  await rejeita(service.registrar({ identificador: CPF }), 400, "tipo");
  await rejeita(service.registrar({ identificador: CPF, tipo: "xyz" }), 400, "tipo");
});

test("CPF sem aluno -> 404 e nada é gravado", async () => {
  const { service, chamadas } = montar({ aluno: null });
  await rejeita(service.registrar({ identificador: CPF, tipo: "entrada" }), 404, "CPF não encontrado");
  assert.equal(chamadas.bloqueios + chamadas.entradas, 0);
});

test("busca o CPF com e sem máscara", async () => {
  const { service, chamadas } = montar();
  await service.registrar({ identificador: "12345678901", tipo: "entrada" });
  assert.deepEqual(chamadas.cpfCandidatos.sort(), ["123.456.789-01", "12345678901"].sort());
});

test("entrada liberada -> 'entrada', grava 1 registro, usa lock do aluno", async () => {
  const { service, chamadas } = montar();
  const r = await service.registrar({ identificador: CPF, tipo: "entrada" });
  assert.equal(r.tipo, "entrada");
  assert.equal(r.mensagem, "Entrada registrada com sucesso.");
  assert.equal(r.aluno.nome, "Maria");
  assert.equal(r.acesso.tipo_acesso, "entrada");
  assert.equal(chamadas.entradas, 1);
  assert.deepEqual(chamadas.lockAlunos, ["a1"]);
});

test("aluno inativo -> 403 e registra 'bloqueado'", async () => {
  const { service, chamadas } = montar({ aluno: { id: "a1", status: "Inativo", pessoa: { nome: "M", cpf: CPF } } });
  await rejeita(service.registrar({ identificador: CPF, tipo: "entrada" }), 403, "aluno inativo");
  assert.equal(chamadas.bloqueios, 1);
  assert.equal(chamadas.entradas, 0);
});

test("sem assinatura ativa -> 403 e registra 'bloqueado'", async () => {
  const { service, chamadas } = montar({ assinaturas: [{ statusAssinatura: "Cancelado", dataInicio: null, dataFim: null }] });
  await rejeita(service.registrar({ identificador: CPF, tipo: "entrada" }), 403, "sem assinatura ativa");
  assert.equal(chamadas.bloqueios, 1);
});

test("entrada já aberta -> 409 sem novo registro", async () => {
  const { service, chamadas } = montar({ entradaAberta: { id: "e1" } });
  await rejeita(service.registrar({ identificador: CPF, tipo: "entrada" }), 409, "entrada aberta");
  assert.equal(chamadas.entradas + chamadas.bloqueios, 0);
});

test("saiu há 1 min -> 429 pedindo 4 min", async () => {
  const { service } = montar({ ultimaSaida: { horaSaida: new Date(Date.now() - 60_000) } });
  await rejeita(service.registrar({ identificador: CPF, tipo: "entrada" }), 429, "Aguarde 4 minuto(s)");
});

test("saiu há 10 min -> libera", async () => {
  const { service } = montar({ ultimaSaida: { horaSaida: new Date(Date.now() - 600_000) } });
  assert.equal((await service.registrar({ identificador: CPF, tipo: "entrada" })).tipo, "entrada");
});

test("saída com entrada aberta -> fecha; aceita 'saída' com acento", async () => {
  const { service, chamadas } = montar({ entradaAberta: { id: "e1" } });
  const r = await service.registrar({ identificador: CPF, tipo: "saída" });
  assert.equal(r.tipo, "saida");
  assert.equal(r.acesso.id, "e1");
  assert.ok(r.acesso.hora_saida);
  assert.equal(chamadas.saidas, 1);
});

test("saída sem entrada aberta -> 409", async () => {
  const { service } = montar();
  await rejeita(service.registrar({ identificador: CPF, tipo: "saida" }), 409, "não possui uma entrada aberta");
});

test("saída é permitida a aluno inativo (só exige entrada aberta)", async () => {
  const { service } = montar({ aluno: { id: "a1", status: "Inativo", pessoa: { nome: "M", cpf: CPF } }, entradaAberta: { id: "e1" } });
  assert.equal((await service.registrar({ identificador: CPF, tipo: "saida" })).tipo, "saida");
});

test("possuiAssinaturaVigente: vigência e variações de status", () => {
  const { service } = montar();
  const f = service.possuiAssinaturaVigente;
  const hoje = "2026-10-20";
  assert.equal(f([{ statusAssinatura: " ATIVA ", dataInicio: dia("2026-10-01"), dataFim: dia("2026-10-20") }], hoje), true);
  assert.equal(f([{ statusAssinatura: "Ativo", dataInicio: dia("2026-10-21"), dataFim: null }], hoje), false); // ainda não começou
  assert.equal(f([{ statusAssinatura: "Ativo", dataInicio: null, dataFim: dia("2026-10-19") }], hoje), false); // venceu ontem
  assert.equal(f([{ statusAssinatura: "Inadimplente", dataInicio: null, dataFim: null }], hoje), false);
  assert.equal(f([], hoje), false);
});

test("filtros da listagem: validação", async () => {
  const { service } = montar();
  await rejeita(service.listar({ tipo: "x" }), 400, "tipo inválido");
  await rejeita(service.listar({ dataInicio: "2026-13-45" }), 400);
  await rejeita(service.listar({ dataInicio: "2026-10-20", dataFim: "2026-10-01" }), 400, "posterior");
  await rejeita(service.listar({ limit: "0" }), 400, "limit");
  assert.deepEqual(await service.listar({ tipo: "entrada", limit: "10" }), []);
});

test("listarPorAluno: aluno inexistente -> 404", async () => {
  const { service } = montar();
  stubModule("modules/acesso/acesso.repository.js", { existsAluno: async () => false });
  const s2 = freshRequire("modules/acesso/acesso.service.js");
  await rejeita(s2.listarPorAluno("a1"), 404, "Aluno não encontrado");
});

test("estatisticasDashboard: hoje, 7 dias, pico — contados no fuso de São Paulo", async () => {
  const { todayISO } = require("../src/utils/date");
  const hoje = todayISO();
  const { startOfDay, addDaysISO } = require("../src/utils/date");
  const h = (iso, hora) => new Date(startOfDay(iso).getTime() + hora * 3600_000 + 60_000);
  const entradas = [
    h(hoje, 7), h(hoje, 18), h(hoje, 18), h(hoje, 18), // pico às 18h
    h(addDaysISO(hoje, -1), 9),
    h(addDaysISO(hoje, -6), 10),
  ];
  stubModule("modules/acesso/acesso.repository.js", { findEntradasDesde: async () => entradas });
  const s = freshRequire("modules/acesso/acesso.service.js");
  const r = await s.estatisticasDashboard();
  assert.equal(r.acessosHoje, 4);
  assert.equal(r.frequenciaTotal, 6);
  assert.equal(r.horarioPico, "18:00");
  assert.equal(r.frequenciaSemanal.length, 7);
  assert.equal(r.frequenciaSemanal[6].data, hoje);
  assert.equal(r.frequenciaSemanal[0].total, 1);
});

test("estatisticasDashboard: sem entradas -> zeros e '-'", async () => {
  stubModule("modules/acesso/acesso.repository.js", { findEntradasDesde: async () => [] });
  const r = await freshRequire("modules/acesso/acesso.service.js").estatisticasDashboard();
  assert.equal(r.acessosHoje, 0);
  assert.equal(r.horarioPico, "-");
});
