const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");
const env = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ erro: "Rota não encontrada." });
}

function mensagemUnique(err) {
  const alvo = [].concat(err.meta?.target ?? []).join(" ").toLowerCase();
  if (alvo.includes("cpf")) return "Já existe uma pessoa cadastrada com este CPF.";
  if (alvo.includes("email")) return "Já existe uma pessoa cadastrada com este e-mail.";
  return "Já existe um registro com estes dados.";
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message, ...err.extra });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": return res.status(409).json({ erro: mensagemUnique(err) });
      case "P2025": return res.status(404).json({ erro: "Registro não encontrado." });
      case "P2003": return res.status(400).json({ erro: "Referência inválida: registro relacionado não existe." });
      case "P2000": return res.status(400).json({ erro: "Algum valor excede o tamanho permitido." });
      case "P2023": return res.status(400).json({ erro: "Algum identificador ou valor informado é inválido." });
      default: break;
    }
  }

  console.error("ERRO NÃO TRATADO:", err);
  return res.status(500).json({
    erro: "Erro interno do servidor.",
    ...(env.isProd ? {} : { detalhes: err.message }),
  });
}

module.exports = { notFound, errorHandler };
