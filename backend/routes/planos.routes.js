const express = require("express");
const router = express.Router();

const PlanosController = require("../controllers/planos.controller");


// PLANOS

router.get("/", PlanosController.listarPlanos);
router.post("/", PlanosController.criarPlano);
router.put("/:id", PlanosController.atualizarPlano);
router.delete("/:id", PlanosController.deletarPlano);


// MATRÍCULAS

router.get("/matriculas", PlanosController.listarMatriculas);

// usada pelo Controle de Acesso
router.get(
  "/matriculas/aluno/:alunoId/ativa",
  PlanosController.buscarMatriculaAtivaPorAluno
);

router.post("/matriculas", PlanosController.criarMatricula);
router.put("/matriculas/:id", PlanosController.atualizarMatricula);
router.patch("/matriculas/:id/cancelar", PlanosController.cancelarMatricula);
router.patch("/matriculas/:id/renovar", PlanosController.renovarMatricula);
router.delete("/matriculas/:id", PlanosController.deletarMatricula);

module.exports = router;