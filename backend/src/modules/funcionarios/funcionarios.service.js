const AppError = require("../../utils/AppError");
const { todayISO, parseDateOnly } = require("../../utils/date");
const { isUuid } = require("../../utils/validators");
const repository = require("./funcionarios.repository");
const { toRow, toDetalhe } = require("./funcionarios.serializer");

const CAMPOS_EDITAVEIS = ["cargo_id", "data_admissao", "ctps", "status"];
const tem = (obj, campo) => Object.prototype.hasOwnProperty.call(obj, campo);

async function exigirCargoAtivo(cargoId) {
  if (!isUuid(cargoId)) throw new AppError(400, "cargo_id é inválido.");
  if (!(await repository.findCargoAtivo(cargoId))) {
    throw new AppError(400, "Cargo não encontrado ou excluído.");
  }
}

async function listar() {
  return (await repository.findAll()).map(toDetalhe);
}

async function buscarPorId(id) {
  const funcionario = await repository.findById(id);
  if (!funcionario) throw new AppError(404, "Funcionário não encontrado.");
  return toDetalhe(funcionario);
}

async function criar(body) {
  const { pessoa_id: pessoaId, cargo_id: cargoId, data_admissao: dataAdmissao, ctps, status } = body;

  if (!pessoaId || !cargoId) throw new AppError(400, "pessoa_id e cargo_id são obrigatórios.");
  if (!isUuid(pessoaId)) throw new AppError(400, "pessoa_id é inválido.");

  if (!(await repository.findPessoaAtiva(pessoaId))) {
    throw new AppError(400, "Pessoa não encontrada ou excluída.");
  }
  await exigirCargoAtivo(cargoId);

  if (await repository.findFuncionarioDaPessoa(pessoaId)) {
    throw new AppError(409, "A pessoa já possui um funcionário não excluído.");
  }

  const criado = await repository.create({
    pessoaId,
    cargoId,
    dataAdmissao: parseDateOnly(dataAdmissao, "data_admissao") || parseDateOnly(todayISO()),
    ctps: ctps || null,
    status: status || "Ativo",
  });
  return toRow(criado);
}

async function atualizar(id, body) {
  if (tem(body, "pessoa_id")) throw new AppError(400, "pessoa_id não pode ser alterado.");

  const dados = {};
  CAMPOS_EDITAVEIS.forEach((campo) => {
    if (tem(body, campo)) dados[campo] = body[campo];
  });
  if (!Object.keys(dados).length) {
    throw new AppError(400, "Nenhum campo válido foi informado para atualização.");
  }

  if (!(await repository.findAtivoBasico(id))) throw new AppError(404, "Funcionário não encontrado.");

  if (tem(dados, "cargo_id")) await exigirCargoAtivo(dados.cargo_id);

  const atualizado = await repository.update(id, {
    ...(tem(dados, "cargo_id") && { cargoId: dados.cargo_id }),
    ...(tem(dados, "data_admissao") && { dataAdmissao: parseDateOnly(dados.data_admissao, "data_admissao") }),
    ...(tem(dados, "ctps") && { ctps: dados.ctps }),
    ...(tem(dados, "status") && { status: dados.status }),
  });
  return toRow(atualizado);
}

async function excluir(id) {
  if (!(await repository.findAtivoBasico(id))) throw new AppError(404, "Funcionário não encontrado.");
  await repository.softDelete(id);
  return { mensagem: "Funcionário excluído com sucesso." };
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
