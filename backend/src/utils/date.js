const env = require("../config/env");
const AppError = require("./AppError");

/** "Hoje" (AAAA-MM-DD) no fuso da academia, não em UTC. */
function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: env.timezone });
}

/**
 * Converte "AAAA-MM-DD" (ou ISO completo) em Date UTC à meia-noite, próprio para colunas @db.Date.
 * undefined -> undefined (campo ausente) | null/"" -> null
 */
function parseDateOnly(value, campo = "data") {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const texto = String(value).slice(0, 10);
  const data = new Date(`${texto}T00:00:00.000Z`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) {
    throw new AppError(400, `${campo} inválida. Use o formato AAAA-MM-DD.`);
  }
  return data;
}

/** Date (@db.Date) -> "AAAA-MM-DD", igual ao que o frontend já recebia do Supabase. */
function formatDateOnly(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

module.exports = { todayISO, parseDateOnly, formatDateOnly };
