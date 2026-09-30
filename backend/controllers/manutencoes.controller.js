const supabase = require("../config/supabase");


function mapManutencao(item) {
  return {
    id: item.id,
    equipamento_id: item.equipamento_id,
    equipamento: item.equipamento?.nome_equipamento || "",
    tipo: item.tipo_manutencao || "Preventiva",
    data: item.data_manutencao || "",
    tecnico: item.tecnico || "",
    valorPrevisto: item.custo || "0",
    observacoes: item.descricao_servico || "",
  };
}

async function listarManutencoes(req, res) {
  try {
    const { data, error } = await supabase
      .from("manutencao_equipamento")
      .select(`
        id,
        equipamento_id,
        tipo_manutencao,
        data_manutencao,
        tecnico,
        custo,
        descricao_servico,
        equipamento:equipamento_id (
          nome_equipamento
        )
      `)
      .is("deleted_at", null)
      .order("data_manutencao", { ascending: false });

    if (error) throw error;

    res.json((data || []).map(mapManutencao));
  } catch (erro) {
    console.error("Erro ao listar manutenções:", erro);
    res.status(500).json({ erro: "Erro ao listar manutenções" });
  }
}

async function criarManutencao(req, res) {
  try {
    const { equipamento_id, equipamento, tipo, data, tecnico, valorPrevisto, observacoes } = req.body;

    let equipamentoId = equipamento_id;

    if (!equipamentoId && equipamento) {
      const { data: eq } = await supabase
        .from("equipamento")
        .select("id")
        .eq("nome_equipamento", equipamento)
        .is("deleted_at", null)
        .single();

      equipamentoId = eq?.id;
    }

    if (!equipamentoId) {
      return res.status(400).json({ erro: "Equipamento é obrigatório" });
    }

    const { data: nova, error } = await supabase
      .from("manutencao_equipamento")
      .insert([{
        equipamento_id: equipamentoId,
        tipo_manutencao: tipo,
        data_manutencao: data || null,
        tecnico,
        custo: valorPrevisto || 0,
        descricao_servico: observacoes,
      }])
      .select(`
        id,
        equipamento_id,
        tipo_manutencao,
        data_manutencao,
        tecnico,
        custo,
        descricao_servico,
        equipamento:equipamento_id (
          nome_equipamento
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json(mapManutencao(nova));
  } catch (erro) {
    console.error("Erro ao criar manutenção:", erro);
    res.status(500).json({ erro: "Erro ao criar manutenção" });
  }
}

async function atualizarManutencao(req, res) {
  try {
    const { id } = req.params;
    const { tipo, data, tecnico, valorPrevisto, observacoes } = req.body;

    const { data: atualizada, error } = await supabase
      .from("manutencao_equipamento")
      .update({
        tipo_manutencao: tipo,
        data_manutencao: data || null,
        tecnico,
        custo: valorPrevisto || 0,
        descricao_servico: observacoes,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select(`
        id,
        equipamento_id,
        tipo_manutencao,
        data_manutencao,
        tecnico,
        custo,
        descricao_servico,
        equipamento:equipamento_id (
          nome_equipamento
        )
      `)
      .single();

    if (error) throw error;

    res.json(mapManutencao(atualizada));
  } catch (erro) {
    console.error("Erro ao atualizar manutenção:", erro);
    res.status(500).json({ erro: "Erro ao atualizar manutenção" });
  }
}

async function excluirManutencao(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("manutencao_equipamento")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    res.json({ mensagem: "Manutenção excluída com sucesso" });
  } catch (erro) {
    console.error("Erro ao excluir manutenção:", erro);
    res.status(500).json({ erro: "Erro ao excluir manutenção" });
  }
}

module.exports = {
  listarManutencoes,
  criarManutencao,
  atualizarManutencao,
  excluirManutencao,
};