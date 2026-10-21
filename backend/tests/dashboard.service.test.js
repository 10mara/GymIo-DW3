const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

function montar({ receita = 0, anterior = 0 } = {}) {
  stubModule("modules/pessoas/pessoas.service.js", {
    contarAlunosAtivos: async () => 42,
    indicadores: async () => ({ novosMes: 5, cancelamentos: 1, crescimento: 25 }),
  });
  stubModule("modules/acesso/acesso.service.js", {
    estatisticasDashboard: async () => ({ acessosHoje: 9, frequenciaTotal: 30, frequenciaSemanal: [], horarioPico: "18:00" }),
  });
  let n = 0;
  stubModule("modules/dashboard/dashboard.repository.js", {
    countInadimplentes: async () => 3,
    countVencendoEm: async () => 2,
    countAssinaturas: async () => 8,
    countAssinaturasAtivas: async () => 6,
    findUltimasMatriculas: async () => [
      { id: "s1", dataAssinatura: null, aluno: { pessoa: { nome: "João da Silva" } }, plano: { nomePlano: "Premium" } },
    ],
    somarReceitas: async () => (n++ === 0 ? receita : anterior),
    somarDespesas: async () => 400,
  });
  return freshRequire("modules/dashboard/dashboard.service.js");
}

test("resumo mantém o contrato que a tela Dashboard consome", async () => {
  const r = await montar({ receita: 1500, anterior: 1000 }).resumo();
  assert.deepEqual(Object.keys(r).sort(), [
    "acessosHoje", "alunosAtivos", "alunosAtivosMudanca", "atividades", "frequenciaSemanal", "frequenciaTotal",
    "horarioPico", "inadimplentes", "inadimplentesMudanca", "receitaMensal", "receitaMudanca", "taxaRetencao", "vencendoHoje",
  ]);
  assert.equal(r.alunosAtivos, 42);
  assert.equal(r.alunosAtivosMudanca, "+25%");
  assert.equal(r.receitaMensal, "1.500,00");
  assert.equal(r.receitaMudanca, "+50%");
  assert.equal(r.taxaRetencao, "75%");
  assert.equal(r.inadimplentes, 3);
  assert.equal(r.vencendoHoje, 2);
  assert.equal(r.acessosHoje, 9);
  assert.equal(r.atividades[0].iniciais, "JD");
  assert.equal(r.atividades[0].acao, "Nova matrícula - Premium");
});

test("financeiro: saldo = receitas - despesas do mês", async () => {
  const r = await montar({ receita: 1500 }).financeiro();
  assert.equal(r.saldoMensalValor, 1100);
  assert.equal(r.despesaMensalValor, 400);
});

test("variacao: base zero, queda e estabilidade", () => {
  const { variacao } = montar();
  assert.equal(variacao(100, 0), "+100%");
  assert.equal(variacao(0, 0), "0%");
  assert.equal(variacao(50, 100), "-50%");
  assert.equal(variacao(100, 100), "0%");
});
