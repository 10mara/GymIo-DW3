const express = require("express");
const router = express.Router();
const controller = require("../controllers/funcionarios.controller");

router.get("/", controller.listarFuncionarios);
router.get("/:id", controller.buscarFuncionarioPorId);
router.post("/", controller.criarFuncionario);
router.put("/:id", controller.atualizarFuncionario);
router.delete("/:id", controller.excluirFuncionario);

module.exports = router;
