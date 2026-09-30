const express = require("express");
const router = express.Router();

const PlanosController = require("../controllers/planos.controller");


// PLANOS

router.get(
  "/",
  PlanosController.listarPlanos
);

router.post(
  "/",
  PlanosController.criarPlano
);

router.put(
  "/:id",
  PlanosController.atualizarPlano
);

router.delete(
  "/:id",
  PlanosController.deletarPlano
);


// MATRÍCULAS

router.get(
  "/matriculas",
  PlanosController.listarMatriculas
);

router.post(
  "/matriculas",
  PlanosController.criarMatricula
);

router.put(
"/matriculas/:id",
PlanosController.atualizarMatricula
);

router.patch(
  "/matriculas/:id/cancelar",
  PlanosController.cancelarMatricula
);

router.patch(
  "/matriculas/:id/renovar",
  PlanosController.renovarMatricula
);

module.exports = router;