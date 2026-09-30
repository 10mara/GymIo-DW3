const express = require("express");
const router = express.Router();

const manutencoesController = require("../controllers/manutencoes.controller");

router.get("/", manutencoesController.listarManutencoes);
router.post("/", manutencoesController.criarManutencao);
router.put("/:id", manutencoesController.atualizarManutencao);
router.delete("/:id", manutencoesController.excluirManutencao);

module.exports = router;