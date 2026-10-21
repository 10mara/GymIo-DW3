const asyncHandler = require("../../utils/asyncHandler");
const service = require("./acesso.service");

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(req.query)));

exports.listarHoje = asyncHandler(async (req, res) => res.json(await service.listarHoje()));

exports.listarPorAluno = asyncHandler(async (req, res) =>
  res.json(await service.listarPorAluno(req.params.id, req.query)),
);

// Entrada responde 201 (cria um registro); saída responde 200 (fecha o registro aberto).
async function responderRegistro(res, dados) {
  const { tipo, ...corpo } = await service.registrar(dados);
  return res.status(tipo === "entrada" ? 201 : 200).json(corpo);
}

exports.registrar = asyncHandler((req, res) => responderRegistro(res, req.body || {}));

exports.registrarEntrada = asyncHandler((req, res) =>
  responderRegistro(res, { ...(req.body || {}), tipo: "entrada" }),
);

exports.registrarSaida = asyncHandler((req, res) =>
  responderRegistro(res, { ...(req.body || {}), tipo: "saida" }),
);
