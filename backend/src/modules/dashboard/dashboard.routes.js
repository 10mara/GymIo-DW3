const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const controller = require("./dashboard.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/resumo", controller.resumo); // todos os cards (consumido pela tela Dashboard)
router.get("/alunos", controller.alunos); // indicadores de alunos/matrículas
router.get("/financeiro", controller.financeiro); // indicadores financeiros do mês

module.exports = router;
