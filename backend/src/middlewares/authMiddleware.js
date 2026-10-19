const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../modules/auth/auth.service");

/**
 * Exige sessão válida (cookie httpOnly com JWT).
 * Em caso de sucesso preenche req.user = { id, nome, email, telefone, status, cargo, funcionario }.
 * Uso nos módulos: router.use(authMiddleware) ou router.get("/x", authMiddleware, handler)
 */
module.exports = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];
  if (!token) throw new AppError(401, "Não autenticado");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    authService.limparCookie(res);
    throw new AppError(401, "Token inválido");
  }

  // Confere no banco: pessoa excluída ou funcionário inativo perde o acesso na hora.
  const user = await authService.getSessionUser(payload.sub);
  if (!user) {
    authService.limparCookie(res);
    throw new AppError(401, "Sessão inválida");
  }

  req.user = user;
  next();
});
