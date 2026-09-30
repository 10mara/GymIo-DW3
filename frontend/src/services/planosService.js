const API_URL = "http://localhost:3002/api/planos";

export async function listarPlanos() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function criarPlano(plano) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plano),
  });

  return res.json();
}

export async function atualizarPlano(id, plano) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plano),
  });

  return res.json();
}

export async function deletarPlano(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return res.json();
}