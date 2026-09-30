// src/utils/pdf/baixarRelatorio.js

import { gerarRelatorioPDF } from "./gerarRelatorioPDF";

const API_RELATORIOS = "http://localhost:3002/api/relatorios";

export async function baixarRelatorio(tipo, filtros = {}) {
  try {
    const params = new URLSearchParams();

    if (filtros.inicio) params.append("inicio", filtros.inicio);
    if (filtros.fim) params.append("fim", filtros.fim);

    const url = `${API_RELATORIOS}/${tipo}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar relatório");
    }

    const dados = await resposta.json();

    gerarRelatorioPDF(dados);
  } catch (erro) {
    console.error("Erro ao baixar relatório:", erro);
    alert("Não foi possível gerar o relatório.");
  }
}