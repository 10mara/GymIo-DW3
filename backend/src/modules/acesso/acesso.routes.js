const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateUuidParam } = require("../../utils/validators");
const controller = require("./acesso.controller");

const router = express.Router();

// O frontend usa axios com withCredentials, então já envia o cookie de sessão.
router.use(authMiddleware);
router.param("id", validateUuidParam);

// Histórico (com filtros opcionais: tipo, busca, dataInicio, dataFim, alunoId, limit)
router.get("/", controller.listar);
router.get("/hoje", controller.listarHoje); // antes de qualquer rota com parâmetro
router.get("/aluno/:id", controller.listarPorAluno);

// Registro de acesso (catraca)
router.post("/", controller.registrar); // body: { identificador, tipo: "entrada" | "saida" }
router.post("/entrada", controller.registrarEntrada); // atalho: body: { identificador }
router.post("/saida", controller.registrarSaida); // atalho: body: { identificador }

module.exports = router;
