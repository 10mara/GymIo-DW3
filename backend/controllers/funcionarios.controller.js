const supabase = require("../config/supabase");

const camposFuncionario = `
  id,
  pessoa_id,
  cargo_id,
  data_admissao,
  ctps,
  status,
  deleted_at,
  pessoa (
    id,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    endereco
  ),
  cargo (
    id,
    nome_cargo
  )
`;

exports.listarFuncionarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("funcionario")
      .select(camposFuncionario)
      .is("deleted_at", null);

    if (error) {
      console.error("ERRO LISTAR FUNCIONARIOS:", error);
      return res.status(500).json({ erro: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("ERRO GERAL LISTAR FUNCIONARIOS:", err);
    return res.status(500).json({ erro: err.message });
  }
};

exports.buscarFuncionarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("funcionario")
      .select(camposFuncionario)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("ERRO BUSCAR FUNCIONARIO:", error);
      return res.status(500).json({ erro: error.message });
    }

    if (!data) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("ERRO GERAL BUSCAR FUNCIONARIO:", err);
    return res.status(500).json({ erro: err.message });
  }
};

exports.criarFuncionario = async (req, res) => {
  try {
    const {
      pessoa_id,
      cargo_id,
      data_admissao,
      ctps,
      status,
    } = req.body;

    if (!pessoa_id || !cargo_id) {
      return res.status(400).json({
        erro: "pessoa_id e cargo_id são obrigatórios.",
      });
    }

    const { data: pessoa, error: erroPessoa } = await supabase
      .from("pessoa")
      .select("id")
      .eq("id", pessoa_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (erroPessoa) {
      console.error("ERRO VALIDAR PESSOA:", erroPessoa);
      return res.status(500).json({ erro: erroPessoa.message });
    }

    if (!pessoa) {
      return res.status(400).json({
        erro: "Pessoa não encontrada ou excluída.",
      });
    }

    const { data: cargo, error: erroCargo } = await supabase
      .from("cargo")
      .select("id")
      .eq("id", cargo_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (erroCargo) {
      console.error("ERRO VALIDAR CARGO:", erroCargo);
      return res.status(500).json({ erro: erroCargo.message });
    }

    if (!cargo) {
      return res.status(400).json({
        erro: "Cargo não encontrado ou excluído.",
      });
    }

    const {
      data: funcionarioExistente,
      error: erroFuncionarioExistente,
    } = await supabase
      .from("funcionario")
      .select("id")
      .eq("pessoa_id", pessoa_id)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (erroFuncionarioExistente) {
      console.error(
        "ERRO VALIDAR FUNCIONARIO EXISTENTE:",
        erroFuncionarioExistente
      );
      return res.status(500).json({
        erro: erroFuncionarioExistente.message,
      });
    }

    if (funcionarioExistente) {
      return res.status(409).json({
        erro: "A pessoa já possui um funcionário não excluído.",
      });
    }

    const { data, error } = await supabase
      .from("funcionario")
      .insert([
        {
          pessoa_id,
          cargo_id,
          data_admissao:
            data_admissao || new Date().toISOString().split("T")[0],
          ctps: ctps || null,
          status: status || "Ativo",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("ERRO CRIAR FUNCIONARIO:", error);
      return res.status(500).json({ erro: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("ERRO GERAL CRIAR FUNCIONARIO:", err);
    return res.status(500).json({ erro: err.message });
  }
};

exports.atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    if (Object.prototype.hasOwnProperty.call(req.body, "pessoa_id")) {
      return res.status(400).json({
        erro: "pessoa_id não pode ser alterado.",
      });
    }

    const camposPermitidos = [
      "cargo_id",
      "data_admissao",
      "ctps",
      "status",
    ];
    const dadosAtualizacao = {};

    camposPermitidos.forEach((campo) => {
      if (Object.prototype.hasOwnProperty.call(req.body, campo)) {
        dadosAtualizacao[campo] = req.body[campo];
      }
    });

    if (Object.keys(dadosAtualizacao).length === 0) {
      return res.status(400).json({
        erro: "Nenhum campo válido foi informado para atualização.",
      });
    }

    const { data: funcionario, error: erroBusca } = await supabase
      .from("funcionario")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (erroBusca) {
      console.error("ERRO BUSCAR FUNCIONARIO PARA UPDATE:", erroBusca);
      return res.status(500).json({ erro: erroBusca.message });
    }

    if (!funcionario) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, "cargo_id")) {
      if (!dadosAtualizacao.cargo_id) {
        return res.status(400).json({ erro: "cargo_id é inválido." });
      }

      const { data: cargo, error: erroCargo } = await supabase
        .from("cargo")
        .select("id")
        .eq("id", dadosAtualizacao.cargo_id)
        .is("deleted_at", null)
        .maybeSingle();

      if (erroCargo) {
        console.error("ERRO VALIDAR CARGO NO UPDATE:", erroCargo);
        return res.status(500).json({ erro: erroCargo.message });
      }

      if (!cargo) {
        return res.status(400).json({
          erro: "Cargo não encontrado ou excluído.",
        });
      }
    }

    const { data, error } = await supabase
      .from("funcionario")
      .update(dadosAtualizacao)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      console.error("ERRO ATUALIZAR FUNCIONARIO:", error);
      return res.status(500).json({ erro: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("ERRO GERAL ATUALIZAR FUNCIONARIO:", err);
    return res.status(500).json({ erro: err.message });
  }
};

exports.excluirFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: funcionario, error: erroBusca } = await supabase
      .from("funcionario")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (erroBusca) {
      console.error("ERRO BUSCAR FUNCIONARIO PARA DELETE:", erroBusca);
      return res.status(500).json({ erro: erroBusca.message });
    }

    if (!funcionario) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    const { error } = await supabase
      .from("funcionario")
      .update({
        deleted_at: new Date().toISOString(),
        status: "Inativo",
      })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      console.error("ERRO EXCLUIR FUNCIONARIO:", error);
      return res.status(500).json({ erro: error.message });
    }

    return res.status(200).json({
      mensagem: "Funcionário excluído com sucesso.",
    });
  } catch (err) {
    console.error("ERRO GERAL EXCLUIR FUNCIONARIO:", err);
    return res.status(500).json({ erro: err.message });
  }
};
