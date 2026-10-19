const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../../config/env");
const AppError = require("../../utils/AppError");
const { todayISO, parseDateOnly } = require("../../utils/date");
const { isValidEmail, isValidCPF, missingFields } = require("../../utils/validators");
const repository = require("./auth.repository");

const BCRYPT_ROUNDS = 10;
const SENHA_MIN = 6;
// Hash fictício: mantém o tempo de resposta parecido quando o e-mail não existe.
const DUMMY_HASH = bcrypt.hashSync("gymio-dummy-password", BCRYPT_ROUNDS);

/* ----------------------------- cookie ----------------------------- */

function cookieBaseOptions() {
  return { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/" };
}

function definirCookie(res, token) {
  res.cookie(env.cookieName, token, { ...cookieBaseOptions(), maxAge: env.cookieMaxAgeMs });
}

// Sem maxAge: no Express 4 ele sobrescreve o "expires" usado para apagar o cookie.
function limparCookie(res) {
  res.clearCookie(env.cookieName, cookieBaseOptions());
}

/* ----------------------------- regras ----------------------------- */

const funcionarioAtual = (pessoa) => pessoa?.funcionarios?.[0] ?? null;

/**
 * Só entra no sistema administrativo quem é funcionário ativo.
 * (Alunos também podem ter senha cadastrada; não devem logar aqui.)
 */
function podeAcessarSistema(pessoa) {
  if (!pessoa || pessoa.deletedAt) return false;
  const func = funcionarioAtual(pessoa);
  if (!func) return false;
  return String(func.status || "").trim().toLowerCase() !== "inativo";
}

/** Formato consumido pelo frontend (AuthContext / Sidebar). */
function toSessionUser(pessoa) {
  const func = funcionarioAtual(pessoa);
  return {
    id: pessoa.id,
    nome: pessoa.nome,
    email: pessoa.email,
    telefone: pessoa.telefone,
    cargo: func?.cargo?.nomeCargo || "",
    funcionario: func ? [{ id: func.id, status: func.status }] : [],
    status: func?.status || "Sem status",
  };
}

/**
 * Compara a senha. Senhas antigas (texto puro, gravadas pelo sistema anterior) ainda são aceitas
 * uma vez e convertidas para bcrypt no login (migração transparente).
 */
async function verificarSenha(senha, armazenada) {
  if (!armazenada) {
    await bcrypt.compare(senha, DUMMY_HASH);
    return { ok: false, precisaRehash: false };
  }
  if (/^\$2[aby]\$/.test(armazenada)) {
    return { ok: await bcrypt.compare(senha, armazenada), precisaRehash: false };
  }
  const a = Buffer.from(senha);
  const b = Buffer.from(armazenada);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok, precisaRehash: ok };
}

function assinarToken(pessoaId) {
  return jwt.sign({ sub: pessoaId }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
  });
}

/* ----------------------------- casos de uso ----------------------------- */

async function login({ email, senha }) {
  if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha) {
    throw new AppError(400, "Email e senha são obrigatórios.");
  }

  const pessoa = await repository.findPessoaByEmail(email.trim());
  const { ok, precisaRehash } = await verificarSenha(senha, pessoa?.password);

  if (!pessoa || !ok || !podeAcessarSistema(pessoa)) {
    throw new AppError(401, "Email ou senha inválidos.");
  }

  if (precisaRehash) {
    await repository.updatePasswordHash(pessoa.id, await bcrypt.hash(senha, BCRYPT_ROUNDS));
  }

  return { token: assinarToken(pessoa.id), user: toSessionUser(pessoa) };
}

async function getSessionUser(pessoaId) {
  const pessoa = await repository.findPessoaById(pessoaId);
  return podeAcessarSistema(pessoa) ? toSessionUser(pessoa) : null;
}

async function register(body) {
  const faltando = missingFields(["nome", "email", "telefone", "cargo", "senha", "confirmar", "cpf"], body);
  if (faltando.length) {
    throw new AppError(400, "Preencha todos os campos obrigatórios.", { campos: faltando });
  }

  const { nome, telefone, cargo, senha, confirmar, cpf } = body;
  const email = String(body.email).trim().toLowerCase();

  if (!isValidEmail(email)) throw new AppError(400, "Email inválido.");
  if (!isValidCPF(String(cpf))) throw new AppError(400, "CPF inválido.");
  if (String(senha).length < SENHA_MIN) {
    throw new AppError(400, `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`);
  }
  if (senha !== confirmar) throw new AppError(400, "As senhas não coincidem.");

  if (await repository.findPessoaByCpfOrEmail(String(cpf).trim(), email)) {
    throw new AppError(400, "Já existe um usuário cadastrado com este CPF ou email.");
  }

  const cargoEncontrado = await repository.findCargoByName(String(cargo).trim());
  if (!cargoEncontrado) throw new AppError(400, "Cargo não encontrado.");

  const pessoa = await repository.createPessoaFuncionario({
    pessoa: {
      nome: String(nome).trim(),
      cpf: String(cpf).trim(),
      telefone: String(telefone).trim(),
      email,
      password: await bcrypt.hash(String(senha), BCRYPT_ROUNDS),
    },
    funcionario: {
      cargoId: cargoEncontrado.id,
      status: "Ativo",
      dataAdmissao: parseDateOnly(todayISO()),
    },
  });

  return pessoa;
}

module.exports = {
  login,
  register,
  getSessionUser,
  definirCookie,
  limparCookie,
};
