const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const controller = require("./auth.controller");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", authMiddleware, controller.me);

module.exports = router;
