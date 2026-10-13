const Plano = require("../models/plano");
const Assinatura = require("../models/assinatura");

/* ---------- helpers ---------- */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function responderErro(res, error, mensagemPadrao) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ erro: error.message });
  }

  console.error(`${mensagemPadrao}:`, error);

  return res.status(500).json({ erro: mensagemPadrao });
}

function exigirId(valor, mensagem) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, mensagem);
  }

  return id;
}

function validarPlano(body = {}) {
  const nome_plano = String(body.nome_plano ?? "").trim();
  const descricao = String(body.descricao ?? "").trim();
  const valor = Number(body.valor);
  const duracao_meses = Number(body.duracao_meses);

  if (!nome_plano) {
    throw new HttpError(400, "Nome do plano é obrigatório");
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    throw new HttpError(400, "Valor do plano deve ser maior que zero");
  }

  if (!Number.isInteger(duracao_meses) || duracao_meses <= 0) {
    throw new HttpError(400, "Duração deve ser um número inteiro de meses");
  }

  return {
    nome_plano,
    descricao: descricao || null,
    valor,
    duracao_meses,
  };
}

/**
 * O front manda "Ativa", "Vencendo", "Cancelada"...
 * O banco guarda "Ativo", "Cancelado"...
 * "Vencendo" é só visual (calculado pela data_fim), então vira "Ativo".
 */
function normalizarStatus(status) {
  const valor = String(status ?? "").trim().toLowerCase();

  if (!valor) return undefined;

  if (valor.startsWith("ativ") || valor === "vencendo") return "Ativo";
  if (valor.startsWith("cancelad")) return "Cancelado";
  if (valor === "inadimplente") return "Inadimplente";
  if (valor === "inativo") return "Inativo";

  throw new HttpError(400, "Status de matrícula inválido");
}

async function exigirMatricula(id) {
  const matricula = await Assinatura.buscarPorId(id);

  if (!matricula) {
    throw new HttpError(404, "Matrícula não encontrada");
  }

  return matricula;
}

async function exigirPlano(id) {
  const plano = await Plano.buscarPorId(id);

  if (!plano) {
    throw new HttpError(404, "Plano não encontrado");
  }

  return plano;
}

class PlanosController {

  // ======================
  // PLANOS
  // ======================

  static async listarPlanos(req, res) {
    try {
      const planos = await Plano.listar();

      return res.status(200).json(planos);
    } catch (error) {
      return responderErro(res, error, "Erro ao listar planos");
    }
  }

  static async criarPlano(req, res) {
    try {
      const dados = validarPlano(req.body);

      const plano = await Plano.criar(dados);

      return res.status(201).json(plano);
    } catch (error) {
      return responderErro(res, error, "Erro ao criar plano");
    }
  }

  static async atualizarPlano(req, res) {
    try {
      const id = exigirId(req.params.id, "ID do plano inválido");
      const dados = validarPlano(req.body);

      const plano = await Plano.atualizar(id, dados);

      if (!plano) {
        throw new HttpError(404, "Plano não encontrado");
      }

      return res.status(200).json(plano);
    } catch (error) {
      return responderErro(res, error, "Erro ao atualizar plano");
    }
  }

  static async deletarPlano(req, res) {
    try {
      const id = exigirId(req.params.id, "ID do plano inválido");

      const ativas = await Plano.contarMatriculasAtivas(id);

      if (ativas > 0) {
        throw new HttpError(
          409,
          "Não é possível excluir um plano com matrículas ativas"
        );
      }

      const removido = await Plano.deletar(id);

      if (!removido) {
        throw new HttpError(404, "Plano não encontrado");
      }

      return res.status(200).json({ mensagem: "Plano removido" });
    } catch (error) {
      return responderErro(res, error, "Erro ao remover plano");
    }
  }

  // ======================
  // MATRÍCULAS
  // ======================

  static async listarMatriculas(req, res) {
    try {
      const matriculas = await Assinatura.listar();

      return res.status(200).json(matriculas);
    } catch (error) {
      return responderErro(res, error, "Erro ao listar matrículas");
    }
  }

  static async buscarMatriculaAtivaPorAluno(req, res) {
    try {
      const alunoId = exigirId(req.params.alunoId, "ID do aluno inválido");

      const matricula = await Assinatura.alunoPossuiAtiva(alunoId);

      if (!matricula) {
        throw new HttpError(404, "Aluno não possui matrícula ativa");
      }

      return res.status(200).json(matricula);
    } catch (error) {
      return responderErro(res, error, "Erro ao buscar matrícula ativa");
    }
  }

  static async criarMatricula(req, res) {
    try {
      const aluno_id = exigirId(req.body.aluno_id, "Aluno é obrigatório");
      const plano_id = exigirId(req.body.plano_id, "Plano é obrigatório");

      if (!(await Assinatura.alunoExiste(aluno_id))) {
        throw new HttpError(404, "Aluno não encontrado");
      }

      const plano = await exigirPlano(plano_id);

      if (await Assinatura.alunoPossuiAtiva(aluno_id)) {
        throw new HttpError(409, "Aluno já possui matrícula ativa");
      }

      const matricula = await Assinatura.criar(
        aluno_id,
        plano_id,
        plano.duracao_meses
      );

      return res.status(201).json(matricula);
    } catch (error) {
      return responderErro(res, error, "Erro ao criar matrícula");
    }
  }

  static async atualizarMatricula(req, res) {
    try {
      const id = exigirId(req.params.id, "ID da matrícula inválido");
      const atual = await exigirMatricula(id);

      const dados = {};

      if (req.body.plano_id !== undefined && req.body.plano_id !== "") {
        dados.plano_id = exigirId(req.body.plano_id, "Plano inválido");
        await exigirPlano(dados.plano_id);
      }

      const status = normalizarStatus(
        req.body.status_assinatura ?? req.body.status
      );

      if (status) {
        dados.status_assinatura = status;
      }

      if (Object.keys(dados).length === 0) {
        throw new HttpError(400, "Nenhum campo para atualizar");
      }

      if (dados.status_assinatura === "Ativo") {
        const outra = await Assinatura.alunoPossuiAtiva(atual.aluno_id, id);

        if (outra) {
          throw new HttpError(409, "Aluno já possui matrícula ativa");
        }
      }

      const matricula = await Assinatura.atualizar(id, dados);

      return res.status(200).json(matricula);
    } catch (error) {
      return responderErro(res, error, "Erro ao atualizar matrícula");
    }
  }

  static async cancelarMatricula(req, res) {
    try {
      const id = exigirId(req.params.id, "ID da matrícula inválido");
      await exigirMatricula(id);

      const matricula = await Assinatura.cancelar(id);

      return res.status(200).json(matricula);
    } catch (error) {
      return responderErro(res, error, "Erro ao cancelar matrícula");
    }
  }

  static async renovarMatricula(req, res) {
    try {
      const id = exigirId(req.params.id, "ID da matrícula inválido");
      const atual = await exigirMatricula(id);

      if (!atual.plano_id) {
        throw new HttpError(400, "Matrícula sem plano vinculado");
      }

      const plano = await exigirPlano(atual.plano_id);

      const outra = await Assinatura.alunoPossuiAtiva(atual.aluno_id, id);

      if (outra) {
        throw new HttpError(409, "Aluno já possui matrícula ativa");
      }

      const matricula = await Assinatura.renovar(id, plano.duracao_meses);

      return res.status(200).json(matricula);
    } catch (error) {
      return responderErro(res, error, "Erro ao renovar matrícula");
    }
  }

  static async deletarMatricula(req, res) {
    try {
      const id = exigirId(req.params.id, "ID da matrícula inválido");
      await exigirMatricula(id);

      await Assinatura.deletar(id);

      return res.status(200).json({ mensagem: "Matrícula excluída com sucesso" });
    } catch (error) {
      return responderErro(res, error, "Erro ao excluir matrícula");
    }
  }
}

module.exports = PlanosController;