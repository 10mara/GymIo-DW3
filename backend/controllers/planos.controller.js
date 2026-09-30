const Plano = require("../models/plano");
const Assinatura = require("../models/assinatura");

class PlanosController {

  // ======================
  // PLANOS
  // ======================

  static async listarPlanos(req, res) {

    try {

      const planos = await Plano.listar();

      return res.status(200).json(planos);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        erro: "Erro ao listar planos"
      });

    }

  }

  static async criarPlano(req, res) {

    try {

      const {
        nome_plano,
        descricao,
        valor,
        duracao_meses
      } = req.body;

      if (
        !nome_plano ||
        !valor ||
        !duracao_meses
      ) {

        return res.status(400).json({
          erro: "Campos obrigatórios ausentes"
        });

      }

      const plano = await Plano.criar({
        nome_plano,
        descricao,
        valor,
        duracao_meses
      });

      return res.status(201).json(plano);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        erro: "Erro ao criar plano"
      });

    }

  }

  static async atualizarPlano(req,res){

    try{

      const { id } = req.params;

      const plano =
        await Plano.atualizar(
          id,
          req.body
        );

      return res.status(200).json(plano);

    }catch(error){

      console.error(error);

      return res.status(500).json({
        erro:"Erro ao atualizar plano"
      });

    }

  }

  static async deletarPlano(req,res){

    try{

      const { id } = req.params;

      await Plano.deletar(id);

      return res.status(200).json({
        mensagem:"Plano removido"
      });

    }catch(error){

      console.error(error);

      return res.status(500).json({
        erro:"Erro ao remover plano"
      });

    }

  }

  // ======================
  // MATRÍCULAS
  // ======================

  static async listarMatriculas(req,res){

    try{

      const matriculas =
        await Assinatura.listar();

      return res.status(200).json(matriculas);

    }catch(error){

      console.error(error);

      return res.status(500).json({
        erro:"Erro ao listar matrículas"
      });

    }

  }

  static async criarMatricula(req,res){

    try{

      const {
        aluno_id,
        plano_id
      } = req.body;

      const possuiAtiva =
      await Assinatura.alunoPossuiAtiva(
        aluno_id
      );

      if(possuiAtiva){

        return res.status(400).json({
          erro:"Aluno já possui matrícula ativa"
        });

      }

      const matricula =
      await Assinatura.criar(
        aluno_id,
        plano_id
      );

      return res.status(201).json(
        matricula
      );

    }catch(error){

      console.error(error);

      return res.status(500).json({
        erro:error.message
      });

    }

  }

  static async cancelarMatricula(req,res){

  try{

    const { id } = req.params;

    const matricula =
    await Assinatura.cancelar(id);

    return res.status(200).json(matricula);

  }catch(error){

    console.error(error);

    return res.status(500).json({
    erro:"Erro ao cancelar"
    });

  }

}

static async atualizarMatricula(req,res){

  try{

    const { id } = req.params;

    const matricula =
    await Assinatura.atualizar(
      id,
      req.body
    );

    return res.status(200).json(matricula);

  }catch(error){

    console.error(error);

    return res.status(500).json({
    erro:"Erro ao atualizar matrícula"
    });

  }

}

  static async renovarMatricula(req,res){

    try{

      const { id } = req.params;

      const matricula =
      await Assinatura.renovar(id);

      return res.status(200).json(matricula);

    }catch(error){

      console.error(error);

      return res.status(500).json({
        erro:"Erro ao renovar"
      });

    }

  }

}

module.exports = PlanosController;