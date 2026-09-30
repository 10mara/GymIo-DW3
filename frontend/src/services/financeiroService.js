const API_URL = "http://localhost:3002/api/financeiro";

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Não foi possível realizar a operação."
    );
  }

  return data;
}

export async function listarTransacoes() {
  return request(`${API_URL}/transacoes`);
}

export async function criarTransacao(dados) {
  return request(`${API_URL}/transacoes`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarTransacao(id, dados) {
  return request(`${API_URL}/transacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function excluirTransacao(id) {
  return request(`${API_URL}/transacoes/${id}`, {
    method: "DELETE",
  });
}

export async function buscarResumoFinanceiro() {
  return request(`${API_URL}/resumo`);
}

export async function buscarGraficoFinanceiro() {
  return request(`${API_URL}/grafico`);
}

export async function buscarAlunosFinanceiro(nome) {
  return request(
    `${API_URL}/alunos?nome=${encodeURIComponent(nome)}`
  );
}
