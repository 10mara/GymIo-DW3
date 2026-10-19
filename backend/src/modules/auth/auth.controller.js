const asyncHandler = require("../../utils/asyncHandler");
const service = require("./auth.service");

exports.login = asyncHandler(async (req, res) => {
  const { token, user } = await service.login(req.body || {});
  service.definirCookie(res, token);
  res.json({ mensagem: "Login realizado com sucesso.", user });
});

exports.logout = (req, res) => {
  service.limparCookie(res);
  res.json({ mensagem: "Logout realizado" });
};

// authMiddleware já validou a sessão e preencheu req.user
exports.me = (req, res) => {
  res.json({ user: req.user });
};

exports.register = asyncHandler(async (req, res) => {
  const pessoa = await service.register(req.body || {});
  res.status(201).json({ mensagem: "Cadastro realizado com sucesso.", user: pessoa, pessoa });
});
