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

const findAll = () =>
  prisma.pessoa.findMany({
    where: { deletedAt: null },
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

const updateAluno = (id, data, db = prisma) => db.aluno.update({ where: { id }, data });

const findAssinaturaMaisRecente = (alunoId, db = prisma) =>
  db.assinatura.findFirst({
    where: { alunoId, deletedAt: null },
    orderBy: { dataAssinatura: { sort: "desc", nulls: "last" } },
  });

const updateAssinatura = (id, data, db = prisma) => db.assinatura.update({ where: { id }, data });

/** Exclusão lógica da pessoa e de tudo que depende dela (evita alunos/funcionários "órfãos"). */
const softDeleteCompleto = async (id, agora, db) => {
  await db.pessoa.update({ where: { id }, data: { deletedAt: agora } });
  await db.aluno.updateMany({ where: { pessoaId: id, deletedAt: null }, data: { deletedAt: agora } });
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
  updateAluno,
  findAssinaturaMaisRecente,
  updateAssinatura,
  softDeleteCompleto,
  countAlunos,
  countAlunosAtivos,
  countNovosAlunos,
  countCancelamentos,
  listPlanos,
  listCargos,
};
