const { and, asc, eq, ilike, isNull, sql } = require("drizzle-orm");

const { db } = require("../db");
const { plano, assinatura } = require("../db/schema");

function mapPlano(p) {
  if (!p) return null;

  return {
    id: p.id,
    nome_plano: p.nomePlano,
    descricao: p.descricao || "",
    valor: Number(p.valor),
    duracao_meses: p.duracaoMeses,
  };
}

class Plano {
  static async listar() {
    const rows = await db
      .select()
      .from(plano)
      .where(isNull(plano.deletedAt))
      .orderBy(asc(plano.nomePlano));

    return rows.map(mapPlano);
  }

  static async buscarPorId(id) {
    const rows = await db
      .select()
      .from(plano)
      .where(and(eq(plano.id, id), isNull(plano.deletedAt)));

    return mapPlano(rows[0]);
  }

  static async criar(dados) {
    const rows = await db
      .insert(plano)
      .values({
        nomePlano: dados.nome_plano,
        descricao: dados.descricao,
        valor: String(dados.valor),
        duracaoMeses: dados.duracao_meses,
      })
      .returning();

    return mapPlano(rows[0]);
  }

  static async atualizar(id, dados) {
    const rows = await db
      .update(plano)
      .set({
        nomePlano: dados.nome_plano,
        descricao: dados.descricao,
        valor: String(dados.valor),
        duracaoMeses: dados.duracao_meses,
      })
      .where(and(eq(plano.id, id), isNull(plano.deletedAt)))
      .returning();

    return mapPlano(rows[0]);
  }

  static async deletar(id) {
    const rows = await db
      .update(plano)
      .set({ deletedAt: new Date() })
      .where(and(eq(plano.id, id), isNull(plano.deletedAt)))
      .returning({ id: plano.id });

    return rows.length > 0;
  }

  static async contarMatriculasAtivas(planoId) {
    const rows = await db
      .select({ total: sql`count(*)::int` })
      .from(assinatura)
      .where(
        and(
          eq(assinatura.planoId, planoId),
          ilike(assinatura.statusAssinatura, "Ativo"),
          isNull(assinatura.deletedAt)
        )
      );

    return rows[0].total;
  }
}

module.exports = Plano;