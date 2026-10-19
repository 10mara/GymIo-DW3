const bcrypt = require("bcryptjs");

const AppError = require("../../utils/AppError");
const { todayISO, parseDateOnly } = require("../../utils/date");
const { isValidEmail, isValidCPF, missingFields } = require("../../utils/validators");
const repository = require("./pessoas.repository");
const s = require("./pessoas.serializer");

const BCRYPT_ROUNDS = 10;

const hashSenha = (senha) => (senha ? bcrypt.hash(String(senha), BCRYPT_ROUNDS) : null);
const texto = (v) => (typeof v === "string" ? v.trim() : v);

/* ------------------------------ consultas ------------------------------ */

async function listar() {
  const pessoas = await repository.findAll();
  return pessoas.map(s.toListItem);
}

async function buscarPorId(id) {
  const pessoa = await repository.findById(id);
  if (!pessoa) throw new AppError(404, "Pessoa não encontrada");
  return s.toListItem(pessoa);
}

async function totalAlunos() {
  return { total: await repository.countAlunos() };
}

async function listarPlanos() {
  return (await repository.listPlanos()).map(s.toPlanoRow);
}

async function listarCargos() {
  return (await repository.listCargos()).map(s.toCargoRow);
}

// Cards: novos alunos no mês, cancelamentos no mês e crescimento vs. mês anterior.
async function indicadores() {
  const [ano, mes] = todayISO().split("-").map(Number);
  const inicioAtual = new Date(Date.UTC(ano, mes - 1, 1));
  const inicioProximo = new Date(Date.UTC(ano, mes, 1));
  const inicioAnterior = new Date(Date.UTC(ano, mes - 2, 1));

  const [novosMes, novosMesAnterior, cancelamentos] = await Promise.all([
    repository.countNovosAlunos(inicioAtual, inicioProximo),
    repository.countNovosAlunos(inicioAnterior, inicioAtual),
    repository.countCancelamentos(inicioAtual, inicioProximo),
  ]);

  let crescimento = 0;
  if (novosMesAnterior > 0) crescimento = ((novosMes - novosMesAnterior) / novosMesAnterior) * 100;
  else if (novosMes > 0) crescimento = 100;

  return { novosMes, cancelamentos, crescimento: Number(crescimento.toFixed(1)) };
}

/* ------------------------------ criação ------------------------------ */

async function criar(body) {
  const faltando = missingFields(["nome", "cpf", "telefone", "email"], body);
  if (faltando.length) throw new AppError(400, "Campos obrigatórios faltando", { campos: faltando });
  if (!isValidEmail(body.email)) throw new AppError(400, "Email inválido");
  if (!isValidCPF(String(body.cpf))) throw new AppError(400, "CPF inválido");
  if (!body.isAluno && !body.isFuncionario) throw new AppError(400, "Marque aluno ou funcionário");

  const hoje = parseDateOnly(todayISO());
  const dataMatricula = parseDateOnly(body.data_matricula, "data_matricula") || hoje;
  const status = body.status || "Ativo";

  const criada = await repository.createCompleta({
    pessoa: {
      nome: texto(body.nome),
      cpf: texto(String(body.cpf)),
      telefone: texto(body.telefone),
      email: texto(body.email).toLowerCase(),
      dataNascimento: parseDateOnly(body.dataNascimento, "dataNascimento") ?? null,
      endereco: body.endereco || null,
      password: await hashSenha(body.senha),
    },
    aluno: body.isAluno ? { status, dataMatricula } : null,
    assinatura: body.isAluno
      ? {
          planoId: body.plano_id || null,
          statusAssinatura: status,
          dataInicio: dataMatricula,
          dataAssinatura: dataMatricula,
        }
      : null,
    funcionario: body.isFuncionario
      ? {
          cargoId: body.cargo_id || null,
          dataAdmissao: parseDateOnly(body.data_admissao, "data_admissao") || hoje,
          status: "Ativo",
        }
      : null,
  });

  return {
    sucesso: true,
    pessoa: s.toPessoaRow(criada),
    aluno: s.toAlunoRow(criada.alunos[0]) || null,
    funcionario: s.toFuncionarioRow(criada.funcionarios[0]) || null,
  };
}

/* ------------------------------ atualização ------------------------------ */

async function atualizar(id, body) {
  if (body.email !== undefined && !isValidEmail(body.email)) throw new AppError(400, "Email inválido");
  if (body.cpf !== undefined && !isValidCPF(String(body.cpf))) throw new AppError(400, "CPF inválido");

  const dadosPessoa = {
    nome: texto(body.nome),
    cpf: body.cpf !== undefined ? texto(String(body.cpf)) : undefined,
    telefone: texto(body.telefone),
    email: body.email !== undefined ? texto(body.email).toLowerCase() : undefined,
    dataNascimento: parseDateOnly(body.dataNascimento, "dataNascimento"),
    endereco: body.endereco,
  };
  // Só troca a senha se uma nova foi informada
  if (body.senha !== undefined && body.senha !== "") dadosPessoa.password = await hashSenha(body.senha);

  const dataMatricula = parseDateOnly(body.dataMatricula, "dataMatricula");
  const { status, plano_id: planoId } = body;

  const pessoa = await repository.transaction(async (tx) => {
    if (!(await repository.findAtivaBasica(id, tx))) throw new AppError(404, "Pessoa não encontrada");

    const atualizada = await repository.updatePessoa(id, dadosPessoa, tx);

    const aluno = await repository.findAlunoAtivo(id, tx);
    if (!aluno) return atualizada;

    const dadosAluno = {};
    if (status) dadosAluno.status = status;
    if (dataMatricula) dadosAluno.dataMatricula = dataMatricula;
    if (Object.keys(dadosAluno).length) await repository.updateAluno(aluno.id, dadosAluno, tx);

    const assinatura = await repository.findAssinaturaMaisRecente(aluno.id, tx);
    if (!assinatura) return atualizada;

    const dadosAssinatura = {};
    if (status) dadosAssinatura.statusAssinatura = status;
    if (planoId !== undefined) dadosAssinatura.planoId = planoId || null;
    if (status === "Cancelado") dadosAssinatura.dataFim = assinatura.dataFim || parseDateOnly(todayISO());
    if (status === "Ativo") dadosAssinatura.dataFim = null;

    if (Object.keys(dadosAssinatura).length) await repository.updateAssinatura(assinatura.id, dadosAssinatura, tx);

    return atualizada;
  });

  return { sucesso: true, pessoa: s.toPessoaRow(pessoa) };
}

/* ------------------------------ exclusão lógica ------------------------------ */

async function excluir(id) {
  await repository.transaction(async (tx) => {
    if (!(await repository.findAtivaBasica(id, tx))) throw new AppError(404, "Pessoa não encontrada");
    await repository.softDeleteCompleto(id, new Date(), tx);
  });
  return { sucesso: true };
}

module.exports = {
  listar,
  buscarPorId,
  totalAlunos,
  listarPlanos,
  listarCargos,
  indicadores,
  criar,
  atualizar,
  excluir,
};
