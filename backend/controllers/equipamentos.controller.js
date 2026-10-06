const { eq, isNull, asc } = require("drizzle-orm");

const { db } = require("../db");
const { equipamento } = require("../db/schema");

function mapEquipamentoBancoParaFront(item) {
  return {
    id: item.id,
    nome: item.nomeEquipamento || "",
    codigo: item.codigo || "",
    categoria: item.categoria || "",
    fabricante: item.fabricante || "",
    modelo: item.modelo || "",
    dataCompra: item.dataAquisicao || "",
    garantia: item.garantia || "",
    status: item.statusConservacao || "",
    localizacao: item.localizacao || "",
    observacoes: item.observacoes || "",
    ultimaManutencao: "-",
    proximaManutencao: "-",
  };
}

async function listarEquipamentos(req, res) {
  try {
    const data = await db
      .select()
      .from(equipamento)
      .where(isNull(equipamento.deletedAt))
      .orderBy(asc(equipamento.nomeEquipamento));

    return res.json(
      data.map(mapEquipamentoBancoParaFront)
    );
  } catch (erro) {
    console.error(
      "Erro ao listar equipamentos:",
      erro
    );

    return res.status(500).json({
      erro: "Erro ao listar equipamentos",
    });
  }
}

async function buscarEquipamentoPorId(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    const resultado = await db
      .select()
      .from(equipamento)
      .where(
        eq(equipamento.id, id)
      );

    if (
      resultado.length === 0 ||
      resultado[0].deletedAt !== null
    ) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

    return res.json(
      mapEquipamentoBancoParaFront(resultado[0])
    );
  } catch (erro) {
    console.error(
      "Erro ao buscar equipamento:",
      erro
    );

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

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "Nome do equipamento é obrigatório",
      });
    }

    const resultado = await db
      .insert(equipamento)
      .values({
        nomeEquipamento: nome.trim(),
        codigo: codigo || null,
        categoria: categoria || null,
        fabricante: fabricante || null,
        modelo: modelo || null,
        dataAquisicao: dataCompra || null,
        garantia: garantia || null,
        statusConservacao: status || null,
        localizacao: localizacao || null,
        observacoes: observacoes || null,
      })
      .returning();

    return res.status(201).json(
      mapEquipamentoBancoParaFront(resultado[0])
    );
  } catch (erro) {
    console.error(
      "Erro ao criar equipamento:",
      erro
    );

    return res.status(500).json({
      erro: "Erro ao criar equipamento",
    });
  }
}

async function atualizarEquipamento(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

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

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "Nome do equipamento é obrigatório",
      });
    }

    const resultado = await db
      .update(equipamento)
      .set({
        nomeEquipamento: nome.trim(),
        codigo: codigo || null,
        categoria: categoria || null,
        fabricante: fabricante || null,
        modelo: modelo || null,
        dataAquisicao: dataCompra || null,
        garantia: garantia || null,
        statusConservacao: status || null,
        localizacao: localizacao || null,
        observacoes: observacoes || null,
      })
      .where(
        eq(equipamento.id, id)
      )
      .returning();

    if (resultado.length === 0) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

    return res.json(
      mapEquipamentoBancoParaFront(resultado[0])
    );
  } catch (erro) {
    console.error(
      "Erro ao atualizar equipamento:",
      erro
    );

    return res.status(500).json({
      erro: "Erro ao atualizar equipamento",
    });
  }
}

async function excluirEquipamento(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    const resultado = await db
      .update(equipamento)
      .set({
        deletedAt: new Date(),
      })
      .where(
        eq(equipamento.id, id)
      )
      .returning({
        id: equipamento.id,
      });

    if (resultado.length === 0) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

    return res.json({
      mensagem: "Equipamento excluído com sucesso",
    });
  } catch (erro) {
    console.error(
      "Erro ao excluir equipamento:",
      erro
    );

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