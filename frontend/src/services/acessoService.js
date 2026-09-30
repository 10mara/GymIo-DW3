import api from "./api";

export function normalizarAcesso(acesso) {
  const pessoa = acesso?.aluno?.pessoa;

  let status = acesso?.tipo_acesso || "";

  if (acesso?.tipo_acesso === "bloqueado") {
    status = "Bloqueado";
  } else if (acesso?.hora_entrada && !acesso?.hora_saida) {
    status = "Na academia";
  } else if (acesso?.hora_entrada && acesso?.hora_saida) {
    status = "Finalizado";
  }

  return {
    id: acesso?.id,
    aluno_id: acesso?.aluno_id,
    aluno: pessoa?.nome || "",
    cpf: pessoa?.cpf || "",
    tipo_acesso: acesso?.tipo_acesso || "",
    data_hora_acesso: acesso?.data_hora_acesso,
    hora_entrada: acesso?.hora_entrada,
    hora_saida: acesso?.hora_saida,
    status,
  };
}

export async function listarAcessos() {
  const response = await api.get("/acessos");
  const acessos = Array.isArray(response.data) ? response.data : [];

  return acessos.map(normalizarAcesso);
}

export async function registrarEntrada(identificador) {
  const response = await api.post("/acessos/entrada", { identificador });
  return response.data;
}

export async function registrarSaida(identificador) {
  const response = await api.post("/acessos/saida", { identificador });
  return response.data;
}
