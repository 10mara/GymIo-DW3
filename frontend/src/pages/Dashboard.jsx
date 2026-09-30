import React, { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import {
  Users,
  DollarSign,
  AlertCircle,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";

import api from "../services/api";

import "../styles/dashboard.css";
import "../styles/globals.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    alunosAtivos: 0,
    alunosAtivosMudanca: "0%",
    receitaMensal: "0",
    receitaMudanca: "0%",
    inadimplentes: 0,
    inadimplentesMudanca: "0",
    acessosHoje: 0,
    frequenciaTotal: 0,
    horarioPico: "-",
    taxaRetencao: "0%",
    vencendoHoje: 0,
  });

  const [atividades, setAtividades] = useState([]);
  const [frequenciaSemanal, setFrequenciaSemanal] = useState([]);

  useEffect(() => {
    let intervalo;

    async function carregarDashboard() {
      try {
        const resposta = await api.get("/dashboard");
        const dados = resposta.data;

        setStats({
          alunosAtivos:
            dados.alunosAtivos ?? 0,

          alunosAtivosMudanca:
            dados.alunosAtivosMudanca ?? "0%",

          receitaMensal:
            dados.receitaMensal ?? "0",

          receitaMudanca:
            dados.receitaMudanca ?? "0%",

          inadimplentes:
            dados.inadimplentes ?? 0,

          inadimplentesMudanca:
            dados.inadimplentesMudanca ?? "0",

          acessosHoje:
            dados.acessosHoje ?? 0,

          frequenciaTotal:
            dados.frequenciaTotal ?? 0,

          horarioPico:
            dados.horarioPico ?? "-",

          taxaRetencao:
            dados.taxaRetencao ?? "0%",

          vencendoHoje:
            dados.vencendoHoje ?? 0,
        });

        setAtividades(
          Array.isArray(dados.atividades)
            ? dados.atividades
            : []
        );

        setFrequenciaSemanal(
          Array.isArray(dados.frequenciaSemanal)
            ? dados.frequenciaSemanal
            : []
        );
      } catch (erro) {
        console.error(
          "Erro ao carregar dados do Dashboard:",
          erro
        );
      }
    }

    carregarDashboard();

    // Atualiza os dados automaticamente a cada 30 segundos
    intervalo = setInterval(() => {
      carregarDashboard();
    }, 30000);

    // Atualiza quando o usuário volta para a aba
    function atualizarAoVoltar() {
      if (document.visibilityState === "visible") {
        carregarDashboard();
      }
    }

    document.addEventListener(
      "visibilitychange",
      atualizarAoVoltar
    );

    return () => {
      clearInterval(intervalo);

      document.removeEventListener(
        "visibilitychange",
        atualizarAoVoltar
      );
    };
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <p className="sub-title">
              Aqui está o resumo da sua academia hoje
            </p>
          </div>
        </header>

        {/* Grade de cartões de indicadores (KPIs) de topo */}
        <section className="stats-grid">

          <article className="stat-card">
            <div className="stat-info">
              <span>Alunos Ativos</span>

              <strong>
                {stats.alunosAtivos}
              </strong>

              <small className="positivo">
                {stats.alunosAtivosMudanca} vs. mês anterior
              </small>
            </div>

            <div className="stat-icon icon-blue">
              <Users size={20} />
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-info">
              <span>Receita Mensal</span>

              <strong>
                R$ {stats.receitaMensal}
              </strong>

              <small className="positivo">
                {stats.receitaMudanca} vs. mês anterior
              </small>
            </div>

            <div className="stat-icon icon-green">
              <DollarSign size={20} />
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-info">
              <span>Inadimplentes</span>

              <strong>
                {stats.inadimplentes}
              </strong>

              <small className="negativo">
                {stats.inadimplentesMudanca} vs. mês anterior
              </small>
            </div>

            <div className="stat-icon icon-amber">
              <AlertCircle size={20} />
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-info">
              <span>Acessos Hoje</span>

              <strong>
                {stats.acessosHoje}
              </strong>

              <small className="neutro">
                Normal média diária
              </small>
            </div>

            <div className="stat-icon icon-slate">
              <Activity size={20} />
            </div>
          </article>

        </section>

        {/* Seção do meio dividida em Gráfico e Resumo Rápido */}
        <section className="middle-grid">

          {/* Box de Frequência Semanal */}
          <article className="chart-card">

            <div className="chart-header">
              <div>
                <h2>Frequência Semanal</h2>

                <p>
                  Acessos por dia da semana
                </p>
              </div>

              <span className="total-badge">
                <TrendingUp
                  size={14}
                  style={{ marginRight: 4 }}
                />

                <strong>
                  {stats.frequenciaTotal}
                </strong>

                {" "}total
              </span>
            </div>

            <div className="chart-placeholder">

              <div className="week-days">

                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>

              </div>

            </div>

          </article>

          {/* Box de Resumo Rápido lateral */}
          <article className="summary-card">

            <h2>Resumo Rápido</h2>

            <div className="summary-items">

              <div className="summary-item row-blue">

                <div className="item-left">

                  <div className="circle-icon c-blue">
                    <Clock size={16} />
                  </div>

                  <div>
                    <strong>
                      Horário de Pico
                    </strong>

                    <span>
                      Maior movimento
                    </span>
                  </div>

                </div>

                <span className="item-value val-black">
                  {stats.horarioPico}
                </span>

              </div>

              <div className="summary-item row-green">

                <div className="item-left">

                  <div className="circle-icon c-green">
                    <TrendingUp size={16} />
                  </div>

                  <div>
                    <strong>
                      Taxa Retenção
                    </strong>

                    <span>
                      Alunos renovando
                    </span>
                  </div>

                </div>

                <span className="item-value val-green">
                  {stats.taxaRetencao}
                </span>

              </div>

              <div className="summary-item row-amber">

                <div className="item-left">

                  <div className="circle-icon c-amber">
                    <AlertCircle size={16} />
                  </div>

                  <div>
                    <strong>
                      Vencendo Hoje
                    </strong>

                    <span>
                      Matrículas
                    </span>
                  </div>

                </div>

                <span className="item-value val-amber">
                  {stats.vencendoHoje}
                </span>

              </div>

            </div>

          </article>

        </section>

        {/* Seção Inferior: Atividades Recentes */}
        <section className="recent-activities">

          <div className="activities-header">
            <h2>
              Atividades Recentes
            </h2>
          </div>

          <div className="activities-list">

            {atividades.map((atividade) => (

              <div
                key={atividade.id}
                className="activity-item"
              >

                <div className="activity-left">

                  <div
                    className={`activity-avatar avatar-${atividade.classe}`}
                  >
                    {atividade.iniciais}
                  </div>

                  <div className="activity-details">

                    <strong>
                      {atividade.nome}
                    </strong>

                    <span>
                      {atividade.acao}
                    </span>

                  </div>

                </div>

                <span className="activity-time">
                  {atividade.tempo}
                </span>

              </div>

            ))}

          </div>

        </section>

      </main>
    </div>
  );
}