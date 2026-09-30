const express = require("express");
const router = express.Router();

const equipamentosController = require("../controllers/equipamentos.controller");

router.get("/", equipamentosController.listarEquipamentos);
router.get("/:id", equipamentosController.buscarEquipamentoPorId);
router.post("/", equipamentosController.criarEquipamento);
router.put("/:id", equipamentosController.atualizarEquipamento);
router.delete("/:id", equipamentosController.excluirEquipamento);

module.exports = router;