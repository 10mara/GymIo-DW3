const { prisma } = require("../../config/prisma");

const includeFuncionario = {
  funcionarios: {
    where: { deletedAt: null },
    include: { cargo: { select: { id: true, nomeCargo: true } } },
    orderBy: { dataAdmissao: "desc" },
    take: 1,
  },
};

const findPessoaByEmail = (email) =>
  prisma.pessoa.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    include: includeFuncionario,
  });

const findPessoaById = (id) =>
  prisma.pessoa.findFirst({
    where: { id, deletedAt: null },
    include: includeFuncionario,
  });

// Inclui excluídos de propósito: CPF/e-mail são únicos no banco mesmo após exclusão lógica.
const findPessoaByCpfOrEmail = (cpf, email) =>
  prisma.pessoa.findFirst({
    where: { OR: [{ cpf }, { email: { equals: email, mode: "insensitive" } }] },
    select: { id: true },
  });

const findCargoByName = (nome) =>
  prisma.cargo.findFirst({
    where: { nomeCargo: { equals: nome, mode: "insensitive" }, deletedAt: null },
    select: { id: true, nomeCargo: true },
  });

const updatePasswordHash = (id, hash) =>
  prisma.pessoa.update({ where: { id }, data: { password: hash }, select: { id: true } });

// Criação atômica: pessoa + funcionário (ou nada).
const createPessoaFuncionario = ({ pessoa, funcionario }) =>
  prisma.pessoa.create({
    data: { ...pessoa, funcionarios: { create: funcionario } },
    select: { id: true, nome: true, cpf: true, email: true, telefone: true },
  });

module.exports = {
  findPessoaByEmail,
  findPessoaById,
  findPessoaByCpfOrEmail,
  findCargoByName,
  updatePasswordHash,
  createPessoaFuncionario,
};
