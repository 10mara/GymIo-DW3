const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const acessoController = require("../controllers/acesso.controller");

router.use(authMiddleware);

router.get("/", acessoController.listar);
router.post("/entrada", acessoController.registrarEntrada);
router.post("/saida", acessoController.registrarSaida);

module.exports = router;
