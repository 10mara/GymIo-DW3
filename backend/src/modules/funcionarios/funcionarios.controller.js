const asyncHandler = require("../../utils/asyncHandler");
const service = require("./funcionarios.service");

exports.listar = asyncHandler(async (req, res) => res.status(200).json(await service.listar()));
exports.buscarPorId = asyncHandler(async (req, res) =>
  res.status(200).json(await service.buscarPorId(req.params.id)),
);
exports.criar = asyncHandler(async (req, res) => res.status(201).json(await service.criar(req.body || {})));
exports.atualizar = asyncHandler(async (req, res) =>
  res.status(200).json(await service.atualizar(req.params.id, req.body || {})),
);
exports.excluir = asyncHandler(async (req, res) => res.status(200).json(await service.excluir(req.params.id)));
