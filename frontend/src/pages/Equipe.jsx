import "../styles/equipe.css";
import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import {
  atualizarFuncionario,
  buscarCargos,
  criarFuncionario,
  excluirFuncionario,
  listarFuncionarios,
} from "../services/equipeService";

import ModalNovoFuncionario from "../components/ModalNovoFuncionario";
import ModalEditarFuncionario from "../components/ModalEditarFuncionario";
import ModalExcluirFuncionario from "../components/ModalExcluirFuncionario";
import ModalDetalhesFuncionario from "../components/ModalDetalhesFuncionario";

import {
  Search,
  Pencil,
  Trash2,
  Info,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";

export default function Equipe() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");

  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState(null);

  async function carregarFuncionarios() {
    const dadosFuncionarios = await listarFuncionarios();
    setFuncionarios(dadosFuncionarios);
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [, dadosCargos] = await Promise.all([
          carregarFuncionarios(),
          buscarCargos(),
        ]);

        setCargos(dadosCargos);
      } catch (error) {
        console.error("Erro ao carregar dados da equipe:", error);

        setFuncionarios([]);
        setCargos([]);
        setErro("Não foi possível carregar os dados da equipe.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function cadastrarFuncionario(dados) {
    await criarFuncionario(dados);
    await carregarFuncionarios();
    setModalNovo(false);
  }

  async function salvarEdicaoFuncionario(id, dados) {
    await atualizarFuncionario(id, dados);
    await carregarFuncionarios();
    setModalEditar(false);
  }

  async function confirmarExclusaoFuncionario(id) {
    await excluirFuncionario(id);
    await carregarFuncionarios();
    setModalExcluir(false);
  }

  // Função para normalizar o texto da pesquisa.
  // Remove acentos e transforma tudo em letras minúsculas.
  const normalizarTexto = (texto) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // Termo que está sendo pesquisado
  const termoBusca = normalizarTexto(busca);

  // Filtra os funcionários enquanto o usuário digita
  const funcionariosFiltrados = funcionarios.filter((f) => {
    return (
      normalizarTexto(f.nome).includes(termoBusca) ||
      normalizarTexto(f.email).includes(termoBusca) ||
      normalizarTexto(f.cargo).includes(termoBusca) ||
      normalizarTexto(f.telefone).includes(termoBusca) ||
      normalizarTexto(f.status).includes(termoBusca)
    );
  });

  return (
    <div className="equipe-layout">
      <Sidebar />

      <main className="equipe-page">
        <header className="equipe-header">
          <div>
            <h1>Equipe</h1>
            <p>Gestão de colaboradores da academia</p>
          </div>
        </header>

        <section className="cards">
          <div className="card">
            <div className="card-info">
              <span>Total de Funcionários</span>
              <strong>{funcionarios.length}</strong>
            </div>

            <div className="icon blue">
              <Users size={18} />
            </div>
          </div>

          <div className="card">
            <div className="card-info">
              <span>Ativos</span>

              <strong>
                {
                  funcionarios.filter(
                    (f) => f.status === "Ativo"
                  ).length
                }
              </strong>
            </div>

            <div className="icon green">
              <Users size={18} />
            </div>
          </div>

          <div className="card">
            <div className="card-info">
              <span>Folha Mensal</span>
              <strong>R$ 28.500</strong>
            </div>

            <div className="icon blue">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="card">
            <div className="card-info">
              <span>Horas Hoje</span>
              <strong>48h</strong>
            </div>

            <div className="icon blue">
              <Clock size={18} />
            </div>
          </div>
        </section>

        <section className="content">
          <div className="table-box">
            <div className="table-header">
              <h2>Lista de Funcionários</h2>

              <div className="search">
                <Search size={16} />

                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="equipe-table-wrapper">
              <table className="equipe-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Cargo</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando && (
                  <tr>
                    <td colSpan="5">
                      Carregando funcionários...
                    </td>
                  </tr>
                )}

                {!carregando && erro && (
                  <tr>
                    <td colSpan="5">
                      {erro}
                    </td>
                  </tr>
                )}

                {!carregando &&
                  !erro &&
                  funcionariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        {busca
                          ? "Nenhum funcionário encontrado para essa busca."
                          : "Nenhum funcionário encontrado."}
                      </td>
                    </tr>
                  )}

                {!carregando &&
                  !erro &&
                  funcionariosFiltrados.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <div className="funcionario">
                          <strong>{f.nome}</strong>
                          <span>{f.email}</span>
                        </div>
                      </td>

                      <td>{f.cargo}</td>

                      <td>{f.telefone}</td>

                      <td>
                        <span
                          className={
                            normalizarTexto(f.status) === "ativo"
                              ? "status ativo"
                              : "status inativo"
                          }
                        >
                          {f.status}
                        </span>
                      </td>

                      <td className="acoes">
                        <Pencil
                          size={16}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFuncionarioSelecionado(f);
                            setModalEditar(true);
                          }}
                        />

                        <Trash2
                          size={16}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFuncionarioSelecionado(f);
                            setModalExcluir(true);
                          }}
                        />

                        <Info
                          size={16}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFuncionarioSelecionado(f);
                            setModalDetalhes(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
              </table>
            </div>
          </div>

          <div className="side-info">
            <h3>Acessos Rápidos</h3>

            <div className="box-info">
              <strong>Campos de Login</strong>

              <p>
                E-mail e senha são utilizados para acesso.
              </p>

              <p>
                Funcionários com acesso financeiro podem
                visualizar o módulo financeiro.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ModalNovoFuncionario
        aberto={modalNovo}
        fechar={() => setModalNovo(false)}
        cargos={cargos}
        onSalvar={cadastrarFuncionario}
      />

      <ModalEditarFuncionario
        aberto={modalEditar}
        fechar={() => setModalEditar(false)}
        funcionario={funcionarioSelecionado}
        cargos={cargos}
        onSalvar={salvarEdicaoFuncionario}
      />

      <ModalExcluirFuncionario
        aberto={modalExcluir}
        fechar={() => setModalExcluir(false)}
        funcionario={funcionarioSelecionado}
        onExcluir={confirmarExclusaoFuncionario}
      />

      <ModalDetalhesFuncionario
        aberto={modalDetalhes}
        fechar={() => setModalDetalhes(false)}
        funcionario={funcionarioSelecionado}
      />
    </div>
  );
}

