const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateUuidParam } = require("../../utils/validators");
const controller = require("./funcionarios.controller");

const router = express.Router();

// A tela de Equipe usa axios com withCredentials, então já envia o cookie de sessão.
router.use(authMiddleware);
router.param("id", validateUuidParam);

router.get("/", controller.listar);
router.post("/", controller.criar);
router.get("/:id", controller.buscarPorId);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
