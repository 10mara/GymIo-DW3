const supabase = require("../config/supabase");

function mapEquipamentoBancoParaFront(item) {
  return {
    id: item.id,
    nome: item.nome_equipamento || "",
    codigo: item.codigo || "",
    categoria: item.categoria || "",
    fabricante: item.fabricante || "",
    modelo: item.modelo || "",
    dataCompra: item.data_aquisicao || "",
    garantia: item.garantia || "",
    status: item.status_conservacao || "",
    localizacao: item.localizacao || "",
    observacoes: item.observacoes || "",
    ultimaManutencao: "-",
    proximaManutencao: "-",
  };
}

async function listarEquipamentos(req, res) {
  try {
    const { data, error } = await supabase
      .from("equipamento")
      .select("*")
      .is("deleted_at", null)
      .order("nome_equipamento", { ascending: true });

    if (error) throw error;

    const equipamentos = (data || []).map(mapEquipamentoBancoParaFront);

    return res.json(equipamentos);
  } catch (erro) {
    console.error("Erro ao listar equipamentos:", erro);

    return res.status(500).json({
      erro: "Erro ao listar equipamentos",
    });
  }
}

async function buscarEquipamentoPorId(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("equipamento")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;

    return res.json(mapEquipamentoBancoParaFront(data));
  } catch (erro) {
    console.error("Erro ao buscar equipamento:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar equipamento",
    });
  }
}

async function criarEquipamento(req, res) {
  try {
    const {
      nome,
      codigo,
      categoria,
      fabricante,
      modelo,
      dataCompra,
      garantia,
      status,
      localizacao,
      observacoes,
    } = req.body;

    if (!nome) {
      return res.status(400).json({
        erro: "Nome do equipamento é obrigatório",
      });
    }

    const { data, error } = await supabase
      .from("equipamento")
      .insert([
        {
          nome_equipamento: nome,
          codigo,
          categoria,
          fabricante,
          modelo,
          data_aquisicao: dataCompra || null,
          garantia: garantia || null,
          status_conservacao: status,
          localizacao,
          observacoes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(mapEquipamentoBancoParaFront(data));
  } catch (erro) {
    console.error("Erro ao criar equipamento:", erro);

    return res.status(500).json({
      erro: "Erro ao criar equipamento",
    });
  }
}

async function atualizarEquipamento(req, res) {
  try {
    const { id } = req.params;

    const {
      nome,
      codigo,
      categoria,
      fabricante,
      modelo,
      dataCompra,
      garantia,
      status,
      localizacao,
      observacoes,
    } = req.body;

    const { data, error } = await supabase
      .from("equipamento")
      .update({
        nome_equipamento: nome,
        codigo,
        categoria,
        fabricante,
        modelo,
        data_aquisicao: dataCompra || null,
        garantia: garantia || null,
        status_conservacao: status,
        localizacao,
        observacoes,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;

    return res.json(mapEquipamentoBancoParaFront(data));
  } catch (erro) {
    console.error("Erro ao atualizar equipamento:", erro);

    return res.status(500).json({
      erro: "Erro ao atualizar equipamento",
    });
  }
}

async function excluirEquipamento(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("equipamento")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return res.json({
      mensagem: "Equipamento excluído com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao excluir equipamento:", erro);

    return res.status(500).json({
      erro: "Erro ao excluir equipamento",
    });
  }
}

module.exports = {
  listarEquipamentos,
  buscarEquipamentoPorId,
  criarEquipamento,
  atualizarEquipamento,
  excluirEquipamento,
};