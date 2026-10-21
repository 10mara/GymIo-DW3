const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const controller = require("./auth.controller");

const router = express.Router();

// Cria funcionário com acesso ao sistema: só quem já está autenticado pode cadastrar outro.
// (Público, qualquer pessoa criaria a própria conta de administrador.)
router.post("/register", authMiddleware, controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", authMiddleware, controller.me);

module.exports = router;
