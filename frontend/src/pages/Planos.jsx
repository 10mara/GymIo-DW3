import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import "../styles/globals.css";
import "../styles/alunos.css";
import "../styles/planos.css";

import {
  Plus,
  Search,
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Star,
} from "lucide-react";

import {
  listarPlanos,
  criarPlano,
  atualizarPlano,
  deletarPlano
} from "../services/planosService";

export default function Planos() {
  const planoInicial = {
    nome: "",
    descricao: "",
    duracao: "",
    valor: "",
    status: "Ativo",
    popular: false,
  };

  const matriculaInicial = {
  aluno_id: "",
  plano_id: "",
  dataInicio: "",
  dataFim: "",
  valor: "",
  status: "Ativa",
};

  const [planos, setPlanos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarTodosPlanos, setMostrarTodosPlanos] = useState(false);

  useEffect(() => {

  async function carregarDados() {

    try {

      const planosData = await listarPlanos();

      setPlanos(planosData);

      const response = await fetch(
        "http://localhost:3002/api/planos/matriculas"
      );

      const matriculasData =
        await response.json();

      setMatriculas(matriculasData);

      const pessoasResponse = await fetch(
        "http://localhost:3002/api/pessoas"
      );

      const pessoasData =
        await pessoasResponse.json();

      setAlunos(pessoasData.filter((p) => p.isAluno));

    } catch(err){

      console.error(
        "Erro ao carregar dados:",
        err
      );

    }

  }

  carregarDados();

}, []);

  const [modalPlanoAberto, setModalPlanoAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState(null);
  const [dadosPlano, setDadosPlano] = useState(planoInicial);

  const [modalMatriculaAberto, setModalMatriculaAberto] = useState(false);
  const [matriculaEditando, setMatriculaEditando] = useState(null);
  const [dadosMatricula, setDadosMatricula] = useState(matriculaInicial);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [itemExcluir, setItemExcluir] = useState(null);

  const matriculasFiltradas = useMemo(() => {
  const termo = busca.toLowerCase();

  return matriculas.filter((item) => {
    return (
      (item.aluno ?? "").toLowerCase().includes(termo) ||
      (item.plano ?? "").toLowerCase().includes(termo) ||
      statusExibicao(item).toLowerCase().includes(termo)
    );
  });
}, [busca, matriculas]);

  const LIMITE_PLANOS = 6;
  const planosExibidos = mostrarTodosPlanos ? planos : planos.slice(0, LIMITE_PLANOS);

  const totalPlanos = planos.length;
  const matriculasAtivas = matriculas.filter((m) => statusExibicao(m) === "Ativa").length;
  
  const vencendo = matriculas.filter((m) => statusExibicao(m) === "Vencendo").length;

  const crescimento = useMemo(() => {
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

  const mesAtual = matriculas.filter(
    (m) => new Date(m.data_assinatura) >= inicioMesAtual
  ).length;

  const mesAnterior = matriculas.filter((m) => {
    const d = new Date(m.data_assinatura);
    return d >= inicioMesAnterior && d < inicioMesAtual;
  }).length;

  let percentual;
  if (mesAnterior === 0) {
    percentual = mesAtual > 0 ? 100 : 0;
  } else {
    percentual = Math.round(((mesAtual - mesAnterior) / mesAnterior) * 100);
  }

  return { percentual, mesAtual, mesAnterior };
}, [matriculas]);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function iniciais(nome = "") {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

function statusExibicao(m) {
  const status = (m.status || "").toLowerCase();

  if (status.startsWith("cancelad")) return "Cancelada";
  if (status === "inadimplente") return "Inadimplente";
  if (status === "inativo") return "Inativo";

  const dias = (new Date(m.data_fim) - new Date()) / 86400000;
  if (status === "ativo" && dias >= 0 && dias <= 15) return "Vencendo";
  if (status === "ativo") return "Ativa";

  return "Outro";
}
  function abrirNovoPlano() {
    setPlanoEditando(null);
    setDadosPlano(planoInicial);
    setModalPlanoAberto(true);
  }

 function abrirEditarPlano(plano) {

  setPlanoEditando(plano);

  setDadosPlano({
    nome: plano.nome_plano,
    descricao: plano.descricao,
    duracao: plano.duracao_meses,
    valor: plano.valor,
    status: "Ativo",
    popular: plano.popular || false
  });

  setModalPlanoAberto(true);

}

  async function salvarPlano() {
  try {
    const payload = {
      nome_plano: dadosPlano.nome,
      descricao: dadosPlano.descricao,
      valor: Number(dadosPlano.valor),
      duracao_meses: Number(dadosPlano.duracao),
    };

    if (planoEditando) {
      const atualizado = await atualizarPlano(planoEditando.id, payload);

      setPlanos((lista) =>
        lista.map((p) =>
          p.id === planoEditando.id ? atualizado : p
        )
      );
    } else {
      const criado = await criarPlano(payload);

      setPlanos((lista) => [...lista, criado]);
    }

    setModalPlanoAberto(false);
  } catch (err) {
    console.error("Erro ao salvar plano:", err);
  }
}

  function abrirNovaMatricula() {
    setMatriculaEditando(null);
    setDadosMatricula(matriculaInicial);
    setModalMatriculaAberto(true);
  }

  function abrirEditarMatricula(matricula) {
  setMatriculaEditando(matricula);
  setDadosMatricula({
    aluno_id: matricula.aluno_id,
    plano_id: matricula.plano_id,
    status: matricula.status,
  });
  setModalMatriculaAberto(true);
}

  async function salvarMatricula() {
  try {
    const payload = {
      aluno_id: dadosMatricula.aluno_id,
      plano_id: dadosMatricula.plano_id,
    };

    let response;

    if (matriculaEditando) {
      payload.status_assinatura = dadosMatricula.status;

      response = await fetch(
        `http://localhost:3002/api/planos/matriculas/${matriculaEditando.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } else {
      response = await fetch(
        "http://localhost:3002/api/planos/matriculas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    }

    if (!response.ok) {
      const erro = await response.json();
      console.error("Erro ao salvar matrícula:", erro);
      return;
    }

    const matriculasAtualizadas = await fetch(
      "http://localhost:3002/api/planos/matriculas"
    );

    setMatriculas(await matriculasAtualizadas.json());

    setModalMatriculaAberto(false);
  } catch (err) {
    console.error("Erro ao salvar matrícula:", err);
  }
}

  function confirmarExclusao(tipo, item) {
    setItemExcluir({ tipo, item });
    setModalExcluirAberto(true);
  }

  async function executarExclusao() {
  if (!itemExcluir) return;

  try {
    if (itemExcluir.tipo === "plano") {
      await deletarPlano(itemExcluir.item.id);

      setPlanos((lista) =>
        lista.filter((p) => p.id !== itemExcluir.item.id)
      );
    }

    if (itemExcluir.tipo === "matricula") {
      // se você NÃO tem backend ainda, mantém local
      setMatriculas((lista) =>
        lista.filter((m) => m.id !== itemExcluir.item.id)
      );
    }

    setModalExcluirAberto(false);
    setItemExcluir(null);
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
}

  return (
    <div className="alunos-layout">
      <Sidebar />

      <main className="alunos-page">
        <header className="alunos-header">
          <div>
            <h1>Planos e Matrículas</h1>
            <p>Gerencie planos, valores e matrículas dos alunos</p>
          </div>

          <button className="btn btn--primary" onClick={abrirNovoPlano}>
            <Plus size={17} />
            Novo Plano
          </button>
        </header>

       <section className="stats-grid">
  <article className="stat-card planos-stat-card">
    <div>
      <span>Total de Planos</span>
      <strong>{totalPlanos}</strong>
      <small className="positivo">Planos cadastrados</small>
    </div>
    <div className="stat-icon stat-blue">
      <CreditCard size={22} />
    </div>
  </article>

  <article className="stat-card planos-stat-card">
    <div>
      <span>Matrículas Ativas</span>
      <strong>{matriculasAtivas}</strong>
      <small className="positivo">Alunos matriculados</small>
    </div>
    <div className="stat-icon stat-green">
      <Users size={22} />
    </div>
  </article>

  <article className="stat-card planos-stat-card">
    <div>
      <span>Vencendo em breve</span>
      <strong>{vencendo}</strong>
      <small className="negativo">Requer atenção</small>
    </div>
    <div className="stat-icon stat-amber">
      <Calendar size={22} />
    </div>
  </article>

  <article className="stat-card planos-stat-card">
    <div>
      <span>Crescimento</span>
      <strong>
        {crescimento.percentual >= 0 ? `+${crescimento.percentual}%` : `${crescimento.percentual}%`}
      </strong>
      <small className={crescimento.percentual >= 0 ? "positivo" : "negativo"}>
        {crescimento.mesAtual} este mês (vs. {crescimento.mesAnterior} anterior)
      </small>
    </div>
    <div className="stat-icon stat-green">
      <TrendingUp size={22} />
    </div>
  </article>
</section>

      <section className="planos-section">
  <div className="section-title-row">
    <div>
      <h2>Planos Disponíveis</h2>
      <p>Visualize e edite os planos da academia</p>
    </div>
  </div>

  <div className="planos-grid">
    {planosExibidos.map((plano) => (
      <article
        key={plano.id}
        className={`plano-card ${plano.popular ? "popular" : ""}`}
      >
        {plano.popular && (
          <div className="popular-badge">
            <Star size={12} />
            Popular
          </div>
        )}

        <div className="plano-card-top">
          <div className="plano-icon">
            <CreditCard size={20} />
          </div>

          <div className="table-actions">
            <button
              className="action-btn edit"
              onClick={() => abrirEditarPlano(plano)}
            >
              <Pencil size={14} />
            </button>

            <button
              className="action-btn delete"
              onClick={() => confirmarExclusao("plano", plano)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h3>{plano.nome_plano}</h3>
        <p>{plano.descricao}</p>

        <div className="plano-preco">
          {formatarMoeda(plano.valor)}
          <span>/{plano.duracao_meses} meses</span>
        </div>

        <div className="plano-info">
          <span>Plano ativo</span>
          <span className="badge status-ativo">
            Ativo
          </span>
        </div>
      </article>
    ))}
  </div>

  {planos.length > LIMITE_PLANOS && (
    <button
      className="btn btn--outline"
      onClick={() => setMostrarTodosPlanos((v) => !v)}
      style={{ marginTop: "16px" }}
    >
      {mostrarTodosPlanos ? "Mostrar menos" : `Ver todos os ${planos.length} planos`}
    </button>
  )}
</section>

       
      </main>

      {modalPlanoAberto && (
        <div className="modal-overlay">
          <div className="modal modal-form">
            <div className="modal-header">
              <h2>
                <CreditCard size={18} />
                {planoEditando ? "Editar Plano" : "Novo Plano"}
              </h2>

              <button
                className="modal-close"
                onClick={() => setModalPlanoAberto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-grid">
              <div className="input-group input-full">
                <label>Nome do plano *</label>
                <input
                  value={dadosPlano.nome}
                  onChange={(e) =>
                    setDadosPlano({ ...dadosPlano, nome: e.target.value })
                  }
                  placeholder="Ex: Plano Mensal"
                />
              </div>

              <div className="input-group input-full">
                <label>Descrição</label>
                <input
                  value={dadosPlano.descricao}
                  onChange={(e) =>
                    setDadosPlano({
                      ...dadosPlano,
                      descricao: e.target.value,
                    })
                  }
                  placeholder="Ex: Acesso livre por 30 dias"
                />
              </div>

              <div className="input-group">
                <label>Duração em meses *</label>
                <input
                  type="number"
                  value={dadosPlano.duracao}
                  onChange={(e) =>
                    setDadosPlano({ ...dadosPlano, duracao: e.target.value })
                  }
                  placeholder="30"
                />
              </div>

              <div className="input-group">
                <label>Valor *</label>
                <input
                  type="number"
                  value={dadosPlano.valor}
                  onChange={(e) =>
                    setDadosPlano({ ...dadosPlano, valor: e.target.value })
                  }
                  placeholder="99.90"
                />
              </div>

              <div className="input-group">
                <label>Status</label>
                <select
                  value={dadosPlano.status}
                  onChange={(e) =>
                    setDadosPlano({ ...dadosPlano, status: e.target.value })
                  }
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>

              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={dadosPlano.popular}
                  onChange={(e) =>
                    setDadosPlano({
                      ...dadosPlano,
                      popular: e.target.checked,
                    })
                  }
                />
                Marcar como popular
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() => setModalPlanoAberto(false)}
              >
                Cancelar
              </button>

              <button className="btn btn--primary" onClick={salvarPlano}>
                {planoEditando ? "Salvar alterações" : "Cadastrar plano"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMatriculaAberto && (
        <div className="modal-overlay">
          <div className="modal modal-form">
            <div className="modal-header">
              <h2>
                <Users size={18} />
                {matriculaEditando ? "Editar Matrícula" : "Nova Matrícula"}
              </h2>

              <button
                className="modal-close"
                onClick={() => setModalMatriculaAberto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-grid">
              <div className="input-group input-full">
                <label>Aluno *</label>
                <select
                  value={dadosMatricula.aluno_id || ""}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      aluno_id: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.aluno_id} value={aluno.aluno_id}>
                      {aluno.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Plano *</label>
                <select
                  value={dadosMatricula.plano_id || ""}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      plano_id: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {planos.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome_plano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Valor *</label>
                <input
                  type="number"
                  value={dadosMatricula.valor}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      valor: e.target.value,
                    })
                  }
                  placeholder="99.90"
                />
              </div>

              <div className="input-group">
                <label>Data início *</label>
                <input
                  type="date"
                  value={dadosMatricula.dataInicio}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      dataInicio: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Data fim *</label>
                <input
                  type="date"
                  value={dadosMatricula.dataFim}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      dataFim: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group input-full">
                <label>Status</label>
                <select
                  value={dadosMatricula.status}
                  onChange={(e) =>
                    setDadosMatricula({
                      ...dadosMatricula,
                      status: e.target.value,
                    })
                  }
                >
                  <option>Ativa</option>
                  <option>Vencendo</option>
                  <option>Cancelada</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() => setModalMatriculaAberto(false)}
              >
                Cancelar
              </button>

              <button className="btn btn--primary" onClick={salvarMatricula}>
                {matriculaEditando ? "Salvar alterações" : "Cadastrar matrícula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExcluirAberto && itemExcluir && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>
                <Trash2 size={18} />
                Excluir Registro
              </h2>

              <button
                className="modal-close"
                onClick={() => setModalExcluirAberto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alert-box">
              <AlertTriangle size={20} />
              <div>
                <strong>Atenção!</strong>
                <p>Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="delete-question">
              Deseja excluir{" "}
              <strong>{itemExcluir.item.nome || itemExcluir.item.aluno}</strong>?
            </p>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() => setModalExcluirAberto(false)}
              >
                Cancelar
              </button>

              <button className="btn btn--danger" onClick={executarExclusao}>
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}