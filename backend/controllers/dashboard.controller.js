const supabase = require("../config/supabase");

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR");
}

function gerarIniciais(nome = "") {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function buscarDashboard(req, res) {
  try {
    const hoje = new Date().toISOString().slice(0, 10);

    const { count: alunosAtivos } = await supabase
      .from("aluno")
      .select("*", { count: "exact", head: true })
      .ilike("status", "ativo")
      .is("deleted_at", null);

    const { count: inadimplentes } = await supabase
      .from("assinatura")
      .select("*", { count: "exact", head: true })
      .ilike("status_assinatura", "inadimplente")
      .is("deleted_at", null);

    const { count: acessosHoje } = await supabase
      .from("acesso")
      .select("*", { count: "exact", head: true })
      .gte("data_hora_acesso", `${hoje}T00:00:00`)
      .lte("data_hora_acesso", `${hoje}T23:59:59`)
      .is("deleted_at", null);

    const { count: vencendoHoje } = await supabase
      .from("assinatura")
      .select("*", { count: "exact", head: true })
      .eq("data_fim", hoje)
      .is("deleted_at", null);

    const { data: movimentacoes, error: erroMovimentacoes } = await supabase
      .from("movimentacao_financeira")
      .select("tipo_movimentacao, valor")
      .is("deleted_at", null);

    if (erroMovimentacoes) throw erroMovimentacoes;

    const receitaTotal = (movimentacoes || [])
      .filter((item) => item.tipo_movimentacao?.toLowerCase() === "entrada")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
      
    const { data: acessosSemana } = await supabase
      .from("acesso")
      .select("id")
      .gte("data_hora_acesso", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is("deleted_at", null);

    const frequenciaTotal = acessosSemana?.length || 0;

    const { data: acessosHojeLista } = await supabase
      .from("acesso")
      .select("data_hora_acesso")
      .gte("data_hora_acesso", `${hoje}T00:00:00`)
      .lte("data_hora_acesso", `${hoje}T23:59:59`)
      .is("deleted_at", null);

    let horarioPico = "-";

    if (acessosHojeLista && acessosHojeLista.length > 0) {
      const contagemHoras = {};

      acessosHojeLista.forEach((acesso) => {
        const hora = new Date(acesso.data_hora_acesso).getHours();
        contagemHoras[hora] = (contagemHoras[hora] || 0) + 1;
      });

      const horaMaisMovimentada = Object.keys(contagemHoras).sort(
        (a, b) => contagemHoras[b] - contagemHoras[a]
      )[0];

      horarioPico = `${String(horaMaisMovimentada).padStart(2, "0")}:00`;
    }

    const { count: totalAssinaturas } = await supabase
      .from("assinatura")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    const { count: assinaturasAtivasCount } = await supabase
        .from("assinatura")
        .select("*", { count: "exact", head: true })
        .ilike("status_assinatura", "Ativo")
        .is("deleted_at", null);

    const taxaRetencao =
      totalAssinaturas > 0
        ? `${Math.round((assinaturasAtivasCount / totalAssinaturas) * 100)}%`
        : "0%";

    const { data: atividadesBanco } = await supabase
      .from("assinatura")
      .select(`
        id,
        data_assinatura,
        aluno:aluno_id (
          pessoa:pessoa_id (
            nome
          )
        ),
        plano:plano_id (
          nome_plano
        )
      `)
      .is("deleted_at", null)
      .order("data_assinatura", { ascending: false })
      .limit(5);

    const atividades = (atividadesBanco || []).map((item) => {
      const nome = item.aluno?.pessoa?.nome || "Aluno";
      const plano = item.plano?.nome_plano || "Plano";

      return {
        id: item.id,
        nome,
        acao: `Nova matrícula - ${plano}`,
        tempo: "Recente",
        iniciais: gerarIniciais(nome),
        classe: "matricula",
      };
    });

    res.json({
      alunosAtivos: alunosAtivos || 0,
      alunosAtivosMudanca: "0%",

      receitaMensal: formatarMoeda(receitaTotal),
      receitaMudanca: "0%",

      inadimplentes: inadimplentes || 0,
      inadimplentesMudanca: "0",

      acessosHoje: acessosHoje || 0,

      frequenciaTotal,

      horarioPico,

      taxaRetencao,

      vencendoHoje: vencendoHoje || 0,

      atividades,
    });
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);

    res.status(500).json({
      erro: "Erro ao carregar dashboard",
    });
  }
}

module.exports = {
  buscarDashboard,
};