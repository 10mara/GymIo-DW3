const { prisma } = require("../../config/prisma");

/** Executa várias operações de forma atômica: repository.transaction(async (tx) => { ... }) */
const transaction = (fn) => prisma.$transaction(fn);

const pessoaAtiva = { is: { deletedAt: null } };

// Dados necessários para montar a linha da listagem (aluno -> assinatura mais recente -> plano; funcionário).
const includeListagem = {
  alunos: {
    where: { deletedAt: null },
    orderBy: { dataMatricula: "desc" },
    take: 1,
    include: {
      assinaturas: {
        where: { deletedAt: null },
        orderBy: { dataAssinatura: { sort: "desc", nulls: "last" } },
        take: 1,
        include: { plano: { select: { nomePlano: true } } },
      },
    },
  },
  funcionarios: {
    where: { deletedAt: null },
    orderBy: { dataAdmissao: "desc" },
    take: 1,
  },
};

const findAll = (tipo) =>
  prisma.pessoa.findMany({
    where: {
      deletedAt: null,
      ...(tipo === "aluno" ? { alunos: { some: { deletedAt: null } } } : {}),
    },
    include: includeListagem,
    orderBy: [{ createdAt: { sort: "desc", nulls: "last" } }, { id: "desc" }],
  });

const findById = (id) =>
  prisma.pessoa.findFirst({ where: { id, deletedAt: null }, include: includeListagem });

const findAtivaBasica = (id, db = prisma) =>
  db.pessoa.findFirst({ where: { id, deletedAt: null }, select: { id: true } });

/** Pessoa (+ aluno/assinatura e/ou funcionário) criados de forma atômica. */
const createCompleta = ({ pessoa, aluno, assinatura, funcionario }) =>
  prisma.pessoa.create({
    data: {
      ...pessoa,
      ...(aluno && {
        alunos: { create: { ...aluno, assinaturas: { create: assinatura } } },
      }),
      ...(funcionario && { funcionarios: { create: funcionario } }),
    },
    include: { alunos: true, funcionarios: true },
  });

const updatePessoa = (id, data, db = prisma) => db.pessoa.update({ where: { id }, data });

const findAlunoAtivo = (pessoaId, db = prisma) =>
  db.aluno.findFirst({ where: { pessoaId, deletedAt: null }, select: { id: true } });

const createAlunoCompleto = (pessoaId, aluno, assinatura, db = prisma) =>
  db.aluno.create({
    data: {
      pessoaId,
      ...aluno,
      assinaturas: { create: assinatura },
    },
  });

const updateAluno = (id, data, db = prisma) => db.aluno.update({ where: { id }, data });

const softDeleteAluno = async (id, agora, db = prisma) => {
  await db.assinatura.updateMany({
    where: { alunoId: id, deletedAt: null },
    data: { deletedAt: agora },
  });
  await db.aluno.update({ where: { id }, data: { deletedAt: agora } });
};

const findAssinaturaMaisRecente = (alunoId, db = prisma) =>
  db.assinatura.findFirst({
    where: { alunoId, deletedAt: null },
    orderBy: { dataAssinatura: { sort: "desc", nulls: "last" } },
  });

const updateAssinatura = (id, data, db = prisma) => db.assinatura.update({ where: { id }, data });

const findFuncionarioAtivo = (pessoaId, db = prisma) =>
  db.funcionario.findFirst({ where: { pessoaId, deletedAt: null }, select: { id: true } });

const createFuncionario = (pessoaId, data, db = prisma) =>
  db.funcionario.create({ data: { pessoaId, ...data } });

const updateFuncionario = (id, data, db = prisma) =>
  db.funcionario.update({ where: { id }, data });

const softDeleteFuncionario = (id, agora, db = prisma) =>
  db.funcionario.update({
    where: { id },
    data: { deletedAt: agora, status: "Inativo" },
  });

/** Exclusão lógica da pessoa e de tudo que depende dela (evita alunos/funcionários "órfãos"). */
const softDeleteCompleto = async (id, agora, db) => {
  await db.pessoa.update({ where: { id }, data: { deletedAt: agora } });
  const alunos = await db.aluno.findMany({
    where: { pessoaId: id, deletedAt: null },
    select: { id: true },
  });
  for (const aluno of alunos) {
    await softDeleteAluno(aluno.id, agora, db);
  }
  await db.funcionario.updateMany({
    where: { pessoaId: id, deletedAt: null },
    data: { deletedAt: agora, status: "Inativo" },
  });
};

/* ------------------------- consultas auxiliares ------------------------- */

const countAlunos = () =>
  prisma.aluno.count({ where: { deletedAt: null, pessoa: pessoaAtiva } });

const countAlunosAtivos = () =>
  prisma.aluno.count({
    where: { deletedAt: null, status: { equals: "ativo", mode: "insensitive" }, pessoa: pessoaAtiva },
  });

const countNovosAlunos = (inicio, fim) =>
  prisma.aluno.count({
    where: { deletedAt: null, pessoa: pessoaAtiva, dataMatricula: { gte: inicio, lt: fim } },
  });

const countCancelamentos = (inicio, fim) =>
  prisma.assinatura.count({
    where: { deletedAt: null, statusAssinatura: "Cancelado", dataFim: { gte: inicio, lt: fim } },
  });

const resumoDashboard = (inicioAtual, inicioProximo, inicioAnterior) =>
  prisma.$queryRaw`
    SELECT
      COUNT(*) FILTER (
        WHERE LOWER(a.status) = 'ativo'
      )::int AS "alunosAtivos",
      COUNT(*) FILTER (
        WHERE a.data_matricula >= ${inicioAtual}
          AND a.data_matricula < ${inicioProximo}
      )::int AS "novosMes",
      COUNT(*) FILTER (
        WHERE a.data_matricula >= ${inicioAnterior}
          AND a.data_matricula < ${inicioAtual}
      )::int AS "novosMesAnterior",
      (
        SELECT COUNT(*)::int
        FROM assinatura s
        WHERE s.deleted_at IS NULL
          AND LOWER(s.status_assinatura) = 'cancelado'
          AND s.data_fim >= ${inicioAtual}
          AND s.data_fim < ${inicioProximo}
      ) AS cancelamentos
    FROM aluno a
    INNER JOIN pessoa p ON p.id = a.pessoa_id
    WHERE a.deleted_at IS NULL
      AND p.deleted_at IS NULL
  `;

const listPlanos = () => prisma.plano.findMany({ where: { deletedAt: null } });

const listCargos = () =>
  prisma.cargo.findMany({
    where: { deletedAt: null },
    select: { id: true, nomeCargo: true, salarioBase: true },
  });

module.exports = {
  transaction,
  findAll,
  findById,
  findAtivaBasica,
  createCompleta,
  updatePessoa,
  findAlunoAtivo,
  createAlunoCompleto,
  updateAluno,
  softDeleteAluno,
  findAssinaturaMaisRecente,
  updateAssinatura,
  findFuncionarioAtivo,
  createFuncionario,
  updateFuncionario,
  softDeleteFuncionario,
  softDeleteCompleto,
  countAlunos,
  countAlunosAtivos,
  countNovosAlunos,
  countCancelamentos,
  resumoDashboard,
  listPlanos,
  listCargos,
};
