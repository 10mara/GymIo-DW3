const asyncHandler = require("../../utils/asyncHandler");
const service = require("./dashboard.service");

exports.resumo = asyncHandler(async (req, res) => res.json(await service.resumo()));
exports.alunos = asyncHandler(async (req, res) => res.json(await service.alunos()));
exports.financeiro = asyncHandler(async (req, res) => res.json(await service.financeiro()));
