const dotenv = require("dotenv");

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória não encontrada: ${name}`
    );
  }

  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 3002),

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  dbPoolMax: Number(
    process.env.DB_POOL_MAX || 10
  ),

  dbIdleTimeoutMs: Number(
    process.env.DB_IDLE_TIMEOUT_MS || 30000
  ),

  dbConnectionTimeoutMs: Number(
    process.env.DB_CONNECTION_TIMEOUT_MS || 10000
  ),

  dbSsl:
    process.env.DB_SSL === "true",

  dbSslRejectUnauthorized:
    process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",

  jwtSecret: required("JWT_SECRET"),

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN || "8h",

  cookieName:
    process.env.COOKIE_NAME || "token",

  cookieMaxAgeMs: Number(
    process.env.COOKIE_MAX_AGE_MS || 28800000
  ),
};

module.exports = env;