const { prisma } = require("../../config/prisma");

const include = {
  pessoa: {
    select: {
      id: true, nome: true, cpf: true, dataNascimento: true,
      telefone: true, email: true, endereco: true,
    },
  },
  cargo: { select: { id: true, nomeCargo: true } },
};

// Funcionário ativo cuja pessoa também não foi excluída.
const whereAtivo = { deletedAt: null, pessoa: { is: { deletedAt: null } } };

const findAll = () => prisma.funcionario.findMany({ where: whereAtivo, include });

const findById = (id) => prisma.funcionario.findFirst({ where: { id, ...whereAtivo }, include });

const findAtivoBasico = (id) =>
  prisma.funcionario.findFirst({ where: { id, deletedAt: null }, select: { id: true } });

const findPessoaAtiva = (id) =>
  prisma.pessoa.findFirst({ where: { id, deletedAt: null }, select: { id: true } });

const findCargoAtivo = (id) =>
  prisma.cargo.findFirst({ where: { id, deletedAt: null }, select: { id: true } });

const findFuncionarioDaPessoa = (pessoaId) =>
  prisma.funcionario.findFirst({ where: { pessoaId, deletedAt: null }, select: { id: true } });

const create = (data) => prisma.funcionario.create({ data });

const update = (id, data) => prisma.funcionario.update({ where: { id }, data });

const softDelete = (id) =>
  prisma.funcionario.update({ where: { id }, data: { deletedAt: new Date(), status: "Inativo" } });

module.exports = {
  findAll, findById, findAtivoBasico, findPessoaAtiva, findCargoAtivo,
  findFuncionarioDaPessoa, create, update, softDelete,
};
