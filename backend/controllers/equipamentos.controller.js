
const { eq, isNull, asc, and } = require("drizzle-orm");

const { db } = require("../db");
const { equipamento } = require("../db/schema");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidValido(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

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

function normalizarData(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  // O PostgreSQL espera uma data no formato YYYY-MM-DD.
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return undefined;
  }

  const [ano, mes, dia] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return undefined;
  }

  return valor;
}

function mapDadosDoFront(dados) {
  const dataAquisicao = normalizarData(dados.dataCompra);
  const garantia = normalizarData(dados.garantia);

  if (dataAquisicao === undefined || garantia === undefined) {
    return { erro: "As datas devem ser válidas no formato AAAA-MM-DD" };
  }

  if (typeof dados.nome !== "string" || !dados.nome.trim()) {
    return { erro: "Nome do equipamento é obrigatório" };
  }

  return {
    valores: {
      nomeEquipamento: dados.nome.trim(),
      codigo: dados.codigo || null,
      categoria: dados.categoria || null,
      fabricante: dados.fabricante || null,
      modelo: dados.modelo || null,
      dataAquisicao,
      garantia,
      statusConservacao: dados.status || null,
      localizacao: dados.localizacao || null,
      observacoes: dados.observacoes || null,
    },
  };
}

async function listarEquipamentos(req, res) {
  try {
    const dados = await db
      .select()
      .from(equipamento)
      .where(isNull(equipamento.deletedAt))
      .orderBy(asc(equipamento.nomeEquipamento));

    return res.json(dados.map(mapEquipamentoBancoParaFront));
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

    if (!uuidValido(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    const [item] = await db
      .select()
      .from(equipamento)
      .where(
        and(
          eq(equipamento.id, id),
          isNull(equipamento.deletedAt)
        )
      )
      .limit(1);

    if (!item) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

    return res.json(mapEquipamentoBancoParaFront(item));
  } catch (erro) {
    console.error("Erro ao buscar equipamento:", erro);
    return res.status(500).json({
      erro: "Erro ao buscar equipamento",
    });
  }
}

async function criarEquipamento(req, res) {
  try {
    const mapeamento = mapDadosDoFront(req.body || {});

    if (mapeamento.erro) {
      return res.status(400).json({ erro: mapeamento.erro });
    }

    const [item] = await db
      .insert(equipamento)
      .values(mapeamento.valores)
      .returning();

    return res.status(201).json(mapEquipamentoBancoParaFront(item));
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

    if (!uuidValido(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    const mapeamento = mapDadosDoFront(req.body || {});

    if (mapeamento.erro) {
      return res.status(400).json({ erro: mapeamento.erro });
    }

    const [item] = await db
      .update(equipamento)
      .set(mapeamento.valores)
      .where(
        and(
          eq(equipamento.id, id),
          isNull(equipamento.deletedAt)
        )
      )
      .returning();

    if (!item) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

    return res.json(mapEquipamentoBancoParaFront(item));
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

    if (!uuidValido(id)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    const [item] = await db
      .update(equipamento)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(equipamento.id, id),
          isNull(equipamento.deletedAt)
        )
      )
      .returning({ id: equipamento.id });

    if (!item) {
      return res.status(404).json({
        erro: "Equipamento não encontrado",
      });
    }

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
