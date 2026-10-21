/**
 * Prepara o ambiente dos testes unitários (sem banco, sem rede).
 *  - define variáveis de ambiente falsas ANTES de src/config/env.js ser carregado;
 *  - se alguma dependência externa não estiver instalada, injeta um stub mínimo
 *    (com as dependências instaladas — caso normal — os módulos reais são usados).
 */
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://teste:teste@localhost:5432/teste";
process.env.JWT_SECRET = "segredo-de-teste-com-mais-de-32-caracteres-ok";
process.env.APP_TIMEZONE = "America/Sao_Paulo";

const path = require("path");
const Module = require("module");

const STUBS = {
  dotenv: { config() {} },
  bcryptjs: {
    hashSync: (s) => `$2a$10$stub${s}`,
    hash: async (s) => `$2a$10$stub${s}`,
    compare: async (s, h) => h === `$2a$10$stub${s}`,
  },
  jsonwebtoken: { sign: () => "token", verify: () => ({ sub: "x" }) },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, ...rest) {
  try {
    return originalLoad.call(this, request, ...rest);
  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND" && STUBS[request]) return STUBS[request];
    throw err;
  }
};

/**
 * Substitui um módulo (ex.: um repository) por um objeto falso.
 * Deve ser chamado ANTES de require() do service que o utiliza.
 */
function stubModule(relativoAoSrc, exportsFalsos) {
  const resolvido = require.resolve(path.join(__dirname, "..", "..", "src", relativoAoSrc));
  require.cache[resolvido] = { id: resolvido, filename: resolvido, loaded: true, exports: exportsFalsos };
  return resolvido;
}

/** Força um require "limpo" de um módulo do src (útil entre testes). */
function freshRequire(relativoAoSrc) {
  const resolvido = require.resolve(path.join(__dirname, "..", "..", "src", relativoAoSrc));
  delete require.cache[resolvido];
  return require(resolvido);
}

module.exports = { stubModule, freshRequire };
