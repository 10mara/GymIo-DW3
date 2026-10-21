const { prisma } = require("../../config/prisma");

/**
 * Consultas AGREGADAS e somente leitura do Dashboard.
 * O Dashboard não é dono desses dados: o que já tem módulo próprio (alunos -> pessoas, acessos -> acesso)
 * é consumido pelo service desse módulo. Aqui ficam apenas os agregados de assinatura e financeiro.
 *
 * TODO(integração): trocar por chamadas ao service de Matrículas (Marjory) e de Financeiro (Samara)
 * quando esses módulos forem entregues, removendo estas consultas.
 */

const igual = (campo, valor) => ({ [campo]: { equals: valor, mode: "insensitive" } });

// Mesmos tipos que o módulo Financeiro usa para separar receita e despesa.
const TIPOS_RECEITA = ["receber", "entrada"];
const TIPOS_DESPESA = ["pagar", "saida", "saída"];

const doTipo = (tipos) => ({ OR: tipos.map((t) => igual("tipoMovimentacao", t)) });

const countInadimplentes = () =>
  prisma.assinatura.count({ where: { deletedAt: null, ...igual("statusAssinatura", "inadimplente") } });

/** Assinaturas que terminam na data informada, exceto as já canceladas (cancelar grava dataFim = hoje). */
const countVencendoEm = (data) =>
  prisma.assinatura.count({
    where: {
      deletedAt: null,
      dataFim: data,
      OR: [{ statusAssinatura: null }, { NOT: igual("statusAssinatura", "cancelado") }],
    },
  });

const countAssinaturas = () => prisma.assinatura.count({ where: { deletedAt: null } });

const countAssinaturasAtivas = () =>
  prisma.assinatura.count({ where: { deletedAt: null, ...igual("statusAssinatura", "ativo") } });

const findUltimasMatriculas = (take = 5) =>
  prisma.assinatura.findMany({
    where: { deletedAt: null },
    orderBy: [{ dataAssinatura: { sort: "desc", nulls: "last" } }, { id: "desc" }],
    take,
    select: {
      id: true,
      dataAssinatura: true,
      aluno: { select: { pessoa: { select: { nome: true } } } },
      plano: { select: { nomePlano: true } },
    },
  });

/** Soma de movimentações do tipo informado no intervalo [desde, ate). Retorna número. */
const somarMovimentacoes = async (tipos, desde, ate) => {
  const r = await prisma.movimentacaoFinanceira.aggregate({
    _sum: { valor: true },
    where: { deletedAt: null, dataMovimentacao: { gte: desde, lt: ate }, ...doTipo(tipos) },
  });
  return Number(r._sum.valor || 0);
};

const somarReceitas = (desde, ate) => somarMovimentacoes(TIPOS_RECEITA, desde, ate);
const somarDespesas = (desde, ate) => somarMovimentacoes(TIPOS_DESPESA, desde, ate);

module.exports = {
  countInadimplentes,
  countVencendoEm,
  countAssinaturas,
  countAssinaturasAtivas,
  findUltimasMatriculas,
  somarReceitas,
  somarDespesas,
};
