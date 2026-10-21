const { prisma } = require("../../config/prisma");

/**
 * Todo o acesso ao banco do módulo fica aqui (Prisma). Funções que participam de uma transação
 * recebem `db` (o `tx` de comLockDoAluno); sem ele usam o client compartilhado.
 */

const includeAluno = {
  aluno: {
    select: {
      id: true,
      status: true,
      pessoa: { select: { id: true, nome: true, cpf: true } },
    },
  },
};

/* ------------------------------ consultas ------------------------------ */

function buildWhere({ alunoId, tipo, busca, desde, ate } = {}) {
  const where = { deletedAt: null };

  if (alunoId) where.alunoId = alunoId;
  if (tipo) where.tipoAcesso = tipo;
  if (desde || ate) {
    where.dataHoraAcesso = { ...(desde && { gte: desde }), ...(ate && { lt: ate }) };
  }

  if (busca) {
    const digitos = busca.replace(/\D/g, "");
    where.aluno = {
      is: {
        pessoa: {
          is: {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { cpf: { contains: busca } },
              ...(digitos ? [{ cpf: { contains: digitos } }] : []),
            ],
          },
        },
      },
    };
  }

  return where;
}

/** Histórico de acessos (mais recentes primeiro). */
const findAll = (filtros = {}, take) =>
  prisma.acesso.findMany({
    where: buildWhere(filtros),
    include: includeAluno,
    orderBy: [{ dataHoraAcesso: { sort: "desc", nulls: "last" } }, { id: "desc" }],
    ...(take && { take }),
  });

/** Instantes (Date) das entradas liberadas a partir de `desde` — base dos indicadores do Dashboard. */
const findEntradasDesde = async (desde) => {
  const linhas = await prisma.acesso.findMany({
    where: { deletedAt: null, tipoAcesso: "entrada", dataHoraAcesso: { gte: desde } },
    select: { dataHoraAcesso: true },
  });
  return linhas.map((l) => l.dataHoraAcesso).filter(Boolean);
};

const existsAluno = async (id) =>
  Boolean(await prisma.aluno.findFirst({ where: { id, deletedAt: null }, select: { id: true } }));

/** Aluno (não excluído, de pessoa não excluída) dono de um dos formatos de CPF informados. */
const findAlunoPorCpf = (cpfCandidatos, db = prisma) =>
  db.aluno.findFirst({
    where: {
      deletedAt: null,
      pessoa: { is: { cpf: { in: cpfCandidatos }, deletedAt: null } },
    },
    orderBy: { dataMatricula: { sort: "desc", nulls: "last" } },
    select: {
      id: true,
      status: true,
      pessoa: { select: { id: true, nome: true, cpf: true } },
    },
  });

// TODO(integração): quando o módulo de Matrículas (Marjory) expuser a consulta de matrícula ativa,
// o acesso.service deve passar a consumi-la em vez desta leitura direta de assinatura.
const findAssinaturasDoAluno = (alunoId, db = prisma) =>
  db.assinatura.findMany({
    where: { alunoId, deletedAt: null },
    select: { id: true, statusAssinatura: true, dataInicio: true, dataFim: true },
  });

const findEntradaAberta = (alunoId, db = prisma) =>
  db.acesso.findFirst({
    where: {
      alunoId,
      tipoAcesso: "entrada",
      deletedAt: null,
      horaEntrada: { not: null },
      horaSaida: null,
    },
    orderBy: { horaEntrada: "desc" },
    select: { id: true },
  });

const findUltimaSaida = (alunoId, db = prisma) =>
  db.acesso.findFirst({
    where: { alunoId, tipoAcesso: "entrada", deletedAt: null, horaSaida: { not: null } },
    orderBy: { horaSaida: "desc" },
    select: { horaSaida: true },
  });

/* ------------------------------ escrita ------------------------------ */

const createEntrada = (alunoId, agora, db = prisma) =>
  db.acesso.create({
    data: { alunoId, tipoAcesso: "entrada", dataHoraAcesso: agora, horaEntrada: agora, horaSaida: null },
  });

const createBloqueio = (alunoId, agora, db = prisma) =>
  db.acesso.create({
    data: { alunoId, tipoAcesso: "bloqueado", dataHoraAcesso: agora, horaEntrada: null, horaSaida: null },
  });

const updateSaida = (id, agora, db = prisma) =>
  db.acesso.update({ where: { id }, data: { horaSaida: agora } });

/**
 * Executa `fn(tx)` numa transação que serializa os registros do MESMO aluno
 * (lock consultivo do Postgres, liberado no fim da transação). Evita duas entradas abertas
 * quando a catraca/botão dispara duas vezes ao mesmo tempo. Alunos diferentes não se bloqueiam.
 */
const comLockDoAluno = (alunoId, fn) =>
  prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${alunoId}))`;
    return fn(tx);
  });

module.exports = {
  findAll,
  findEntradasDesde,
  existsAluno,
  findAlunoPorCpf,
  findAssinaturasDoAluno,
  findEntradaAberta,
  findUltimaSaida,
  createEntrada,
  createBloqueio,
  updateSaida,
  comLockDoAluno,
};
