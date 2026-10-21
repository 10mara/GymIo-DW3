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
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return "Recente";
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
    repository.findUltimasMatriculas(5, parseDateOnly(hoje)),
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
    inadimplentesMudanca: "—",
    vencendoHoje,
    taxaRetencao: total > 0 ? `${Math.round((ativas / total) * 100)}%` : "0%",
    atividades,
  };
}

async function financeiro({ incluirInadimplentes = true } = {}) {
  const hoje = todayISO();
  const inicioMes = startOfDay(firstDayOfMonthISO(hoje));
  const inicioProximo = startOfDay(firstDayOfMonthISO(hoje, 1));
  const inicioAnterior = startOfDay(firstDayOfMonthISO(hoje, -1));

  const consultas = [
    repository.somarReceitas(inicioMes, inicioProximo),
    repository.somarReceitas(inicioAnterior, inicioMes),
    repository.somarDespesas(inicioMes, inicioProximo),
  ];
  if (incluirInadimplentes) consultas.push(repository.countInadimplentes());
  const [receita, receitaAnterior, despesa, inadimplentes] = await Promise.all(consultas);

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
  const hoje = todayISO();
  const inicioMes = startOfDay(firstDayOfMonthISO(hoje));
  const inicioProximo = startOfDay(firstDayOfMonthISO(hoje, 1));
  const inicioAnterior = startOfDay(firstDayOfMonthISO(hoje, -1));

  const [a, f, assinaturas, acessos, ultimas] = await Promise.all([
    pessoasService.resumoDashboard(),
    repository.resumoFinanceiro(inicioMes, inicioProximo, inicioAnterior),
    repository.resumoAssinaturas(parseDateOnly(hoje)),
    acessoService.estatisticasDashboard(),
    repository.findUltimasMatriculas(5, parseDateOnly(hoje)),
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

  return {
    alunosAtivos: a.alunosAtivos,
    alunosAtivosMudanca: `${a.crescimento > 0 ? "+" : ""}${a.crescimento}%`,

    receitaMensal: moeda(f.receita),
    receitaMudanca: variacao(Number(f.receita), Number(f.receitaAnterior)),

    inadimplentes: assinaturas.inadimplentes,
    inadimplentesMudanca: "—",

    acessosHoje: acessos.acessosHoje,
    frequenciaTotal: acessos.frequenciaTotal,
    frequenciaSemanal: acessos.frequenciaSemanal,
    horarioPico: acessos.horarioPico,

    taxaRetencao: assinaturas.total > 0
      ? `${Math.round((assinaturas.ativas / assinaturas.total) * 100)}%`
      : "0%",
    vencendoHoje: assinaturas.vencendoHoje,

    atividades,
  };
}

module.exports = { resumo, alunos, financeiro, variacao };
