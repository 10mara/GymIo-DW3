const { eq, isNull, asc } = require("drizzle-orm");

const { db } = require("../db");
const { equipamento } = require("../db/schema");

async function listarEquipamentos() {
  return db
    .select()
    .from(equipamento)
    .where(isNull(equipamento.deletedAt))
    .orderBy(asc(equipamento.nomeEquipamento));
}

async function buscarEquipamentoPorId(id) {
  const resultado = await db
    .select()
    .from(equipamento)
    .where(
      eq(equipamento.id, id)
    );

  return resultado[0] || null;
}

async function criarEquipamento(dados) {
  const resultado = await db
    .insert(equipamento)
    .values({
      nomeEquipamento: dados.nomeEquipamento,
      codigo: dados.codigo || null,
      categoria: dados.categoria || null,
      fabricante: dados.fabricante || null,
      modelo: dados.modelo || null,
      dataAquisicao: dados.dataAquisicao || null,
      garantia: dados.garantia || null,
      statusConservacao: dados.statusConservacao || null,
      localizacao: dados.localizacao || null,
      observacoes: dados.observacoes || null,
    })
    .returning();

  return resultado[0];
}

async function atualizarEquipamento(id, dados) {
  const resultado = await db
    .update(equipamento)
    .set({
      nomeEquipamento: dados.nomeEquipamento,
      codigo: dados.codigo || null,
      categoria: dados.categoria || null,
      fabricante: dados.fabricante || null,
      modelo: dados.modelo || null,
      dataAquisicao: dados.dataAquisicao || null,
      garantia: dados.garantia || null,
      statusConservacao: dados.statusConservacao || null,
      localizacao: dados.localizacao || null,
      observacoes: dados.observacoes || null,
    })
    .where(
      eq(equipamento.id, id)
    )
    .returning();

  return resultado[0] || null;
}

async function excluirEquipamento(id) {
  const resultado = await db
    .update(equipamento)
    .set({
      deletedAt: new Date(),
    })
    .where(
      eq(equipamento.id, id)
    )
    .returning();

  return resultado[0] || null;
}

module.exports = {
  listarEquipamentos,
  buscarEquipamentoPorId,
  criarEquipamento,
  atualizarEquipamento,
  excluirEquipamento,
};