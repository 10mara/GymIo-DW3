const express = require("express");
const router = express.Router();
const controller = require("../controllers/pessoa.controller");

// =========================
// GET EXTRAS
// =========================
router.get("/total-alunos", controller.getTotalAlunos);
router.get("/planos", controller.getPlanos);
router.get("/cargos", controller.getCargos);
router.get("/indicadores", controller.getIndicadores);

// =========================
// CRUD PESSOA
// =========================
router.get("/", controller.getPessoas);
router.post("/", controller.createPessoa);
router.put("/:id", controller.updatePessoa);
router.delete("/:id", controller.deletePessoa);

module.exports = router;

