const { stubModule, freshRequire } = require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");

function montar({ receita = 0, anterior = 0, dataAssinatura = null } = {}) {
  const chamadas = { countInadimplentes: 0 };
  stubModule("modules/pessoas/pessoas.service.js", {
    contarAlunosAtivos: async () => 42,
    indicadores: async () => ({ novosMes: 5, cancelamentos: 1, crescimento: 25 }),
    resumoDashboard: async () => ({
      alunosAtivos: 42,
      novosMes: 5,
      cancelamentos: 1,
      crescimento: 25,
    }),
  });
  stubModule("modules/acesso/acesso.service.js", {
    estatisticasDashboard: async () => ({ acessosHoje: 9, frequenciaTotal: 30, frequenciaSemanal: [], horarioPico: "18:00" }),
  });
  let n = 0;
  stubModule("modules/dashboard/dashboard.repository.js", {
    countInadimplentes: async () => {
      chamadas.countInadimplentes++;
      return 3;
    },
    countVencendoEm: async () => 2,
    countAssinaturas: async () => 8,
    countAssinaturasAtivas: async () => 6,
    findUltimasMatriculas: async () => [
      { id: "s1", dataAssinatura, aluno: { pessoa: { nome: "João da Silva" } }, plano: { nomePlano: "Premium" } },
    ],
    somarReceitas: async () => (n++ === 0 ? receita : anterior),
    somarDespesas: async () => 400,
    resumoFinanceiro: async () => ({
      receita,
      receitaAnterior: anterior,
      despesa: 400,
    }),
    resumoAssinaturas: async () => ({
      total: 8,
      ativas: 6,
      inadimplentes: 3,
      vencendoHoje: 2,
    }),
  });
  return { service: freshRequire("modules/dashboard/dashboard.service.js"), chamadas };
}

test("resumo mantém o contrato que a tela Dashboard consome", async () => {
  const { service, chamadas } = montar({ receita: 1500, anterior: 1000 });
  const r = await service.resumo();
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
  assert.equal(r.inadimplentesMudanca, "—");
  assert.equal(r.vencendoHoje, 2);
  assert.equal(r.acessosHoje, 9);
  assert.equal(r.atividades[0].iniciais, "JD");
  assert.equal(r.atividades[0].acao, "Nova matrícula - Premium");
  assert.equal(chamadas.countInadimplentes, 0);
});

test("financeiro: saldo = receitas - despesas do mês", async () => {
  const { service, chamadas } = montar({ receita: 1500 });
  const r = await service.financeiro();
  assert.equal(r.saldoMensalValor, 1100);
  assert.equal(r.despesaMensalValor, 400);
  assert.equal(chamadas.countInadimplentes, 1);
});

test("variacao: base zero, queda e estabilidade", () => {
  const { service } = montar();
  const { variacao } = service;
  assert.equal(variacao(100, 0), "+100%");
  assert.equal(variacao(0, 0), "0%");
  assert.equal(variacao(50, 100), "-50%");
  assert.equal(variacao(100, 100), "0%");
});

test("atividade com data inválida não derruba os indicadores de alunos", async () => {
  const { service } = montar({ dataAssinatura: new Date(NaN) });
  const r = await service.alunos();
  assert.equal(r.atividades[0].tempo, "Recente");
});
