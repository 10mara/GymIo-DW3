const supabase = require("../config/supabase");

exports.register = async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      cargo,
      senha,
      confirmar,
      cpf,
    } = req.body;


    if (!nome || !email || !telefone || !cargo || !senha || !confirmar || !cpf) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios.",
      });
    }

    if (senha !== confirmar) {
      return res.status(400).json({
        erro: "As senhas não coincidem.",
      });
    }

    const { data: pessoaExistente, error: erroPessoaExistente } = await supabase
      .from("pessoa")
      .select("id, cpf, email")
      .or(`cpf.eq.${cpf},email.eq.${email}`)
      .maybeSingle();

    if (erroPessoaExistente) {
      return res.status(500).json({ erro: erroPessoaExistente.message });
    }

    if (pessoaExistente) {
      return res.status(400).json({
        erro: "Já existe um usuário cadastrado com este CPF ou email.",
      });
    }

    const cargoNormalizado = cargo?.trim();

    if (!cargoNormalizado) {
      return res.status(400).json({
        erro: "Cargo é obrigatório.",
      });
    }

    const { data: cargoExistente, error: cargoBuscaError } = await supabase
      .from("cargo")
      .select("id, nome_cargo")
      .eq("nome_cargo", cargoNormalizado)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (cargoBuscaError) {
      return res.status(500).json({
        erro: "Erro ao buscar cargo.",
        detalhes: cargoBuscaError.message,
      });
    }

    


    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      return res.status(400).json({
        erro: authError.message,
      });
    }

    const { data: pessoa, error: pessoaError } = await supabase
      .from("pessoa")
      .insert([
        {
          nome,
          cpf,
          telefone,
          email,
          password: senha,
          auth_id: authData.user.id,
        },
      ])
      .select()
      .single();

    if (pessoaError) {
      return res.status(500).json({
        erro: pessoaError.message,
      });
    }

    const { error: funcionarioError } = await supabase
      .from("funcionario")
      .insert([
        {
          pessoa_id: pessoa.id,
          cargo_id: cargoExistente.id,
          status: "Ativo",
          data_admissao: new Date().toISOString().split("T")[0],
        },
      ]);

    if (funcionarioError) {
      return res.status(500).json({
        erro: funcionarioError.message,
      });
    }


    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso.",
      user: authData.user,
      pessoa,
    });

  } catch (err) {
    console.error("ERRO REGISTER:", err);
    return res.status(500).json({
      erro: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return res.status(401).json({
        erro: "Email ou senha inválidos.",
      });
    }

    // 🟢 DEPOIS cria o cookie
    res.cookie("token", data.session.access_token, {
      httpOnly: true,
      secure: false, // true em produção
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({
      mensagem: "Login realizado com sucesso.",
      user: data.user,
    });

  } catch (err) {
    return res.status(500).json({
      erro: err.message,
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ mensagem: "Logout realizado" });
};

exports.me = async (req, res) => {
  try {
    const authId = req.user.id;

    const { data: pessoa, error } = await supabase
      .from("pessoa")
      .select(`
    id,
    nome,
    email,
    telefone,
    funcionario (
      id,
      status
    )
  `)
      .eq("auth_id", authId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!pessoa) {
      res.clearCookie("token");
      return res.status(401).json({ erro: "Sessão inválida" });
    }

    return res.json({
      user: {
        ...req.user,
        ...pessoa,
        status: pessoa.funcionario?.[0]?.status || "Sem status",
      },
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }

};
