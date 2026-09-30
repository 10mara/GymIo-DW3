
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../layout/Sidebar";
import "../styles/financeiro.css";
import { Plus } from "lucide-react";

import {
  listarTransacoes,
  criarTransacao,
  atualizarTransacao,
  excluirTransacao,
  buscarResumoFinanceiro,
  buscarGraficoFinanceiro,
  buscarAlunosFinanceiro,
} from "../services/financeiroService";

const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const date = (value) => {
  if (!value) return "-";

  const data = new Date(value);

  if (Number.isNaN(data.getTime())) {
    return "-";
  }

  return data.toLocaleDateString("pt-BR");
};

const dateTime = (value) => {
  if (!value) return "-";

  const data = new Date(value);

  if (Number.isNaN(data.getTime())) {
    return "-";
  }

  return data.toLocaleString("pt-BR");
};

const emptyForm = {
  tipo: "receber",
  aluno: "",
  valor: "",
  vencimento: "",
  categoria: "",
  status: "Pendente",
  descricao: "",
};

function Financeiro() {
  const [transactions, setTransactions] = useState([]);

  const [financialSummary, setFinancialSummary] = useState({
    receber: 0,
    pagar: 0,
    saldo: 0,
    despesasFixas: 0,
  });

  const [chartData, setChartData] = useState([]);

  const [activeTab, setActiveTab] = useState("receber");
  const [modal, setModal] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 5;

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  async function carregarDados() {
    try {
      setLoading(true);
      setError("");

      const [
        transacoes,
        resumo,
        grafico,
      ] = await Promise.all([
        listarTransacoes(),
        buscarResumoFinanceiro(),
        buscarGraficoFinanceiro(),
      ]);

      setTransactions(transacoes);
      setFinancialSummary(resumo);
      setChartData(grafico);
    } catch (error) {
      console.error("Erro ao carregar Financeiro:", error);

      setError(
        error.message ||
          "Não foi possível carregar os dados financeiros."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ============================================================
  // FILTRO
  // ============================================================

  const filteredTransactions = useMemo(() => {
    const textoBusca = search.toLowerCase().trim();

    return transactions.filter((item) => {
      const matchesTab = item.tipo === activeTab;

      const texto = `
        ${item.aluno || ""}
        ${item.cpfAluno || ""}
        ${item.descricao || ""}
        ${item.categoria || ""}
      `.toLowerCase();

      return matchesTab && texto.includes(textoBusca);
    });
  }, [transactions, activeTab, search]);

  const visibleTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  // ============================================================
  // MODAIS
  // ============================================================

  function openNewModal() {
    setSelectedTransaction(null);

    setForm({
      ...emptyForm,
      tipo: activeTab,
    });

    setModal("new");
  }

  function openEditModal(transaction) {
    setSelectedTransaction(transaction);

    setForm({
      tipo: transaction.tipo || "receber",
      aluno:
        transaction.aluno === "Não informado"
          ? ""
          : transaction.aluno || "",
      valor: transaction.valor || "",
      vencimento: transaction.vencimento || "",
      categoria: transaction.categoria || "",
      status: transaction.status || "Pendente",
      descricao: transaction.descricao || "",
    });

    setModal("edit");
  }

  function openDetailsModal(transaction) {
    setSelectedTransaction(transaction);
    setModal("details");
  }

  function openDeleteModal(transaction) {
    setSelectedTransaction(transaction);
    setModal("delete");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setSelectedTransaction(null);
  }

  // ============================================================
  // FORM
  // ============================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const dados = {
        tipo: form.tipo,
        aluno: form.aluno.trim(),
        valor: Number(form.valor),
        vencimento: form.vencimento,
        categoria: form.categoria,
        status: form.status,
        descricao: form.descricao.trim(),
      };

      if (!dados.valor || dados.valor <= 0) {
        throw new Error("Informe um valor válido.");
      }

      if (!dados.vencimento) {
        throw new Error("Informe o vencimento.");
      }

      if (!dados.categoria) {
        throw new Error("Selecione uma categoria.");
      }

      if (modal === "edit") {
        await atualizarTransacao(
          selectedTransaction.id,
          dados
        );
      } else {
        await criarTransacao(dados);
      }

      await carregarDados();

      setModal(null);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Erro ao salvar:", error);

      setError(
        error.message ||
          "Não foi possível salvar a transação."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // EXCLUIR
  // ============================================================

  async function handleDelete() {
    if (!selectedTransaction?.id) return;

    try {
      setSaving(true);
      setError("");

      await excluirTransacao(selectedTransaction.id);

      await carregarDados();

      setModal(null);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);

      setError(
        error.message ||
          "Não foi possível excluir a transação."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // ABA
  // ============================================================

  function changeTab(tab) {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
  }

  // ============================================================
  // GRÁFICO
  // ============================================================

  const chartPoints = useMemo(() => {
    if (!chartData.length) return [];

    const maiorValor = Math.max(
      ...chartData.flatMap((item) => [
        Number(item.receitas || 0),
        Number(item.despesas || 0),
      ]),
      1
    );

    const largura = 660;
    const altura = 160;

    const margemX = 30;
    const baseY = 185;

    const passo =
      chartData.length === 1
        ? 0
        : largura / (chartData.length - 1);

    function calcularY(valor) {
      return (
        baseY -
        (Number(valor || 0) / maiorValor) * altura
      );
    }

    const receitas = chartData.map((item, index) => ({
      x: margemX + passo * index,
      y: calcularY(item.receitas),
    }));

    const despesas = chartData.map((item, index) => ({
      x: margemX + passo * index,
      y: calcularY(item.despesas),
    }));

    return {
      receitas,
      despesas,
      maiorValor,
    };
  }, [chartData]);

  const receitaPoints = chartPoints.receitas
    ?.map((point) => `${point.x},${point.y}`)
    .join(" ");

  const despesaPoints = chartPoints.despesas
    ?.map((point) => `${point.x},${point.y}`)
    .join(" ");

  // ============================================================
  // RELATÓRIOS
  // ============================================================

  function abrirRelatorios() {
    window.location.href = "/Relatorios";
  }

  return (
    <div className="app-container financeiro-layout">
      <Sidebar />

      <main className="financeiro-page">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="financeiro-header">
          <div>
            <h1>Financeiro</h1>
            <p>Gestão de contas a pagar e receber</p>
          </div>

          <button 
  className="btn btn--primary" 
  onClick={openNewModal}
>
  <Plus size={16} />
  Nova Transação
</button>
        </header>

        {/* ================================================== */}
        {/* ERRO */}
        {/* ================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* CARDS */}
        {/* ================================================== */}

        <section className="financeiro-stats">

          <StatCard
            title="A Receber"
            value={money(financialSummary.receber)}
            variation="Total registrado"
            icon="↗"
            variant="green"
          />

          <StatCard
            title="A Pagar"
            value={money(financialSummary.pagar)}
            variation="Total registrado"
            icon="↘"
            variant="red"
          />

          <StatCard
            title="Saldo em Caixa"
            value={money(financialSummary.saldo)}
            variation="Receitas - despesas"
            icon="▣"
            variant="blue"
          />

          <StatCard
            title="Despesas Fixas (mês)"
            value={money(financialSummary.despesasFixas)}
            variation="Mês atual"
            icon="◷"
            variant="purple"
          />

        </section>

        {/* ================================================== */}
        {/* GRÁFICO */}
        {/* ================================================== */}

        <section className="financeiro-chart-card">

          <div className="section-heading">

            <div>
              <h2>Fluxo de Caixa</h2>
              <p>Receitas vs. Despesas</p>
            </div>

            <div className="chart-legend">

              <span>
                <i className="legend-dot legend-dot--green" />
                Receitas
              </span>

              <span>
                <i className="legend-dot legend-dot--red" />
                Despesas
              </span>

            </div>

          </div>

          {loading ? (
            <div
              style={{
                minHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Carregando gráfico...
            </div>
          ) : (
            <div
              className="cash-flow-chart"
              aria-label="Gráfico de fluxo de caixa"
            >

              <div className="chart-y-labels">

                <span>
                  {money(chartPoints.maiorValor || 0)}
                </span>

                <span>
                  {money(
                    (chartPoints.maiorValor || 0) * 0.75
                  )}
                </span>

                <span>
                  {money(
                    (chartPoints.maiorValor || 0) * 0.5
                  )}
                </span>

                <span>
                  {money(
                    (chartPoints.maiorValor || 0) * 0.25
                  )}
                </span>

                <span>R$ 0</span>

              </div>

              <div className="chart-area">

                <div className="chart-grid-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <svg
                  viewBox="0 0 720 230"
                  preserveAspectRatio="none"
                  role="img"
                >

                  {chartPoints.receitas?.length > 0 && (
                    <>
                      <polygon
                        points={`${receitaPoints} 690,205 30,205`}
                        className="chart-fill chart-fill--green"
                      />

                      <polyline
                        points={receitaPoints}
                        className="chart-line chart-line--green"
                      />

                      {chartPoints.receitas.map(
                        (point, index) => (
                          <circle
                            key={`receita-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            className="chart-point chart-point--green"
                          />
                        )
                      )}
                    </>
                  )}

                  {chartPoints.despesas?.length > 0 && (
                    <>
                      <polygon
                        points={`${despesaPoints} 690,205 30,205`}
                        className="chart-fill chart-fill--red"
                      />

                      <polyline
                        points={despesaPoints}
                        className="chart-line chart-line--red"
                      />

                      {chartPoints.despesas.map(
                        (point, index) => (
                          <circle
                            key={`despesa-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            className="chart-point chart-point--red"
                          />
                        )
                      )}
                    </>
                  )}

                </svg>

                <div className="chart-x-labels">

                  {chartData.map((item) => (
                    <span key={item.chave}>
                      {item.mes}
                    </span>
                  ))}

                </div>

              </div>

            </div>
          )}

        </section>

        {/* ================================================== */}
        {/* TABELA */}
        {/* ================================================== */}

        <section className="financeiro-main-grid">

          <div className="transactions-card">

            <div className="transactions-tabs">

              <button
                className={
                  activeTab === "receber"
                    ? "tab active"
                    : "tab"
                }
                onClick={() => changeTab("receber")}
              >
                ▣ Contas a Receber
              </button>

              <button
                className={
                  activeTab === "pagar"
                    ? "tab active"
                    : "tab"
                }
                onClick={() => changeTab("pagar")}
              >
                ▣ Contas a Pagar
              </button>

            </div>

            <div className="transactions-toolbar">

              <label className="search-box">

                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Pesquisar transação..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                />

              </label>

              <button
                className="btn btn--outline"
                onClick={openNewModal}
              >
                ＋ Adicionar
              </button>

            </div>

            <div className="table-wrapper">

              <table className="financeiro-table">

                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="empty-state"
                      >
                        Carregando transações...
                      </td>
                    </tr>
                  ) : (
                    visibleTransactions.map(
                      (transaction) => (
                        <tr key={transaction.id}>

                          <td>
                            <div className="student-cell">

                              <span className="avatar">
                                {transaction.initials}
                              </span>

                              <strong>
                                {transaction.aluno}
                              </strong>

                            </div>
                          </td>

                          <td>
                            <span
                              className={`type-badge type-badge--${transaction.tipo}`}
                            >
                              {transaction.tipo === "receber"
                                ? "A Receber"
                                : "A Pagar"}
                            </span>
                          </td>

                          <td>
                            {transaction.descricao || "-"}
                          </td>

                          <td className="value-cell">
                            {money(transaction.valor)}
                          </td>

                          <td>
                            {date(transaction.vencimento)}
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${(
                                transaction.status ||
                                "Pendente"
                              ).toLowerCase()}`}
                            >
                              {transaction.status ||
                                "Pendente"}
                            </span>
                          </td>

                          <td>

                            <div className="table-actions">

                              {/* EDITAR */}

                              <button
                                type="button"
                                className="action-btn edit"
                                title="Editar"
                                onClick={() =>
                                  openEditModal(transaction)
                                }
                              >
                                ✎
                              </button>

                              {/* EXCLUIR */}

                              <button
                                type="button"
                                className="action-btn delete"
                                title="Excluir"
                                onClick={() =>
                                  openDeleteModal(transaction)
                                }
                              >
                                ×
                              </button>

                              {/* DETALHES */}

                              <button
                                type="button"
                                className="action-btn details"
                                title="Detalhes"
                                onClick={() =>
                                  openDetailsModal(transaction)
                                }
                              >
                                ⓘ
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                  {!loading &&
                    !visibleTransactions.length && (
                      <tr>
                        <td
                          colSpan="7"
                          className="empty-state"
                        >
                          Nenhuma transação encontrada.
                        </td>
                      </tr>
                    )}

                </tbody>

              </table>

            </div>

            <div className="table-footer">

              <span>
                Mostrando {visibleTransactions.length} de{" "}
                {filteredTransactions.length} registros
              </span>

              <div className="pagination">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                >
                  ›
                </button>

              </div>

            </div>

          </div>

          {/* ================================================== */}
          {/* ACESSOS RÁPIDOS */}
          {/* ================================================== */}

          <aside className="quick-access-card">

            <h2>Acessos Rápidos</h2>

            <button
              className="quick-access-item"
              onClick={openNewModal}
            >
              <span className="quick-icon quick-icon--green">
                ＋
              </span>

              <span>
                <strong>Nova Transação</strong>
                <small>
                  Adicionar receita ou despesa
                </small>
              </span>

              <b>›</b>
            </button>

            <button
              className="quick-access-item"
              onClick={abrirRelatorios}
            >
              <span className="quick-icon quick-icon--amber">
                ▣
              </span>

              <span>
                <strong>Relatório Financeiro</strong>

                <small>
                  Ver relatórios detalhados
                </small>
              </span>

              <b>›</b>
            </button>

          </aside>

        </section>

      </main>

      {/* ====================================================== */}
      {/* MODAIS */}
      {/* ====================================================== */}

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >

          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {modal === "new" && (
              <TransactionFormModal
                title="Nova Transação"
                subtitle="Crie uma nova transação financeira."
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={closeModal}
                submitLabel={
                  saving ? "Salvando..." : "Salvar"
                }
              />
            )}

            {modal === "edit" && (
              <TransactionFormModal
                title="Editar Transação"
                subtitle="Edite as informações da transação."
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={closeModal}
                submitLabel={
                  saving
                    ? "Salvando..."
                    : "Salvar Alterações"
                }
              />
            )}

            {modal === "delete" && (
              <DeleteModal
                transaction={selectedTransaction}
                onClose={closeModal}
                onConfirm={handleDelete}
                saving={saving}
              />
            )}

            {modal === "details" && (
              <DetailsModal
                transaction={selectedTransaction}
                onClose={closeModal}
              />
            )}

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// CARD
// ============================================================

function StatCard({
  title,
  value,
  variation,
  icon,
  variant,
}) {
  return (
    <article className="stat-card">

      <div
        className={`stat-icon stat-icon--${variant}`}
      >
        {icon}
      </div>

      <div>

        <span>{title}</span>

        <strong>{value}</strong>

        <small
          className={
            variant === "red"
              ? "negative"
              : "positive"
          }
        >
          {variation}
        </small>

      </div>

    </article>
  );
}

// ============================================================
// FORMULÁRIO
// ============================================================

function TransactionFormModal({
  title,
  subtitle,
  form,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
}) {
  // ==========================================================
  // BUSCA DE ALUNOS
  // ==========================================================

  const [alunos, setAlunos] = useState([]);
  const [buscandoAlunos, setBuscandoAlunos] =
    useState(false);
  const [mostrarAlunos, setMostrarAlunos] =
    useState(false);

  useEffect(() => {
    const nome = form.aluno.trim();

    if (!nome) {
      setAlunos([]);
      setMostrarAlunos(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setBuscandoAlunos(true);
        setMostrarAlunos(true);

        const resultado =
          await buscarAlunosFinanceiro(nome);

        setAlunos(
          Array.isArray(resultado)
            ? resultado
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao buscar alunos:",
          error
        );

        setAlunos([]);
      } finally {
        setBuscandoAlunos(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [form.aluno]);

  // ==========================================================
  // SELECIONAR ALUNO
  // ==========================================================

  function selecionarAluno(aluno) {
    onChange({
      target: {
        name: "aluno",
        value: aluno.nome,
      },
    });

    setMostrarAlunos(false);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form
      className="modal-form"
      onSubmit={onSubmit}
    >

      <div className="modal-header">

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

      </div>

      <div className="transaction-type-selector">

        <label>Tipo de Transação *</label>

        <div className="type-options">

          <label
            className={
              form.tipo === "receber"
                ? "selected receive"
                : "receive"
            }
          >

            <input
              type="radio"
              name="tipo"
              value="receber"
              checked={form.tipo === "receber"}
              onChange={onChange}
            />

            A Receber ↗

          </label>

          <label
            className={
              form.tipo === "pagar"
                ? "selected pay"
                : "pay"
            }
          >

            <input
              type="radio"
              name="tipo"
              value="pagar"
              checked={form.tipo === "pagar"}
              onChange={onChange}
            />

            A Pagar ↘

          </label>

        </div>

      </div>

      <div className="modal-grid">

        {/* ================================================== */}
        {/* ALUNO COM AUTOCOMPLETE */}
        {/* ================================================== */}

        <div
          className="input-group input-full aluno-autocomplete"
        >

          <label htmlFor="aluno">
            Aluno (opcional)
          </label>

          <input
            id="aluno"
            name="aluno"
            value={form.aluno}
            onChange={(event) => {
              onChange(event);

              if (
                event.target.value.trim()
              ) {
                setMostrarAlunos(true);
              } else {
                setMostrarAlunos(false);
              }
            }}
            onFocus={() => {
              if (form.aluno.trim()) {
                setMostrarAlunos(true);
              }
            }}
            placeholder="Digite o nome do aluno..."
            autoComplete="off"
          />

          {/* LISTA DE SUGESTÕES */}

          {mostrarAlunos &&
            form.aluno.trim() && (
              <div className="aluno-suggestions">

                {/* BUSCANDO */}

                {buscandoAlunos && (
                  <div className="aluno-suggestion loading">
                    Buscando alunos...
                  </div>
                )}

                {/* ALUNOS ENCONTRADOS */}

                {!buscandoAlunos &&
                  alunos.length > 0 &&
                  alunos.map((aluno) => (
                    <button
                      key={aluno.id}
                      type="button"
                      className="aluno-suggestion"
                      onClick={() =>
                        selecionarAluno(aluno)
                      }
                    >

                      <span className="aluno-suggestion-name">
                        {aluno.nome}
                      </span>

                      {aluno.cpf && (
                        <span className="aluno-suggestion-cpf">
                          CPF: {aluno.cpf}
                        </span>
                      )}

                    </button>
                  ))}

                {/* NENHUM ALUNO */}

                {!buscandoAlunos &&
                  alunos.length === 0 && (
                    <div className="aluno-suggestion not-found">
                      Aluno não encontrado
                    </div>
                  )}

              </div>
            )}

        </div>

        {/* ================================================== */}
        {/* VALOR */}
        {/* ================================================== */}

        <div className="input-group">

          <label htmlFor="valor">
            Valor *
          </label>

          <input
            id="valor"
            name="valor"
            type="number"
            min="0"
            step="0.01"
            value={form.valor}
            onChange={onChange}
            placeholder="0,00"
            required
          />

        </div>

        {/* ================================================== */}
        {/* VENCIMENTO */}
        {/* ================================================== */}

        <div className="input-group">

          <label htmlFor="vencimento">
            Vencimento *
          </label>

          <input
            id="vencimento"
            name="vencimento"
            type="date"
            value={form.vencimento}
            onChange={onChange}
            required
          />

        </div>

        {/* ================================================== */}
        {/* CATEGORIA */}
        {/* ================================================== */}

        <div className="input-group">

          <label htmlFor="categoria">
            Categoria *
          </label>

          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={onChange}
            required
          >

            <option value="">
              Selecione uma categoria...
            </option>

            <option value="Mensalidade">
              Mensalidade
            </option>

            <option value="Salários">
              Salários
            </option>

            <option value="Despesas fixas">
              Despesas fixas
            </option>

            <option value="Equipamentos">
              Equipamentos
            </option>

            <option value="Outros">
              Outros
            </option>

          </select>

        </div>

        {/* ================================================== */}
        {/* STATUS */}
        {/* ================================================== */}

        <div className="input-group">

          <label htmlFor="status">
            Status *
          </label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={onChange}
            required
          >

            <option value="Pendente">
              Pendente
            </option>

            <option value="Pago">
              Pago
            </option>

            <option value="Atrasado">
              Atrasado
            </option>

          </select>

        </div>

        {/* ================================================== */}
        {/* DESCRIÇÃO */}
        {/* ================================================== */}

        <div className="input-group input-full">

          <label htmlFor="descricao">
            Descrição (opcional)
          </label>

          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={onChange}
            placeholder="Informe uma descrição..."
            rows="3"
          />

        </div>

      </div>

      <div className="modal-footer">

        <button
          type="button"
          className="btn btn--outline"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn--primary"
        >
          {submitLabel}
        </button>

      </div>

    </form>
  );
}

// ============================================================
// MODAL EXCLUSÃO
// ============================================================

function DeleteModal({
  transaction,
  onClose,
  onConfirm,
  saving,
}) {
  return (
    <div className="delete-modal">

      <div className="modal-header">

        <h2>Excluir Transação</h2>

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

      </div>

      <div className="alert-box">

        <strong>⚠ Atenção!</strong>

        <p>
          A transação selecionada será excluída
          do sistema.
        </p>

      </div>

      <p className="delete-question">
        Tem certeza de que deseja excluir esta
        transação?
      </p>

      <div className="transaction-summary">

        <strong>
          {transaction?.aluno || "Não informado"}
        </strong>

        <span>
          {transaction?.descricao || "-"}
        </span>

        <span>
          {money(transaction?.valor || 0)}
        </span>

        <span>
          {date(transaction?.vencimento)}
        </span>

      </div>

      <div className="modal-footer">

        <button
          type="button"
          className="btn btn--outline"
          onClick={onClose}
          disabled={saving}
        >
          Voltar
        </button>

        <button
          type="button"
          className="btn btn--danger"
          onClick={onConfirm}
          disabled={saving}
        >
          {saving
            ? "Excluindo..."
            : "Confirmar Exclusão"}
        </button>

      </div>

    </div>
  );
}

// ============================================================
// MODAL DETALHES
// ============================================================

function DetailsModal({
  transaction,
  onClose,
}) {
  if (!transaction) return null;

  return (
    <div className="details-modal">

      <div className="modal-header">

        <div>

          <h2>Detalhes da Transação</h2>

          <p>
            Informações completas do registro.
          </p>

        </div>

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

      </div>

      <div className="details-person">

        <span className="avatar">
          {transaction.initials}
        </span>

        <div>

          <strong>
            {transaction.aluno}
          </strong>

          <span
            className={`type-badge type-badge--${transaction.tipo}`}
          >
            {transaction.tipo === "receber"
              ? "A Receber"
              : "A Pagar"}
          </span>

        </div>

      </div>

      <div className="details-list">

        <div>
          <span>Valor</span>
          <strong>
            {money(transaction.valor)}
          </strong>
        </div>

        <div>
          <span>Aluno</span>
          <strong>
            {transaction.aluno}
          </strong>
        </div>

        <div>
          <span>CPF</span>
          <strong>
            {transaction.cpfAluno || "-"}
          </strong>
        </div>

        <div>
          <span>Vencimento</span>
          <strong>
            {date(transaction.vencimento)}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>
            {transaction.status}
          </strong>
        </div>

        <div>
          <span>Categoria</span>
          <strong>
            {transaction.categoria || "-"}
          </strong>
        </div>

        <div>
          <span>Descrição</span>
          <strong>
            {transaction.descricao || "-"}
          </strong>
        </div>

        <div>
          <span>Data de criação</span>
          <strong>
            {dateTime(transaction.criadoEm)}
          </strong>
        </div>

      </div>

      <div className="modal-footer">

        <button
          type="button"
          className="btn btn--outline"
          onClick={onClose}
        >
          Fechar
        </button>

      </div>

    </div>
  );
}

export default Financeiro;
