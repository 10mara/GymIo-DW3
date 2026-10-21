const { todayISO, parseDateOnly, startOfDay, firstDayOfMonthISO, formatDateOnly, addDaysISO } = require("../../utils/date");
const repository = require("./dashboard.repository");
const pessoasService = require("../pessoas/pessoas.service");
const acessoService = require("../acesso/acesso.service");

/* ------------------------------ formatação ------------------------------ */

const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Variação percentual com sinal ("+12%", "-5%", "0%"). Base zero: +100% se cresceu, 0% se não. */
function variacao(atual, anterior) {
  let pct = 0;
  if (anterior > 0) pct = ((atual - anterior) / anterior) * 100;
  else if (atual > 0) pct = 100;
  const arredondado = Math.round(pct);
  return `${arredondado > 0 ? "+" : ""}${arredondado}%`;
}

const iniciais = (nome = "") =>
  nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function tempoRelativo(data, hoje) {
  const iso = formatDateOnly(data);
  if (!iso) return "Recente";
  if (iso === hoje) return "Hoje";
  if (iso === addDaysISO(hoje, -1)) return "Ontem";
  const dias = Math.round((Date.parse(hoje) - Date.parse(iso)) / 86400000);
  return dias > 0 ? `Há ${dias} dias` : "Recente";
}

/* ------------------------------ blocos ------------------------------ */

async function alunos() {
  const hoje = todayISO();
  const [alunosAtivos, indicadoresMes, inadimplentes, vencendoHoje, total, ativas, ultimas] = await Promise.all([
    pessoasService.contarAlunosAtivos(),
    pessoasService.indicadores(),
    repository.countInadimplentes(),
    repository.countVencendoEm(parseDateOnly(hoje)),
    repository.countAssinaturas(),
    repository.countAssinaturasAtivas(),
    repository.findUltimasMatriculas(5),
  ]);

  const atividades = ultimas.map((item) => {
    const nome = item.aluno?.pessoa?.nome || "Aluno";
    return {
      id: item.id,
      nome,
      acao: `Nova matrícula - ${item.plano?.nomePlano || "Plano"}`,
      tempo: tempoRelativo(item.dataAssinatura, hoje),
      iniciais: iniciais(nome),
      classe: "matricula",
    };
  });

  const { crescimento } = indicadoresMes;

  return {
    alunosAtivos,
    // Mesma métrica "crescimento" da tela de Alunos (novos alunos vs. mês anterior).
    alunosAtivosMudanca: `${crescimento > 0 ? "+" : ""}${crescimento}%`,
    novosMes: indicadoresMes.novosMes,
    cancelamentos: indicadoresMes.cancelamentos,
    inadimplentes,
    // Sem histórico de inadimplência no banco não há como comparar com o mês anterior.
    inadimplentesMudanca: "0",
    vencendoHoje,
    taxaRetencao: total > 0 ? `${Math.round((ativas / total) * 100)}%` : "0%",
    atividades,
  };
}

async function financeiro() {
  const hoje = todayISO();
  const inicioMes = startOfDay(firstDayOfMonthISO(hoje));
  const inicioProximo = startOfDay(firstDayOfMonthISO(hoje, 1));
  const inicioAnterior = startOfDay(firstDayOfMonthISO(hoje, -1));

  const [receita, receitaAnterior, despesa, inadimplentes] = await Promise.all([
    repository.somarReceitas(inicioMes, inicioProximo),
    repository.somarReceitas(inicioAnterior, inicioMes),
    repository.somarDespesas(inicioMes, inicioProximo),
    repository.countInadimplentes(),
  ]);

  return {
    receitaMensal: moeda(receita),
    receitaMensalValor: receita,
    receitaMudanca: variacao(receita, receitaAnterior),
    despesaMensalValor: despesa,
    saldoMensalValor: receita - despesa,
    inadimplentes,
  };
}

/** Payload completo da tela Dashboard: compõe alunos + financeiro + acesso (sem duplicar consultas). */
async function resumo() {
  const [a, f, acessos] = await Promise.all([alunos(), financeiro(), acessoService.estatisticasDashboard()]);

  return {
    alunosAtivos: a.alunosAtivos,
    alunosAtivosMudanca: a.alunosAtivosMudanca,

    receitaMensal: f.receitaMensal,
    receitaMudanca: f.receitaMudanca,

    inadimplentes: a.inadimplentes,
    inadimplentesMudanca: a.inadimplentesMudanca,

    acessosHoje: acessos.acessosHoje,
    frequenciaTotal: acessos.frequenciaTotal,
    frequenciaSemanal: acessos.frequenciaSemanal,
    horarioPico: acessos.horarioPico,

    taxaRetencao: a.taxaRetencao,
    vencendoHoje: a.vencendoHoje,

    atividades: a.atividades,
  };
}

module.exports = { resumo, alunos, financeiro, variacao };
