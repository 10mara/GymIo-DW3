const asyncHandler = require("../../utils/asyncHandler");
const service = require("./pessoas.service");

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(req.query.tipo)));
exports.buscarPorId = asyncHandler(async (req, res) => res.json(await service.buscarPorId(req.params.id)));
exports.criar = asyncHandler(async (req, res) => res.status(201).json(await service.criar(req.body || {})));
exports.atualizar = asyncHandler(async (req, res) =>
  res.json(await service.atualizar(req.params.id, req.body || {})),
);
exports.excluir = asyncHandler(async (req, res) => res.json(await service.excluir(req.params.id)));

// Extras consumidos pela tela de Pessoas
exports.totalAlunos = asyncHandler(async (req, res) => res.json(await service.totalAlunos()));
exports.planos = asyncHandler(async (req, res) => res.json(await service.listarPlanos()));
exports.cargos = asyncHandler(async (req, res) => res.json(await service.listarCargos()));
exports.indicadores = asyncHandler(async (req, res) => res.json(await service.indicadores()));
