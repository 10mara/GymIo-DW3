import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import ModalPerfil from "../components/ModalPerfil";
import "../styles/alunos.css";
import "../styles/globals.css";

import {
  Search,
  Users,
  TrendingUp,
  CircleX,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";

const API = "/pessoas";

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [busca, setBusca] = useState("");
  const [cargos, setCargos] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    novosMes: 0,
    cancelamentos: 0,
    crescimento: 0,
  });

  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [alunoVisualizando, setAlunoVisualizando] = useState(null);
  const [senhaVisivelId, setSenhaVisivelId] = useState(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [alunoExcluindo, setAlunoExcluindo] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const alunosPorPagina = 10;

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  async function carregarDados() {
    try {
      const [alunosRes, indicadoresRes, planosRes, cargosRes] =
        await Promise.all([
          api.get(`${API}?tipo=aluno`),
          api.get(`${API}/indicadores`),
          api.get(`${API}/planos`),
          api.get(`${API}/cargos`),
        ]);

      const alunosData = alunosRes.data;
      const indicadoresData = indicadoresRes.data;
      const planosData = planosRes.data;
      const cargosData = cargosRes.data;

      const listaAlunos = Array.isArray(alunosData) ? alunosData : [];

      setAlunos(listaAlunos);
      setPlanos(Array.isArray(planosData) ? planosData : []);
      setCargos(Array.isArray(cargosData) ? cargosData : []);

      const total = listaAlunos.filter((aluno) => {
        const status =
          aluno.status_assinatura ||
          aluno.status ||
          "";

        return status.toLowerCase() !== "cancelado";
      }).length;

      const novosMes = indicadoresData?.novosMes ?? 0;
      const cancelamentos = indicadoresData?.cancelamentos ?? 0;

      setStats({
        total,
        novosMes,
        cancelamentos,
        crescimento: total > 0 ? ((novosMes / total) * 100).toFixed(1) : 0,
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);

      setAlunos([]);
      setPlanos([]);
      setCargos([]);

      setStats({
        total: 0,
        novosMes: 0,
        cancelamentos: 0,
        crescimento: 0,
      });
    }
  }

  async function recarregarAlunos() {
    try {
      const [alunosRes, indicadoresRes] = await Promise.all([
        api.get(`${API}?tipo=aluno`),
        api.get(`${API}/indicadores`),
      ]);

      const data = alunosRes.data;
      const indicadoresData = indicadoresRes.data;

      const listaAlunos = Array.isArray(data) ? data : [];

      setAlunos(listaAlunos);

      const total = listaAlunos.filter((aluno) => {
        const status =
          aluno.status_assinatura ||
          aluno.status ||
          "";

        return status.toLowerCase() !== "cancelado";
      }).length;

      const novosMes = indicadoresData?.novosMes ?? 0;
      const cancelamentos = indicadoresData?.cancelamentos ?? 0;

      setStats((prev) => ({
        ...prev,
        total,
        novosMes,
        cancelamentos,
        crescimento:
          total > 0
            ? ((novosMes / total) * 100).toFixed(1)
            : 0,
      }));
    } catch (err) {
      console.error("Erro ao recarregar alunos:", err);
      setAlunos([]);
    }
  }

  const alunosFiltrados = useMemo(() => {
    const termo = busca
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const apenasNumeros = busca.replace(/\D/g, "");

    return alunos.filter((aluno) => {
      const nome = (aluno.nome || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const cpf = aluno.cpf || "";
      const cpfNumeros = cpf.replace(/\D/g, "");

      const email = (aluno.email || "").toLowerCase();

      const telefone = aluno.telefone || "";
      const telefoneNumeros = telefone.replace(/\D/g, "");

      const matricula = String(aluno.matricula || "").toLowerCase();

      const status = (
        aluno.status_assinatura ||
        aluno.status ||
        ""
      ).trim();

      const correspondeBusca =
        !termo ||
        nome.includes(termo) ||
        email.includes(termo) ||
        matricula.includes(termo) ||
        (apenasNumeros
          ? cpfNumeros.includes(apenasNumeros) ||
            telefoneNumeros.includes(apenasNumeros)
          : cpf.toLowerCase().includes(termo) ||
            telefone.toLowerCase().includes(termo));

      const correspondeStatus =
        filtroStatus === "Todos" ||
        status.toLowerCase() === filtroStatus.toLowerCase();

      return correspondeBusca && correspondeStatus;
    });
  }, [alunos, busca, filtroStatus]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(alunosFiltrados.length / alunosPorPagina)
  );

  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * alunosPorPagina;

    return alunosFiltrados.slice(
      inicio,
      inicio + alunosPorPagina
    );
  }, [alunosFiltrados, paginaAtual]);

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  function abrirEdicao(aluno) {
    setAlunoEditando({ ...aluno });
    setModalEditarAberto(true);
  }

  function abrirVisualizacao(aluno) {
    setAlunoVisualizando(aluno);
  }

  async function salvarEdicao() {
    if (!alunoEditando) return;

    try {
      await api.put(`${API}/${alunoEditando.id}`, {
        nome: alunoEditando.nome,
        cpf: alunoEditando.cpf,
        telefone: alunoEditando.telefone,
        email: alunoEditando.email,
        dataNascimento:
          alunoEditando.dataNascimento ||
          alunoEditando.data_nascimento,
        endereco: alunoEditando.endereco,
        status:
          alunoEditando.status_assinatura ||
          alunoEditando.status,
        plano_id: alunoEditando.plano_id,
        senha: alunoEditando.senha,
      });

      await recarregarAlunos();

      setModalEditarAberto(false);
      setAlunoEditando(null);

      alert("Aluno atualizado com sucesso!");
    } catch (err) {
      console.error(
        "Erro ao editar aluno:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.erro ||
          err.response?.data?.message ||
          "Erro ao editar aluno"
      );
    }
  }

  function abrirExclusao(aluno) {
    setAlunoExcluindo(aluno);
    setModalExcluirAberto(true);
  }

  function dataEhDesteMes(data) {
    if (!data) return false;

    const valor = String(data).trim();

    if (!valor) return false;

    let ano;
    let mes;

    if (valor.includes("-")) {
      const partes = valor.split("-");

      ano = Number(partes[0]);
      mes = Number(partes[1]);
    } else if (valor.includes("/")) {
      const partes = valor.split("/");

      if (partes.length !== 3) return false;

      ano = Number(partes[2]);
      mes = Number(partes[1]);
    }

    if (!ano || !mes) return false;

    const hoje = new Date();

    return (
      ano === hoje.getFullYear() &&
      mes === hoje.getMonth() + 1
    );
  }

  async function confirmarExclusao() {
    if (!alunoExcluindo) return;

    try {
      const aluno = alunoExcluindo;

      const status = (
        aluno.status_assinatura ||
        aluno.status ||
        ""
      )
        .trim()
        .toLowerCase();

      const ehCancelado = status === "cancelado";

      const dataMatricula =
        aluno.dataMatricula ||
        aluno.data_matricula ||
        aluno.dataCadastro ||
        aluno.data_cadastro ||
        aluno.matricula;

      const ehNovoEsteMes = dataEhDesteMes(dataMatricula);

      await api.delete(`${API}/${aluno.id}`);

      setAlunos((lista) =>
        lista.filter((a) => a.id !== aluno.id)
      );

      setStats((prev) => {
        const novoTotal = ehCancelado
          ? prev.total
          : Math.max(0, prev.total - 1);

        const novosMes = ehNovoEsteMes
          ? Math.max(0, prev.novosMes - 1)
          : prev.novosMes;

        const cancelamentos = ehCancelado
          ? Math.max(0, prev.cancelamentos - 1)
          : prev.cancelamentos;

        return {
          total: novoTotal,
          novosMes,
          cancelamentos,
          crescimento:
            novoTotal > 0
              ? ((novosMes / novoTotal) * 100).toFixed(1)
              : 0,
        };
      });

      setModalExcluirAberto(false);
      setAlunoExcluindo(null);

      alert("Aluno excluído com sucesso!");
    } catch (err) {
      console.error(
        "Erro ao excluir aluno:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.erro ||
          err.response?.data?.message ||
          "Erro ao excluir aluno"
      );
    }
  }

  function formatarData(data) {
    if (!data) return "-";

    if (data.includes("/")) return data;

    const [ano, mes, dia] = data.split("-");

    if (!ano || !mes || !dia) return data;

    return `${dia}/${mes}/${ano}`;
  }

  function iniciais(nome = "") {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div className="alunos-layout">
      <Sidebar />

      <main className="alunos-page">
        <header className="alunos-header">
          <div>
            <h1>Gestão de Alunos</h1>
            <p>Cadastro e controle dos alunos da academia</p>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon stat-blue">
              <Users size={22} />
            </div>

            <div>
              <span>Total de Alunos</span>
              <strong>{stats.total}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-green">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Novos este mês</span>
              <strong>{stats.novosMes}</strong>
              <small className="positivo">
                Alunos cadastrados no mês
              </small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-red">
              <CircleX size={22} />
            </div>

            <div>
              <span>Cancelamentos</span>
              <strong>{stats.cancelamentos}</strong>
              <small className="negativo">
                Alunos com status cancelado
              </small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-green">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Taxa de Crescimento</span>
              <strong>+{stats.crescimento}%</strong>
              <small className="positivo">
                Novos alunos / total
              </small>
            </div>
          </article>
        </section>

        <section className="alunos-content">
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar aluno por nome, CPF ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="filters">
              {[
                "Todos",
                "Ativo",
                "Inadimplente",
                "Cancelado",
              ].map((status) => (
                <button
                  key={status}
                  className={
                    filtroStatus === status ? "active" : ""
                  }
                  onClick={() => setFiltroStatus(status)}
                >
                  {status === "Ativo" ? "Ativos" : status}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="alunos-table">
              <thead>
                <tr>
                  <th>Ações</th>
                  <th>Aluno</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Data Nascimento</th>
                  <th>Endereço</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Matrícula</th>
                  <th>Senha</th>
                </tr>
              </thead>

              <tbody>
                {alunosPaginados.length > 0 ? (
                  alunosPaginados.map((aluno) => (
                    <tr key={aluno.id}>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn view"
                            onClick={() =>
                              abrirVisualizacao(aluno)
                            }
                            title="Visualizar aluno"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            className="action-btn edit"
                            onClick={() => abrirEdicao(aluno)}
                            title="Editar aluno"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() =>
                              abrirExclusao(aluno)
                            }
                            title="Excluir aluno"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="student-cell">
                          <div className="avatar">
                            {iniciais(aluno.nome)}
                          </div>

                          <span>{aluno.nome}</span>
                        </div>
                      </td>

                      <td>{aluno.cpf}</td>
                      <td>{aluno.telefone}</td>
                      <td>{aluno.email}</td>

                      <td>
                        {formatarData(
                          aluno.dataNascimento ||
                            aluno.data_nascimento
                        )}
                      </td>

                      <td className="address-cell">
                        {aluno.endereco}
                      </td>

                      <td>
                        <span
                          className={`badge plano-${(
                            aluno.plano || ""
                          ).toLowerCase()}`}
                        >
                          {aluno.plano || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge status-${(
                            aluno.status_assinatura ||
                            aluno.status ||
                            ""
                          ).toLowerCase()}`}
                        >
                          {aluno.status_assinatura ||
                            aluno.status ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        {formatarData(
                          String(aluno.matricula || "")
                        )}
                      </td>

                      <td>
                        <div className="password-cell">
                          <span>
                            {senhaVisivelId === aluno.id
                              ? aluno.senha || ""
                              : "••••••••"}
                          </span>

                          <button
                            className="btn-eye"
                            onClick={() =>
                              setSenhaVisivelId(
                                senhaVisivelId === aluno.id
                                  ? null
                                  : aluno.id
                              )
                            }
                            title={
                              senhaVisivelId === aluno.id
                                ? "Ocultar senha"
                                : "Visualizar senha"
                            }
                          >
                            {senhaVisivelId === aluno.id ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="empty-table"
                    >
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>
              {alunosFiltrados.length === 0
                ? "Nenhum aluno encontrado"
                : `Mostrando ${
                    (paginaAtual - 1) * alunosPorPagina + 1
                  } a ${Math.min(
                    paginaAtual * alunosPorPagina,
                    alunosFiltrados.length
                  )} de ${
                    alunosFiltrados.length
                  } alunos`}
            </span>
          </footer>
        </section>
      </main>

      {alunoVisualizando && (
        <ModalPerfil
          aluno={alunoVisualizando}
          pessoa={alunoVisualizando}
          dados={alunoVisualizando}
          onClose={() => setAlunoVisualizando(null)}
        />
      )}

      {modalEditarAberto && alunoEditando && (
        <div className="modal-overlay">
          <div className="modal modal-form">
            <div className="modal-header">
              <h2>
                <Pencil size={18} />
                Editar Aluno
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setModalEditarAberto(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-grid">
              <div className="input-group">
                <label>Nome completo *</label>

                <input
                  value={alunoEditando.nome || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      nome: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>CPF *</label>

                <input
                  value={alunoEditando.cpf || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      cpf: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>E-mail *</label>

                <input
                  type="email"
                  value={alunoEditando.email || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Telefone *</label>

                <input
                  value={alunoEditando.telefone || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      telefone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Data de nascimento *</label>

                <input
                  type="date"
                  value={
                    alunoEditando.dataNascimento ||
                    alunoEditando.data_nascimento ||
                    ""
                  }
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      dataNascimento: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Endereço *</label>

                <input
                  value={alunoEditando.endereco || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      endereco: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Plano *</label>

                <select
                  value={alunoEditando.plano_id || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      plano_id: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Selecione um plano
                  </option>

                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome_plano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Status *</label>

                <select
                  value={
                    alunoEditando.status_assinatura ||
                    alunoEditando.status ||
                    ""
                  }
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      status_assinatura: e.target.value,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Ativo">Ativo</option>

                  <option value="Inadimplente">
                    Inadimplente
                  </option>

                  <option value="Cancelado">
                    Cancelado
                  </option>
                </select>
              </div>

              <div className="input-group input-full">
                <label>Senha</label>

                <input
                  type="password"
                  value={alunoEditando.senha || ""}
                  onChange={(e) =>
                    setAlunoEditando({
                      ...alunoEditando,
                      senha: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() =>
                  setModalEditarAberto(false)
                }
              >
                Cancelar
              </button>

              <button
                className="btn btn--primary"
                onClick={salvarEdicao}
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExcluirAberto && alunoExcluindo && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>
                <Trash2 size={18} />
                Excluir Aluno
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setModalExcluirAberto(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="alert-box">
              <AlertTriangle size={20} />

              <div>
                <strong>Atenção!</strong>

                <p>
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <p className="delete-question">
              Deseja excluir este aluno?
            </p>

            <div className="delete-info">
              <strong>{alunoExcluindo.nome}</strong>

              <div>
                <span>
                  CPF: {alunoExcluindo.cpf}
                </span>

                <span>
                  Plano: {alunoExcluindo.plano || "-"}
                </span>

                <span>
                  Status:{" "}
                  {alunoExcluindo.status_assinatura ||
                    alunoExcluindo.status ||
                    "-"}
                </span>

                <span>
                  Matrícula: {alunoExcluindo.matricula}
                </span>

                <span>
                  Nascimento:{" "}
                  {formatarData(
                    alunoExcluindo.dataNascimento ||
                      alunoExcluindo.data_nascimento
                  )}
                </span>

                <span>
                  E-mail: {alunoExcluindo.email}
                </span>

                <span>
                  Telefone: {alunoExcluindo.telefone}
                </span>

                <span>
                  Endereço: {alunoExcluindo.endereco}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() =>
                  setModalExcluirAberto(false)
                }
              >
                Cancelar
              </button>

              <button
                className="btn btn--danger"
                onClick={confirmarExclusao}
              >
                Excluir aluno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}