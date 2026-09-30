const supabase = require("../config/supabase");

function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function periodoTexto(inicio, fim) {
  if (!inicio && !fim) return "Todos os registros";
  return `${formatarData(inicio)} até ${formatarData(fim)}`;
}

function filtrarPeriodo(query, campo, inicio, fim, isTimestamp = false) {
  if (inicio) query = query.gte(campo, isTimestamp ? `${inicio}T00:00:00` : inicio);
  if (fim) query = query.lte(campo, isTimestamp ? `${fim}T23:59:59` : fim);
  return query;
}

async function gerarRelatorioAlunos(inicio, fim) {
  let query = supabase
    .from("aluno")
    .select(`
      id,
      status,
      data_matricula,
      pessoa:pessoa_id (
        nome,
        cpf,
        telefone,
        email
      )
    `)
    .is("deleted_at", null);

  query = filtrarPeriodo(query, "data_matricula", inicio, fim);

  const { data, error } = await query;
  if (error) throw error;

  return {
    titulo: "Relatório de Alunos",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      { label: "Total de alunos", valor: data.length },
      {
        label: "Alunos ativos",
        valor: data.filter((item) => item.status?.toLowerCase() === "ativo").length,
      },
      {
        label: "Alunos inativos",
        valor: data.filter((item) => item.status?.toLowerCase() === "inativo").length,
      },
    ],
    colunas: ["Nome", "CPF", "Telefone", "E-mail", "Status", "Matrícula"],
    tabela: data.map((item) => [
      item.pessoa?.nome || "-",
      item.pessoa?.cpf || "-",
      item.pessoa?.telefone || "-",
      item.pessoa?.email || "-",
      item.status || "-",
      formatarData(item.data_matricula),
    ]),
  };
}

async function gerarRelatorioReceita(inicio, fim) {
  let query = supabase
    .from("movimentacao_financeira")
    .select("tipo_movimentacao, valor, data_movimentacao, descricao")
    .is("deleted_at", null);

  query = filtrarPeriodo(query, "data_movimentacao", inicio, fim, true);

  const { data, error } = await query;
  if (error) throw error;

  const entradas = data
    .filter((item) => item.tipo_movimentacao?.toLowerCase() === "entrada")
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const saidas = data
    .filter((item) => item.tipo_movimentacao?.toLowerCase() === "saida")
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  return {
    titulo: "Relatório de Receita",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      { label: "Entradas", valor: formatarMoeda(entradas) },
      { label: "Saídas", valor: formatarMoeda(saidas) },
      { label: "Saldo", valor: formatarMoeda(entradas - saidas) },
    ],
    colunas: ["Tipo", "Valor", "Data", "Descrição"],
    tabela: data.map((item) => [
      item.tipo_movimentacao || "-",
      formatarMoeda(item.valor),
      formatarData(item.data_movimentacao),
      item.descricao || "-",
    ]),
  };
}

async function gerarRelatorioInadimplencia(inicio, fim) {
  let query = supabase
    .from("assinatura")
    .select(`
      id,
      status_assinatura,
      data_inicio,
      data_fim,
      aluno:aluno_id (
        pessoa:pessoa_id (
          nome,
          cpf,
          telefone,
          email
        )
      ),
      plano:plano_id (
        nome_plano,
        valor
      )
    `)
    .ilike("status_assinatura", "Inadimplente")
    .is("deleted_at", null);

  query = filtrarPeriodo(query, "data_inicio", inicio, fim);

  const { data, error } = await query;
  if (error) throw error;

  const total = data.reduce((soma, item) => soma + Number(item.plano?.valor || 0), 0);

  return {
    titulo: "Relatório de Inadimplência",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      { label: "Total inadimplente", valor: data.length },
      { label: "Valor em atraso", valor: formatarMoeda(total) },
    ],
    colunas: ["Aluno", "CPF", "Telefone", "E-mail", "Plano", "Valor", "Status"],
    tabela: data.map((item) => [
      item.aluno?.pessoa?.nome || "-",
      item.aluno?.pessoa?.cpf || "-",
      item.aluno?.pessoa?.telefone || "-",
      item.aluno?.pessoa?.email || "-",
      item.plano?.nome_plano || "-",
      formatarMoeda(item.plano?.valor),
      item.status_assinatura || "-",
    ]),
  };
}

async function gerarRelatorioFrequencia(inicio, fim) {
  let query = supabase
    .from("acesso")
    .select(`
      tipo_acesso,
      data_hora_acesso,
      aluno:aluno_id (
        pessoa:pessoa_id (
          nome
        )
      )
    `)
    .is("deleted_at", null);

  query = filtrarPeriodo(query, "data_hora_acesso", inicio, fim, true);

  const { data, error } = await query;
  if (error) throw error;

  return {
    titulo: "Relatório de Frequência",
    periodo: periodoTexto(inicio, fim),
    resumo: [{ label: "Total de acessos", valor: data.length }],
    colunas: ["Aluno", "Tipo", "Data/Hora"],
    tabela: data.map((item) => [
      item.aluno?.pessoa?.nome || "-",
      item.tipo_acesso || "-",
      formatarData(item.data_hora_acesso),
    ]),
  };
}

async function gerarRelatorioEquipamentos() {
  const { data, error } = await supabase
    .from("equipamento")
    .select("nome_equipamento, data_aquisicao, status_conservacao")
    .is("deleted_at", null);

  if (error) throw error;

  return {
    titulo: "Relatório de Equipamentos",
    periodo: "Todos os registros",
    resumo: [{ label: "Total de equipamentos", valor: data.length }],
    colunas: ["Equipamento", "Data de Aquisição", "Status"],
    tabela: data.map((item) => [
      item.nome_equipamento || "-",
      formatarData(item.data_aquisicao),
      item.status_conservacao || "-",
    ]),
  };
}

async function gerarRelatorioGeral(inicio, fim) {
  const alunos = await gerarRelatorioAlunos(inicio, fim);
  const receita = await gerarRelatorioReceita(inicio, fim);
  const frequencia = await gerarRelatorioFrequencia(inicio, fim);
  const equipamentos = await gerarRelatorioEquipamentos();

  return {
    titulo: "Relatório Geral",
    periodo: periodoTexto(inicio, fim),
    resumo: [
      ...alunos.resumo,
      ...receita.resumo,
      ...frequencia.resumo,
      ...equipamentos.resumo,
    ],
    colunas: ["Indicador", "Valor"],
    tabela: [
      ...alunos.resumo.map((item) => [item.label, item.valor]),
      ...receita.resumo.map((item) => [item.label, item.valor]),
      ...frequencia.resumo.map((item) => [item.label, item.valor]),
      ...equipamentos.resumo.map((item) => [item.label, item.valor]),
    ],
  };
}

async function gerarRelatorio(req, res) {
  try {
    const { tipo } = req.params;
    const { inicio, fim } = req.query;

    let relatorio;

    if (tipo === "alunos") {
      relatorio = await gerarRelatorioAlunos(inicio, fim);
    } else if (tipo === "receita" || tipo === "financeiro") {
      relatorio = await gerarRelatorioReceita(inicio, fim);
    } else if (tipo === "inadimplencia") {
      relatorio = await gerarRelatorioInadimplencia(inicio, fim);
    } else if (tipo === "frequencia" || tipo === "acessos") {
      relatorio = await gerarRelatorioFrequencia(inicio, fim);
    } else if (tipo === "equipamentos") {
      relatorio = await gerarRelatorioEquipamentos();
    } else if (tipo === "geral") {
      relatorio = await gerarRelatorioGeral(inicio, fim);
    } else {
      return res.status(400).json({
        erro: "Tipo de relatório inválido",
      });
    }

    return res.json(relatorio);
  } catch (erro) {
    console.error("Erro ao gerar relatório:", erro);

    return res.status(500).json({
      erro: "Erro ao gerar relatório",
      detalhe: erro.message,
    });
  }
}

module.exports = {
  gerarRelatorio,
};