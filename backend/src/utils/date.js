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

/* ------------------------------------------------------------------
 * Intervalos de dia/mês no fuso da academia (APP_TIMEZONE).
 * Necessários para "hoje", "últimos 7 dias" e "mês atual" sobre colunas
 * timestamptz: o servidor roda em UTC, mas o dia da academia é o de São Paulo.
 * ------------------------------------------------------------------ */

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Diferença (ms) entre a hora local do fuso e UTC no instante informado. */
function tzOffsetMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const comoUtc = Date.UTC(+v.year, +v.month - 1, +v.day, +v.hour, +v.minute, +v.second);
  return comoUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instante (Date) em que o dia "AAAA-MM-DD" começa (00:00) no fuso da academia. */
function startOfDay(isoDate, timeZone = env.timezone) {
  const [a, m, d] = isoDate.split("-").map(Number);
  const meiaNoiteUtc = Date.UTC(a, m - 1, d);
  // Duas passadas: a segunda corrige o caso de o deslocamento mudar (horário de verão).
  let guess = meiaNoiteUtc - tzOffsetMs(new Date(meiaNoiteUtc), timeZone);
  guess = meiaNoiteUtc - tzOffsetMs(new Date(guess), timeZone);
  return new Date(guess);
}

/** "AAAA-MM-DD" + n dias -> "AAAA-MM-DD". */
function addDaysISO(isoDate, dias) {
  const [a, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Primeiro dia do mês (com deslocamento opcional em meses) de uma data "AAAA-MM-DD". */
function firstDayOfMonthISO(isoDate, deslocamentoMeses = 0) {
  const [a, m] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + deslocamentoMeses, 1)).toISOString().slice(0, 10);
}

/** Data local (AAAA-MM-DD) de um instante, no fuso da academia. */
function localDateISO(instant, timeZone = env.timezone) {
  return new Date(instant).toLocaleDateString("en-CA", { timeZone });
}

/** Hora cheia (0-23) de um instante, no fuso da academia. */
function localHour(instant, timeZone = env.timezone) {
  const hora = new Intl.DateTimeFormat("en-GB", { timeZone, hourCycle: "h23", hour: "2-digit" }).format(
    new Date(instant),
  );
  return Number(hora);
}

/** Abreviação do dia da semana ("Seg", "Ter"...) de uma data "AAAA-MM-DD". */
function weekdayLabel(isoDate) {
  return DIAS_SEMANA[new Date(`${isoDate}T12:00:00.000Z`).getUTCDay()];
}

module.exports = {
  todayISO,
  parseDateOnly,
  formatDateOnly,
  startOfDay,
  addDaysISO,
  firstDayOfMonthISO,
  localDateISO,
  localHour,
  weekdayLabel,
};
