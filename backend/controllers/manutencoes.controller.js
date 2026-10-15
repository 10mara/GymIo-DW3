
const { eq, isNull, desc, and } = require("drizzle-orm");
const { db } = require("../db");

const {
  equipamento,
  manutencaoEquipamento,
} = require("../db/schema");

// O banco utiliza UUIDs, não IDs inteiros.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidValido(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// Valida datas no formato AAAA-MM-DD.
function normalizarData(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
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

// Valida custo sem aceitar valores negativos ou não numéricos.
function normalizarCusto(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return "0";
  }

  const custo = Number(valor);

  if (!Number.isFinite(custo) || custo < 0) {
    return undefined;
  }

  return String(valor);
}

/**
 * Mantém o formato esperado pelo frontend.
 */
function mapManutencao(item) {
  if (!item) return null;

  return {
    id: item.id,
    equipamento_id: item.equipamentoId,
    equipamento: item.equipamentoNome || "",
    tipo: item.tipoManutencao || "Preventiva",
    data: item.dataManutencao || "",
    tecnico: item.tecnico || "",
    valorPrevisto: item.custo ?? "0",
    observacoes: item.descricaoServico || "",
  };
}

/**
 * Busca uma manutenção pelo UUID, incluindo o nome
 * do equipamento relacionado.
 */
async function buscarManutencaoPorId(id) {
  const [item] = await db
    .select({
      id: manutencaoEquipamento.id,
      equipamentoId: manutencaoEquipamento.equipamentoId,
      tipoManutencao: manutencaoEquipamento.tipoManutencao,
      dataManutencao: manutencaoEquipamento.dataManutencao,
      tecnico: manutencaoEquipamento.tecnico,
      custo: manutencaoEquipamento.custo,
      descricaoServico: manutencaoEquipamento.descricaoServico,
      equipamentoNome: equipamento.nomeEquipamento,
    })
    .from(manutencaoEquipamento)
    .leftJoin(
      equipamento,
      eq(manutencaoEquipamento.equipamentoId, equipamento.id)
    )
    .where(
      and(
        eq(manutencaoEquipamento.id, id),
        isNull(manutencaoEquipamento.deletedAt)
      )
    )
    .limit(1);

  return item || null;
}

/**
 * GET /api/manutencoes
 * Lista as manutenções não excluídas.
 */
async function listarManutencoes(req, res) {
  try {
    const dados = await db
      .select({
        id: manutencaoEquipamento.id,
        equipamentoId: manutencaoEquipamento.equipamentoId,
        tipoManutencao: manutencaoEquipamento.tipoManutencao,
        dataManutencao: manutencaoEquipamento.dataManutencao,
        tecnico: manutencaoEquipamento.tecnico,
        custo: manutencaoEquipamento.custo,
        descricaoServico: manutencaoEquipamento.descricaoServico,
        equipamentoNome: equipamento.nomeEquipamento,
      })
      .from(manutencaoEquipamento)
      .leftJoin(
        equipamento,
        eq(manutencaoEquipamento.equipamentoId, equipamento.id)
      )
      .where(isNull(manutencaoEquipamento.deletedAt))
      .orderBy(desc(manutencaoEquipamento.dataManutencao));

    return res.json(dados.map(mapManutencao));
  } catch (erro) {
    console.error("Erro ao listar manutenções:", erro);

    return res.status(500).json({
      erro: "Erro ao listar manutenções",
    });
  }
}

/**
 * POST /api/manutencoes
 * Cadastra uma manutenção.
 */
async function criarManutencao(req, res) {
  try {
    const dados = req.body || {};

    const {
      equipamento_id,
      equipamento: nomeEquipamento,
      tipo,
      data,
      tecnico,
      valorPrevisto,
      observacoes,
    } = dados;

    let equipamentoId = equipamento_id || null;

    if (equipamentoId && !uuidValido(equipamentoId)) {
      return res.status(400).json({
        erro: "ID do equipamento inválido",
      });
    }

    // Compatibilidade com o frontend que envia o nome do equipamento.
    if (!equipamentoId && nomeEquipamento) {
      const [equipamentoEncontrado] = await db
        .select({ id: equipamento.id })
        .from(equipamento)
        .where(
          and(
            eq(equipamento.nomeEquipamento, nomeEquipamento),
            isNull(equipamento.deletedAt)
          )
        )
        .limit(1);

      equipamentoId = equipamentoEncontrado?.id || null;
    }

    if (!equipamentoId) {
      return res.status(400).json({
        erro: "Equipamento é obrigatório ou não foi encontrado",
      });
    }

    // Confirma que o equipamento existe e não foi excluído.
    const [equipamentoValido] = await db
      .select({ id: equipamento.id })
      .from(equipamento)
      .where(
        and(
          eq(equipamento.id, equipamentoId),
          isNull(equipamento.deletedAt)
        )
      )
      .limit(1);

    if (!equipamentoValido) {
      return res.status(400).json({
        erro: "Equipamento não encontrado ou excluído",
      });
    }

    const dataManutencao = normalizarData(data);
    if (dataManutencao === undefined) {
      return res.status(400).json({
        erro: "Data inválida. Utilize o formato AAAA-MM-DD",
      });
    }

    const custo = normalizarCusto(valorPrevisto);
    if (custo === undefined) {
      return res.status(400).json({
        erro: "O custo deve ser um número maior ou igual a zero",
      });
    }

    const valores = {
      equipamentoId,
      tipoManutencao: tipo || "Preventiva",
      tecnico: tecnico || null,
      custo,
      descricaoServico: observacoes || null,
    };

    // Se não houver data, o PostgreSQL aplica DEFAULT CURRENT_DATE.
    if (dataManutencao !== null) {
      valores.dataManutencao = dataManutencao;
    }

    const [nova] = await db
      .insert(manutencaoEquipamento)
      .values(valores)
      .returning({ id: manutencaoEquipamento.id });

    const manutencao = await buscarManutencaoPorId(nova.id);

    return res.status(201).json(mapManutencao(manutencao));
  } catch (erro) {
    console.error("Erro ao criar manutenção:", erro);

    return res.status(500).json({
      erro: "Erro ao criar manutenção",
    });
  }
}

/**
 * PUT /api/manutencoes/:id
 * Atualiza somente os campos enviados.
 */
async function atualizarManutencao(req, res) {
  try {
    const { id } = req.params;

    if (!uuidValido(id)) {
      return res.status(400).json({
        erro: "ID da manutenção inválido",
      });
    }

    const dados = req.body || {};
    const valores = {};

    if (dados.tipo !== undefined) {
      if (typeof dados.tipo !== "string" || !dados.tipo.trim()) {
        return res.status(400).json({
          erro: "O tipo de manutenção é obrigatório",
        });
      }

      valores.tipoManutencao = dados.tipo.trim();
    }

    if (dados.data !== undefined) {
      const dataManutencao = normalizarData(dados.data);

      if (dataManutencao === undefined) {
        return res.status(400).json({
          erro: "Data inválida. Utilize o formato AAAA-MM-DD",
        });
      }

      valores.dataManutencao = dataManutencao;
    }

    if (dados.tecnico !== undefined) {
      valores.tecnico = dados.tecnico || null;
    }

    if (dados.valorPrevisto !== undefined) {
      const custo = normalizarCusto(dados.valorPrevisto);

      if (custo === undefined) {
        return res.status(400).json({
          erro: "O custo deve ser um número maior ou igual a zero",
        });
      }

      valores.custo = custo;
    }

    if (dados.observacoes !== undefined) {
      valores.descricaoServico = dados.observacoes || null;
    }

    if (Object.keys(valores).length === 0) {
      return res.status(400).json({
        erro: "Informe pelo menos um campo para atualizar",
      });
    }

    const [atualizada] = await db
      .update(manutencaoEquipamento)
      .set(valores)
      .where(
        and(
          eq(manutencaoEquipamento.id, id),
          isNull(manutencaoEquipamento.deletedAt)
        )
      )
      .returning({ id: manutencaoEquipamento.id });

    if (!atualizada) {
      return res.status(404).json({
        erro: "Manutenção não encontrada",
      });
    }

    const manutencao = await buscarManutencaoPorId(atualizada.id);

    return res.json(mapManutencao(manutencao));
  } catch (erro) {
    console.error("Erro ao atualizar manutenção:", erro);

    return res.status(500).json({
      erro: "Erro ao atualizar manutenção",
    });
  }
}

/**
 * DELETE /api/manutencoes/:id
 * Realiza exclusão lógica, preservando o histórico.
 */
async function excluirManutencao(req, res) {
  try {
    const { id } = req.params;

    if (!uuidValido(id)) {
      return res.status(400).json({
        erro: "ID da manutenção inválido",
      });
    }

    const [excluida] = await db
      .update(manutencaoEquipamento)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(manutencaoEquipamento.id, id),
          isNull(manutencaoEquipamento.deletedAt)
        )
      )
      .returning({ id: manutencaoEquipamento.id });

    if (!excluida) {
      return res.status(404).json({
        erro: "Manutenção não encontrada",
      });
    }

    return res.json({
      mensagem: "Manutenção excluída com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao excluir manutenção:", erro);

    return res.status(500).json({
      erro: "Erro ao excluir manutenção",
    });
  }
}

module.exports = {
  listarManutencoes,
  criarManutencao,
  atualizarManutencao,
  excluirManutencao,
};