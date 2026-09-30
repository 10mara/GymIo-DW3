import api from "./api";

const normalizarFuncionario = (funcionario) => {
  const pessoa = Array.isArray(funcionario.pessoa)
    ? funcionario.pessoa[0] || {}
    : funcionario.pessoa || {};
  const cargo = Array.isArray(funcionario.cargo)
    ? funcionario.cargo[0] || {}
    : funcionario.cargo || {};

  return {
    id: funcionario.id,
    pessoa_id: funcionario.pessoa_id,
    cargo_id: funcionario.cargo_id,
    nome: pessoa.nome || "",
    email: pessoa.email || "",
    telefone: pessoa.telefone || "",
    cpf: pessoa.cpf || "",
    data_nascimento: pessoa.data_nascimento || "",
    endereco: pessoa.endereco || "",
    cargo: cargo.nome_cargo || "",
    data_admissao: funcionario.data_admissao || "",
    ctps: funcionario.ctps || "",
    status: funcionario.status || "",
  };
};

export const listarFuncionarios = async () => {
  const response = await api.get("/funcionarios");
  const funcionarios = Array.isArray(response.data) ? response.data : [];

  return funcionarios.map(normalizarFuncionario);
};

export const buscarCargos = async () => {
  const response = await api.get("/pessoas/cargos");
  const cargos = Array.isArray(response.data) ? response.data : [];

  return cargos;
};

export const criarFuncionario = async (dados) => {
  const response = await api.post("/pessoas", {
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email,
    telefone: dados.telefone,
    dataNascimento: dados.dataNascimento,
    endereco: dados.endereco || null,
    senha: dados.senha,
    isFuncionario: true,
    cargo_id: dados.cargo_id,
    data_admissao: dados.data_admissao,
    status: dados.status,
  });

  return response.data;
};

export const atualizarFuncionario = async (id, dados) => {
  const response = await api.put(`/funcionarios/${id}`, {
    cargo_id: dados.cargo_id,
    status: dados.status,
    ctps: dados.permissaoFinanceira,
  });

  return response.data;
};

export const excluirFuncionario = async (id) => {
  const response = await api.delete(`/funcionarios/${id}`);
  return response.data;
};
