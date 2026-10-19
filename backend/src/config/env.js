require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não encontrada: ${name} (veja o .env.example)`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV || "development";

const env = {
  nodeEnv,
  isProd: nodeEnv === "production",
  port: Number(process.env.PORT || 3002),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Usada pelo Prisma (schema.prisma lê direto de process.env.DATABASE_URL)
  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  cookieName: process.env.COOKIE_NAME || "token",
  cookieMaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS || 8 * 60 * 60 * 1000),

  timezone: process.env.APP_TIMEZONE || "America/Sao_Paulo",
};

if (env.isProd && env.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres em produção.");
}

module.exports = env;
