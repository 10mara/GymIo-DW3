const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateUuidParam } = require("../../utils/validators");
const controller = require("./pessoas.controller");

const router = express.Router();

// Dados pessoais (CPF, e-mail...) exigem sessão. As telas que usam fetch() enviam
// `credentials: "include"` para o cookie httpOnly seguir junto.
router.use(authMiddleware);

router.param("id", validateUuidParam);

// Extras (devem vir ANTES de "/:id")
router.get("/total-alunos", controller.totalAlunos);
router.get("/planos", controller.planos);
router.get("/cargos", controller.cargos);
router.get("/indicadores", controller.indicadores);

// CRUD
router.get("/", controller.listar);
router.post("/", controller.criar);
router.get("/:id", controller.buscarPorId);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
