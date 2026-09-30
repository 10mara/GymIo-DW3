const express = require("express");
const router = express.Router();

const relatoriosController = require("../controllers/relatorios.controller");

router.get("/:tipo", relatoriosController.gerarRelatorio);

module.exports = router;