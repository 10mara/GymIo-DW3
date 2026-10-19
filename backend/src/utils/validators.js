const AppError = require("./AppError");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidEmail = (email) => typeof email === "string" && /^\S+@\S+\.\S+$/.test(email.trim());

// Mantém a regra atual do sistema: 11 dígitos (com ou sem máscara).
const isValidCPF = (cpf) => typeof cpf === "string" && cpf.replace(/\D/g, "").length === 11;

const isUuid = (value) => typeof value === "string" && UUID_REGEX.test(value);

const missingFields = (fields, body) =>
  fields.filter((f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === "");

/** router.param("id", validateUuidParam) */
function validateUuidParam(req, res, next, value) {
  if (!isUuid(value)) return next(new AppError(400, "ID inválido."));
  return next();
}

module.exports = { isValidEmail, isValidCPF, isUuid, missingFields, validateUuidParam };
