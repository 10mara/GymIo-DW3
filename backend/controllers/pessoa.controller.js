const supabase = require("../config/supabase");

/**
 * =========================
 * VALIDADORES
 * =========================
 */

const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const isValidCPF = (cpf) => {
  return cpf && cpf.replace(/\D/g, "").length === 11;
};

const requiredFields = (fields, body) => {
  return fields.filter((f) => !body[f] || body[f].toString().trim() === "");
};

/**
 * =========================
 * GET PESSOAS
 * =========================
 */
exports.getPessoas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pessoa")
      .select(
        `
        *,
        aluno (
          id,
          status,
          data_matricula,
          assinatura (
            id,
            plano_id,
            status_assinatura,
            plano (
              nome_plano
            )
          )
        ),
        funcionario (
          id,
          cargo_id,
          data_admissao,
          status
        )
      `,
      )
      .is("deleted_at", null)
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    const pessoas = data.map((pessoa) => {
      const aluno = pessoa.aluno?.find((a) => !a.deleted_at);
      const assinatura = aluno?.assinatura?.find((s) => !s.deleted_at);
      const funcionario = pessoa.funcionario?.find((f) => !f.deleted_at);

      return {
        id: pessoa.id,
        nome: pessoa.nome,
        cpf: pessoa.cpf,
        telefone: pessoa.telefone,
        email: pessoa.email,
        dataNascimento: pessoa.data_nascimento,
        endereco: pessoa.endereco,

        // ALUNO
        isAluno: !!aluno,
        aluno_id: aluno?.id || null,
        matricula: aluno?.data_matricula || "-",

        // PLANO
        plano: assinatura?.plano?.nome_plano || "-",
        plano_id: assinatura?.plano_id || "-",

        // STATUS
        status:
          assinatura?.status_assinatura ||
          aluno?.status ||
          funcionario?.status ||
          "-",

        // FUNCIONÁRIO
        isFuncionario: !!funcionario,
        cargo_id: funcionario?.cargo_id || "-",
        data_admissao: funcionario?.data_admissao || "-",

        // SEGURANÇA (senha mascarada)
        senha: pessoa.password ? "••••••••" : "-",
      };
    });

    return res.json(pessoas);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};
/**
 * =========================
 * POST - CRIAR PESSOA
 * =========================
 */
exports.createPessoa = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      telefone,
      email,
      dataNascimento,
      endereco,
      senha,
      isAluno,
      isFuncionario,
      plano_id,
      cargo_id,
      status,
      data_matricula,
      data_admissao,
    } = req.body;

    // VALIDACAO
    const missing = requiredFields(
      ["nome", "cpf", "telefone", "email"],
      req.body,
    );

    if (missing.length)
      return res.status(400).json({
        erro: "Campos obrigatórios faltando",
        campos: missing,
      });

    if (!isValidEmail(email))
      return res.status(400).json({ erro: "Email inválido" });

    if (!isValidCPF(cpf)) return res.status(400).json({ erro: "CPF inválido" });

    if (!isAluno && !isFuncionario)
      return res.status(400).json({
        erro: "Marque aluno ou funcionário",
      });

    // CRIAR PESSOA
    const { data: pessoa, error: erroPessoa } = await supabase
      .from("pessoa")
      .insert([
        {
          nome,
          cpf,
          telefone,
          email,
          data_nascimento: dataNascimento,
          endereco,
          password: senha,
        },
      ])
      .select()
      .single();

    if (erroPessoa) return res.status(500).json({ erro: erroPessoa.message });

    const hoje = new Date().toISOString().split("T")[0];

    let aluno = null;
    let funcionario = null;

    // ALUNO
    if (isAluno) {
      const { data, error } = await supabase
        .from("aluno")
        .insert([
          {
            pessoa_id: pessoa.id,
            status: status || "Ativo",
            data_matricula: data_matricula || hoje,
          },
        ])
        .select()
        .single();

      if (error) return res.status(500).json({ erro: error.message });

      aluno = data;

      await supabase.from("assinatura").insert([
        {
          aluno_id: aluno.id,
          plano_id: plano_id || null,
          status_assinatura: status || "Ativo",
          data_inicio: data_matricula || hoje,
          data_assinatura: data_matricula || hoje,
        },
      ]);
    }

    // FUNCIONÁRIO
    if (isFuncionario) {
      const { data, error } = await supabase
        .from("funcionario")
        .insert([
          {
            pessoa_id: pessoa.id,
            cargo_id: cargo_id || null,
            data_admissao: data_admissao || hoje,
            status: "Ativo",
          },
        ])
        .select()
        .single();

      if (error) return res.status(500).json({ erro: error.message });

      funcionario = data;
    }

    return res.status(201).json({
      sucesso: true,
      pessoa,
      aluno,
      funcionario,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

/**
 * =========================
 * UPDATE
 * =========================
 */
exports.updatePessoa = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      cpf,
      telefone,
      email,
      dataNascimento,
      endereco,
      senha,
      status,
      dataMatricula,
      plano_id,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        erro: "ID obrigatório",
      });
    }

    // =========================
    // ATUALIZAR PESSOA
    // =========================

    const dadosPessoa = {
      nome,
      cpf,
      telefone,
      email,
      data_nascimento: dataNascimento,
      endereco,
    };

    // Só atualiza a senha se ela tiver sido informada
    if (senha !== undefined && senha !== "") {
      dadosPessoa.password = senha;
    }

    const { data: pessoa, error: erroPessoa } = await supabase
      .from("pessoa")
      .update(dadosPessoa)
      .eq("id", id)
      .select()
      .single();

    if (erroPessoa) {
      return res.status(500).json({
        erro: erroPessoa.message,
      });
    }

    if (!pessoa) {
      return res.status(404).json({
        erro: "Pessoa não encontrada",
      });
    }

    // =========================
    // VERIFICAR SE É ALUNO
    // =========================

    const { data: aluno, error: erroAlunoBusca } = await supabase
      .from("aluno")
      .select("id, status, data_matricula")
      .eq("pessoa_id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (erroAlunoBusca) {
      return res.status(500).json({
        erro: erroAlunoBusca.message,
      });
    }

    if (aluno) {
      // =========================
      // ATUALIZAR ALUNO
      // =========================

      const dadosAluno = {};

      if (status) {
        dadosAluno.status = status;
      }

      if (dataMatricula) {
        dadosAluno.data_matricula = dataMatricula;
      }

      if (Object.keys(dadosAluno).length > 0) {
        const { error: erroAluno } = await supabase
          .from("aluno")
          .update(dadosAluno)
          .eq("id", aluno.id);

        if (erroAluno) {
          return res.status(500).json({
            erro: erroAluno.message,
          });
        }
      }

      // =========================
      // BUSCAR ASSINATURA
      // =========================

      const { data: assinatura, error: erroAssinaturaBusca } = await supabase
        .from("assinatura")
        .select(
          "id, plano_id, status_assinatura, data_inicio, data_fim, data_assinatura",
        )
        .eq("aluno_id", aluno.id)
        .is("deleted_at", null)
        .order("data_assinatura", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (erroAssinaturaBusca) {
        return res.status(500).json({
          erro: erroAssinaturaBusca.message,
        });
      }

      if (assinatura) {
        // =========================
        // ATUALIZAR ASSINATURA
        // =========================

        const dadosAssinatura = {};

        if (status) {
          dadosAssinatura.status_assinatura = status;
        }

        if (plano_id !== undefined) {
          dadosAssinatura.plano_id = plano_id || null;
        }

        if (status === "Cancelado") {
          dadosAssinatura.status_assinatura = "Cancelado";
          dadosAssinatura.data_fim =
            assinatura.data_fim || new Date().toISOString().split("T")[0];
        }

        if (status === "Ativo") {
          dadosAssinatura.status_assinatura = "Ativo";
          dadosAssinatura.data_fim = null;
        }

        if (status === "Inadimplente") {
          dadosAssinatura.status_assinatura = "Inadimplente";
        }

        if (Object.keys(dadosAssinatura).length > 0) {
          const { error: erroAssinatura } = await supabase
            .from("assinatura")
            .update(dadosAssinatura)
            .eq("id", assinatura.id);

          if (erroAssinatura) {
            return res.status(500).json({
              erro: erroAssinatura.message,
            });
          }
        }
      }
    }

    // =========================
    // RESPOSTA
    // =========================

    return res.json({
      sucesso: true,
      pessoa,
    });
  } catch (err) {
    return res.status(500).json({
      erro: err.message,
    });
  }
};

/**
 * =========================
 * DELETE (LOGICO)
 * =========================
 */
exports.deletePessoa = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("pessoa")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return res.status(500).json({ erro: error.message });

    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

/**
 * =========================
 * EXTRAS
 * =========================
 */
exports.getTotalAlunos = async (_, res) => {
  const { count, error } = await supabase
    .from("aluno")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if (error) return res.status(500).json({ erro: error.message });

  return res.json({ total: count });
};

exports.getPlanos = async (_, res) => {
  const { data, error } = await supabase
    .from("plano")
    .select("*")
    .is("deleted_at", null);

  if (error) return res.status(500).json({ erro: error.message });

  return res.json(data);
};

exports.getCargos = async (_, res) => {
  const { data, error } = await supabase
    .from("cargo")
    .select("id, nome_cargo, salario_base")
    .is("deleted_at", null);

  if (error) return res.status(500).json({ erro: error.message });

  return res.json(data);
};

// Cards de indicadores (novos alunos, cancelamentos, taxa de crescimento)
exports.getIndicadores = async (_, res) => {
  try {
    const hoje = new Date();

    // Primeiro dia do mês atual
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Primeiro dia do próximo mês
    const inicioProximoMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      1,
    );

    // Primeiro dia do mês anterior
    const inicioMesAnterior = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      1,
    );

    // Converte para YYYY-MM-DD
    const formatarData = (data) => {
      return data.toISOString().split("T")[0];
    };

    const inicioAtual = formatarData(inicioMesAtual);
    const inicioProximo = formatarData(inicioProximoMes);
    const inicioAnterior = formatarData(inicioMesAnterior);

    // =========================
    // NOVOS ALUNOS - MÊS ATUAL
    // =========================

    const { count: novosMes, error: erroNovos } = await supabase
      .from("aluno")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("data_matricula", inicioAtual)
      .lt("data_matricula", inicioProximo);

    if (erroNovos) {
      return res.status(500).json({ erro: erroNovos.message });
    }

    // =========================
    // NOVOS ALUNOS - MÊS ANTERIOR
    // =========================

    const { count: novosMesAnterior, error: erroAnterior } = await supabase
      .from("aluno")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("data_matricula", inicioAnterior)
      .lt("data_matricula", inicioAtual);

    if (erroAnterior) {
      return res.status(500).json({ erro: erroAnterior.message });
    }

    // =========================
    // CANCELAMENTOS - MÊS ATUAL
    // =========================

    const { count: cancelamentos, error: erroCancelamentos } = await supabase
      .from("assinatura")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status_assinatura", "Cancelado")
      .gte("data_fim", inicioAtual)
      .lt("data_fim", inicioProximo);

    if (erroCancelamentos) {
      return res.status(500).json({ erro: erroCancelamentos.message });
    }

    // =========================
    // TAXA DE CRESCIMENTO
    // =========================

    let crescimento = 0;

    if (novosMesAnterior > 0) {
      crescimento = ((novosMes - novosMesAnterior) / novosMesAnterior) * 100;
    } else if (novosMes > 0) {
      crescimento = 100;
    }

    return res.json({
      novosMes: novosMes || 0,
      cancelamentos: cancelamentos || 0,
      crescimento: Number(crescimento.toFixed(1)),
    });
  } catch (err) {
    return res.status(500).json({
      erro: err.message,
    });
  }
};
