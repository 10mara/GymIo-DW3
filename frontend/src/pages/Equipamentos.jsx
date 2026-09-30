import React, { useState, useEffect } from "react";
import "../styles/modal_equipamentos.css";
import "../styles/equipamentos.css";

import Sidebar from "../layout/Sidebar";

import ModalNovoEquipamento from "../components/ModalNovoEquipamento";
import ModalEditarEquipamento from "../components/ModalEditarEquipamento";
import ModalDetalhesEquipamento from "../components/ModalDetalhesEquipamento";
import ModalExcluirEquipamento from "../components/ModalExcluirEquipamento";
import ModalNovaManutencao from "../components/ModalNovaManutencao";
import ModalEditarManutencao from "../components/ModalEditarManutencao";
import ModalDetalhesManutencao from "../components/ModalDetalhesManutencao";
import ModalExcluirManutencao from "../components/ModalExcluirManutencao";

import {
  Search,
  Plus,
  Wrench,
  CheckCircle,
  Dumbbell,
  Pencil,
  Trash2,
  Info,
  Calendar,
} from "lucide-react";

const API_EQUIPAMENTOS = "http://localhost:3002/api/equipamentos";
const API_MANUTENCOES = "http://localhost:3002/api/manutencoes";

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [busca, setBusca] = useState("");

  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  const [modalNovaManutencao, setModalNovaManutencao] = useState(false);
  const [modalEditarManutencao, setModalEditarManutencao] = useState(false);
  const [modalDetalhesManutencao, setModalDetalhesManutencao] = useState(false);
  const [modalExcluirManutencao, setModalExcluirManutencao] = useState(false);

  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);

  useEffect(() => {
    carregarEquipamentos();
    carregarManutencoes();
  }, []);

  async function carregarEquipamentos() {
    try {
      const resposta = await fetch(API_EQUIPAMENTOS);
      const dados = await resposta.json();
      setEquipamentos(dados);
    } catch (erro) {
      console.error("Erro ao carregar equipamentos:", erro);
    }
  }

  async function carregarManutencoes() {
    try {
      const resposta = await fetch(API_MANUTENCOES);
      const dados = await resposta.json();
      setManutencoes(dados);
    } catch (erro) {
      console.error("Erro ao carregar manutenções:", erro);
    }
  }

  const abrirEditar = (eq) => {
    setEquipamentoSelecionado(eq);
    setModalEditar(true);
  };

  const abrirDetalhes = (eq) => {
    setEquipamentoSelecionado(eq);
    setModalDetalhes(true);
  };

  const abrirExcluir = (eq) => {
    setEquipamentoSelecionado(eq);
    setModalExcluir(true);
  };

  const criarEquipamento = async (dados) => {
    try {
      await fetch(API_EQUIPAMENTOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      await carregarEquipamentos();
    } catch (erro) {
      console.error("Erro ao criar equipamento:", erro);
    }
  };

  const salvarEquipamento = async (dados) => {
    try {
      await fetch(`${API_EQUIPAMENTOS}/${equipamentoSelecionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      await carregarEquipamentos();
    } catch (erro) {
      console.error("Erro ao salvar equipamento:", erro);
    }
  };

  const excluirEquipamento = async (eq) => {
    try {
      await fetch(`${API_EQUIPAMENTOS}/${eq.id}`, {
        method: "DELETE",
      });

      await carregarEquipamentos();
      await carregarManutencoes();
    } catch (erro) {
      console.error("Erro ao excluir equipamento:", erro);
    }
  };

  const abrirNovaManutencao = () => setModalNovaManutencao(true);

  const abrirEditarManutencao = (m) => {
    setManutencaoSelecionada(m);
    setModalEditarManutencao(true);
  };

  const abrirDetalhesManutencao = (m) => {
    setManutencaoSelecionada(m);
    setModalDetalhesManutencao(true);
  };

  const abrirExcluirManutencao = (m) => {
    setManutencaoSelecionada(m);
    setModalExcluirManutencao(true);
  };

  const criarManutencao = async (dados) => {
    try {
      await fetch(API_MANUTENCOES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      await carregarManutencoes();
      await carregarEquipamentos();
    } catch (erro) {
      console.error("Erro ao criar manutenção:", erro);
    }
  };

  const salvarManutencao = async (dados) => {
    try {
      await fetch(`${API_MANUTENCOES}/${manutencaoSelecionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      await carregarManutencoes();
    } catch (erro) {
      console.error("Erro ao salvar manutenção:", erro);
    }
  };

  const excluirManutencao = async (m) => {
    try {
      await fetch(`${API_MANUTENCOES}/${m.id}`, {
        method: "DELETE",
      });

      await carregarManutencoes();
    } catch (erro) {
      console.error("Erro ao excluir manutenção:", erro);
    }
  };

  const totalFuncionando = equipamentos.filter(
    (e) => e.status?.toLowerCase() === "funcionando"
  ).length;

  const totalManutencao = equipamentos.filter(
    (e) =>
      e.status?.toLowerCase() === "manutenção" ||
      e.status?.toLowerCase() === "manutencao"
  ).length;

  const equipamentosFiltrados = equipamentos.filter((eq) => {
    const texto = busca.toLowerCase();

    return (
      eq.nome?.toLowerCase().includes(texto) ||
      eq.codigo?.toLowerCase().includes(texto) ||
      eq.status?.toLowerCase().includes(texto) ||
      eq.categoria?.toLowerCase().includes(texto) ||
      eq.localizacao?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="app-container">
      <Sidebar />

      <main className="equipamentos-page">
        <div className="equipamentos-header">
          <div>
            <h1>Equipamentos</h1>
            <p>Gestão de máquinas e manutenção</p>
          </div>

          <button className="btn btn--primary btn--lg" onClick={() => setModalNovo(true)}>
            <Plus size={18} /> Novo Equipamento
          </button>
        </div>

        <div className="equipamentos-cards">
  <div className="equip-card-info">
    <div className="equip-card-texto">
      <span>Total de Equipamentos</span>
      <h2>{equipamentos.length}</h2>
    </div>
    <div className="equip-icon azul">
      <Dumbbell size={22} />
    </div>
  </div>

  <div className="equip-card-info">
    <div className="equip-card-texto">
      <span>Funcionando</span>
      <h2>{totalFuncionando}</h2>
    </div>
    <div className="equip-icon verde">
      <CheckCircle size={22} />
    </div>
  </div>

  <div className="equip-card-info">
    <div className="equip-card-texto">
      <span>Em Manutenção</span>
      <h2>{totalManutencao}</h2>
    </div>
    <div className="equip-icon amarelo">
      <Wrench size={22} />
    </div>
  </div>
</div>

        <div className="equipamentos-box">
          <div className="box-header">
            <h2>Lista de Equipamentos</h2>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar equipamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="equipamentos-table-wrapper">
            <table className="equipamentos-table">
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Código</th>
                  <th>Status</th>
                  <th>Última Manutenção</th>
                  <th>Próxima</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {equipamentosFiltrados.map((eq) => (
                  <tr key={eq.id}>
                    <td>{eq.nome}</td>
                    <td>{eq.codigo || "-"}</td>
                    <td>
                      <span
                        className={`status ${eq.status?.toLowerCase() === "funcionando"
                          ? "funcionando"
                          : "manutencao"
                          }`}
                      >
                        {eq.status || "-"}
                      </span>
                    </td>
                    <td>{eq.ultimaManutencao || "-"}</td>
                    <td>{eq.proximaManutencao || "-"}</td>
                    <td className="acoes">
                      <Pencil
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => abrirEditar(eq)}
                      />
                      <Trash2
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => abrirExcluir(eq)}
                      />
                      <Info
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => abrirDetalhes(eq)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="equipamentos-box">
          <div className="box-header">
            <div>
              <h2>Histórico de Manutenção</h2>
              <p>Últimas manutenções realizadas</p>
            </div>

            <button className="btn-historico" onClick={abrirNovaManutencao}>
              <Calendar size={18} /> Agendar Manutenção
            </button>
          </div>

          {manutencoes.length === 0 ? (
            <p>Nenhuma manutenção cadastrada.</p>
          ) : (
            manutencoes.map((m) => (
              <div className="historico-item" key={m.id}>
                <div>
                  <strong>{m.equipamento || "-"}</strong>
                  <p>{m.data || "-"}</p>
                </div>

                <span
                  className={`tipo ${m.tipo === "Preventiva" ? "preventiva" : "corretiva"
                    }`}
                >
                  {m.tipo || "-"}
                </span>

                <strong>
                  R${" "}
                  {Number(m.valorPrevisto || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>

                <div className="acoes">
                  <Pencil
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirEditarManutencao(m)}
                  />
                  <Trash2
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirExcluirManutencao(m)}
                  />
                  <Info
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirDetalhesManutencao(m)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <ModalNovoEquipamento
          aberto={modalNovo}
          fechar={() => setModalNovo(false)}
          salvar={criarEquipamento}
        />

        <ModalEditarEquipamento
          aberto={modalEditar}
          fechar={() => setModalEditar(false)}
          equipamento={equipamentoSelecionado}
          salvar={salvarEquipamento}
        />

        <ModalDetalhesEquipamento
          aberto={modalDetalhes}
          fechar={() => setModalDetalhes(false)}
          equipamento={equipamentoSelecionado}
        />

        <ModalExcluirEquipamento
          aberto={modalExcluir}
          fechar={() => setModalExcluir(false)}
          equipamento={equipamentoSelecionado}
          excluir={excluirEquipamento}
        />

        <ModalNovaManutencao
          aberto={modalNovaManutencao}
          fechar={() => setModalNovaManutencao(false)}
          salvar={criarManutencao}
        />

        <ModalEditarManutencao
          aberto={modalEditarManutencao}
          fechar={() => setModalEditarManutencao(false)}
          manutencao={manutencaoSelecionada}
          salvar={salvarManutencao}
        />

        <ModalDetalhesManutencao
          aberto={modalDetalhesManutencao}
          fechar={() => setModalDetalhesManutencao(false)}
          manutencao={manutencaoSelecionada}
        />

        <ModalExcluirManutencao
          aberto={modalExcluirManutencao}
          fechar={() => setModalExcluirManutencao(false)}
          manutencao={manutencaoSelecionada}
          excluir={excluirManutencao}
        />
      </main>
    </div>
  );
}