const { and, desc, eq, ilike, isNull, ne } = require("drizzle-orm");

const { db } = require("../db");
const { assinatura, aluno, pessoa, plano } = require("../db/schema");

/* ---------- datas ---------- */

function paraDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function adicionarMeses(data, meses) {
  const resultado = new Date(data.getFullYear(), data.getMonth() + meses, 1);

  const ultimoDia = new Date(
    resultado.getFullYear(),
    resultado.getMonth() + 1,
    0
  ).getDate();

  resultado.setDate(Math.min(data.getDate(), ultimoDia));

  return resultado;
}

/* ---------- consulta com joins (mesmo formato que o front já usa) ---------- */

function consultaDetalhada() {
  return db
    .select({
      id: assinatura.id,
      aluno_id: assinatura.alunoId,
      plano_id: assinatura.planoId,
      data_inicio: assinatura.dataInicio,
      data_fim: assinatura.dataFim,
      status: assinatura.statusAssinatura,
      data_assinatura: assinatura.dataAssinatura,
      aluno: pessoa.nome,
      plano: plano.nomePlano,
    })
    .from(assinatura)
    .innerJoin(aluno, eq(aluno.id, assinatura.alunoId))
    .innerJoin(pessoa, eq(pessoa.id, aluno.pessoaId))
    .leftJoin(plano, eq(plano.id, assinatura.planoId));
}

class Assinatura {
  static async listar() {
    return consultaDetalhada()
      .where(isNull(assinatura.deletedAt))
      .orderBy(desc(assinatura.dataInicio));
  }

  static async buscarPorId(id) {
    const rows = await consultaDetalhada().where(
      and(eq(assinatura.id, id), isNull(assinatura.deletedAt))
    );

    return rows[0] || null;
  }

  /**
   * Matrícula ativa do aluno (ou null).
   * `ignorarId` serve para não comparar a matrícula com ela mesma.
   */
  static async alunoPossuiAtiva(aluno_id, ignorarId = null) {
    const condicoes = [
      eq(assinatura.alunoId, aluno_id),
      ilike(assinatura.statusAssinatura, "Ativo"),
      isNull(assinatura.deletedAt),
    ];

    if (ignorarId) {
      condicoes.push(ne(assinatura.id, ignorarId));
    }

    const rows = await consultaDetalhada()
      .where(and(...condicoes))
      .orderBy(desc(assinatura.dataFim));

    return rows[0] || null;
  }

  /**
   * Para o Controle de Acesso: true se o aluno tem matrícula
   * ativa e ainda dentro da validade.
   */
  static async alunoTemMatriculaValida(aluno_id) {
    const ativa = await Assinatura.alunoPossuiAtiva(aluno_id);

    if (!ativa || !ativa.data_fim) return false;

    return ativa.data_fim >= paraDataISO(new Date());
  }

  static async alunoExiste(aluno_id) {
    const rows = await db
      .select({ id: aluno.id })
      .from(aluno)
      .where(and(eq(aluno.id, aluno_id), isNull(aluno.deletedAt)));

    return rows.length > 0;
  }

  static async criar(aluno_id, plano_id, duracaoMeses) {
    const hoje = new Date();

    const rows = await db
      .insert(assinatura)
      .values({
        alunoId: aluno_id,
        planoId: plano_id,
        dataInicio: paraDataISO(hoje),
        dataFim: paraDataISO(adicionarMeses(hoje, duracaoMeses)),
        statusAssinatura: "Ativo",
        dataAssinatura: paraDataISO(hoje),
      })
      .returning({ id: assinatura.id });

    return Assinatura.buscarPorId(rows[0].id);
  }

  static async cancelar(id) {
    const rows = await db
      .update(assinatura)
      .set({ statusAssinatura: "Cancelado" })
      .where(and(eq(assinatura.id, id), isNull(assinatura.deletedAt)))
      .returning({ id: assinatura.id });

    if (!rows.length) return null;

    return Assinatura.buscarPorId(id);
  }

  static async renovar(id, duracaoMeses) {
    const hoje = new Date();

    const rows = await db
      .update(assinatura)
      .set({
        dataInicio: paraDataISO(hoje),
        dataFim: paraDataISO(adicionarMeses(hoje, duracaoMeses)),
        statusAssinatura: "Ativo",
      })
      .where(and(eq(assinatura.id, id), isNull(assinatura.deletedAt)))
      .returning({ id: assinatura.id });

    if (!rows.length) return null;

    return Assinatura.buscarPorId(id);
  }

  static async atualizar(id, { plano_id, status_assinatura }) {
    const valores = {};

    if (plano_id !== undefined) valores.planoId = plano_id;
    if (status_assinatura !== undefined) {
      valores.statusAssinatura = status_assinatura;
    }

    const rows = await db
      .update(assinatura)
      .set(valores)
      .where(and(eq(assinatura.id, id), isNull(assinatura.deletedAt)))
      .returning({ id: assinatura.id });

    if (!rows.length) return null;

    return Assinatura.buscarPorId(id);
  }

  static async deletar(id) {
    const rows = await db
      .update(assinatura)
      .set({ deletedAt: new Date() })
      .where(and(eq(assinatura.id, id), isNull(assinatura.deletedAt)))
      .returning({ id: assinatura.id });

    return rows.length > 0;
  }
}

module.exports = Assinatura;