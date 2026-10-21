import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import ModalCadastroPessoa from "../components/ModalCadastroPessoa";
import ModalPerfil from "../components/ModalPerfil";
import api from "../services/api";
import "../styles/alunos.css";
import "../styles/globals.css";

import {
  Plus,
  Search,
  Users,
  TrendingUp,
  CircleX,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

const ENDPOINT_API = "/pessoas";

const payloadInicial = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  dataNascimento: "",
  endereco: "",
  plano_id: "",
  status: "Ativo",
  matricula: "",
  senha: "",
  isAluno: false,
  isFuncionario: false,
  dataMatricula: "",
  cargo_id: "",
  dataAdmissao: "",
  salario: "",
  comissao: "",
};

export default function Pessoa() {
  const [listaPessoas, setListaPessoas] = useState([]);
  const [listaPlanos, setListaPlanos] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [listaCargos, setListaCargos] = useState([]);

  const [indicadores, setIndicadores] = useState({
    total: 0,
    novosMes: 0,
    cancelamentos: 0,
    crescimento: 0,
  });

  const [filtroAtual, setFiltroAtual] = useState("Todos");
  const [isModalInclusaoAberto, setIsModalInclusaoAberto] = useState(false);
  const [dadosNovoRegistro, setDadosNovoRegistro] = useState(payloadInicial);
  const [isModalEdicaoAberto, setIsModalEdicaoAberto] = useState(false);
  const [registroSelecionadoEdicao, setRegistroSelecionadoEdicao] =
    useState(null);
  const [isModalRemocaoAberto, setIsModalRemocaoAberto] = useState(false);
  const [registroSelecionadoRemocao, setRegistroSelecionadoRemocao] =
    useState(null);

  useEffect(() => {
    obterDadosIniciais();
  }, []);

  async function obterDadosIniciais() {
    try {
      const [
        respostaPessoas,
        respostaContagem,
        respostaIndicadores,
        respostaPlanos,
        respostaCargos,
      ] = await Promise.all([
        api.get(ENDPOINT_API),
        api.get(`${ENDPOINT_API}/total-alunos`),
        api.get(`${ENDPOINT_API}/indicadores`),
        api.get(`${ENDPOINT_API}/planos`),
        api.get(`${ENDPOINT_API}/cargos`),
      ]);

      const dadosPessoas = respostaPessoas.data;
      const dadosContagem = respostaContagem.data;
      const dadosIndicadores = respostaIndicadores.data;
      const dadosPlanos = respostaPlanos.data;
      const dadosCargos = respostaCargos.data;

      setListaPessoas(Array.isArray(dadosPessoas) ? dadosPessoas : []);
      setListaPlanos(Array.isArray(dadosPlanos) ? dadosPlanos : []);
      setListaCargos(Array.isArray(dadosCargos) ? dadosCargos : []);

      setIndicadores({
        total: dadosContagem.total || 0,
        novosMes: dadosIndicadores.novosMes || 0,
        cancelamentos: dadosIndicadores.cancelamentos || 0,
        crescimento: dadosIndicadores.crescimento || 0,
      });
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);

      setListaPessoas([]);
      setListaPlanos([]);
      setListaCargos([]);
    }
  }

  async function atualizarRegistros() {
    try {
      const resposta = await api.get(ENDPOINT_API);
      const dados = resposta.data;
      setListaPessoas(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao recarregar alunos:", erro);
      setListaPessoas([]);
    }
  }

  const dadosFiltrados = useMemo(() => {
    return listaPessoas.filter((item) => {
      const buscaMinusculo = termoPesquisa.toLowerCase();

      const atendeBusca =
        (item.nome || "").toLowerCase().includes(buscaMinusculo) ||
        (item.cpf || "").includes(termoPesquisa) ||
        (item.email || "").toLowerCase().includes(buscaMinusculo);

      const atendeFiltro =
        filtroAtual === "Todos" || item.status === filtroAtual;

      return atendeBusca && atendeFiltro;
    });
  }, [listaPessoas, termoPesquisa, filtroAtual]);

  async function executarInclusao() {
    try {
      const payload = {
        nome: dadosNovoRegistro.nome,
        cpf: dadosNovoRegistro.cpf,
        telefone: dadosNovoRegistro.telefone,
        email: dadosNovoRegistro.email,
        dataNascimento: dadosNovoRegistro.dataNascimento,
        endereco: dadosNovoRegistro.endereco,
        senha: dadosNovoRegistro.senha,

        isAluno: dadosNovoRegistro.isAluno,
        plano_id: dadosNovoRegistro.isAluno ? dadosNovoRegistro.plano_id : null,
        status: dadosNovoRegistro.isAluno ? dadosNovoRegistro.status : null,
        data_matricula: dadosNovoRegistro.isAluno
          ? dadosNovoRegistro.dataMatricula
          : null,

        isFuncionario: dadosNovoRegistro.isFuncionario,
        cargo_id: dadosNovoRegistro.isFuncionario
          ? dadosNovoRegistro.cargo_id
          : null,
        data_admissao: dadosNovoRegistro.isFuncionario
          ? dadosNovoRegistro.dataAdmissao
          : null,
        salario: dadosNovoRegistro.isFuncionario
          ? dadosNovoRegistro.salario
          : null,
        comissao: dadosNovoRegistro.isFuncionario
          ? dadosNovoRegistro.comissao
          : null,
      };

      await api.post(ENDPOINT_API, payload);

      alert("Cadastro realizado com sucesso!");
      await obterDadosIniciais();

      setDadosNovoRegistro(payloadInicial);
      setIsModalInclusaoAberto(false);
    } catch (erro) {
      console.error(erro);
      alert(
        erro.response?.data?.erro ||
          erro.response?.data?.message ||
          "Erro ao salvar cadastro",
      );
    }
  }

  function dispararEdicao(item) {
    // Inicializa as flags de Aluno/Funcionário baseado nos dados vindos do backend
    setRegistroSelecionadoEdicao({
      ...item,
      isAluno: !!item.plano_id || item.isAluno || false,
      isFuncionario:
        !!item.cargo_id || !!item.cargo || item.isFuncionario || false,
      plano_id: item.plano_id || "",
      cargo_id: item.cargo_id || "",
      status: item.status_assinatura || item.status || "Ativo",
      dataNascimento: item.dataNascimento || item.data_nascimento || "",
      dataMatricula: item.data_matricula || item.matricula || "",
      dataAdmissao: item.data_admissao || "",
    });
    setIsModalEdicaoAberto(true);
  }

  async function executarEdicao() {
    if (!registroSelecionadoEdicao) return;

    try {
      await api.put(
        `${ENDPOINT_API}/${registroSelecionadoEdicao.id}`,
        {
          nome: registroSelecionadoEdicao.nome,
          cpf: registroSelecionadoEdicao.cpf,
          telefone: registroSelecionadoEdicao.telefone,
          email: registroSelecionadoEdicao.email,
          dataNascimento: registroSelecionadoEdicao.dataNascimento,
          endereco: registroSelecionadoEdicao.endereco,
          senha: registroSelecionadoEdicao.senha,
          isAluno: registroSelecionadoEdicao.isAluno,
          plano_id: registroSelecionadoEdicao.isAluno
            ? registroSelecionadoEdicao.plano_id
            : null,
          status: registroSelecionadoEdicao.isAluno
            ? registroSelecionadoEdicao.status
            : "Ativo",
          dataMatricula: registroSelecionadoEdicao.isAluno
            ? registroSelecionadoEdicao.dataMatricula
            : null,
          isFuncionario: registroSelecionadoEdicao.isFuncionario,
          cargo_id: registroSelecionadoEdicao.isFuncionario
            ? registroSelecionadoEdicao.cargo_id
            : null,
          dataAdmissao: registroSelecionadoEdicao.isFuncionario
            ? registroSelecionadoEdicao.dataAdmissao
            : null,
          salario: registroSelecionadoEdicao.isFuncionario
            ? registroSelecionadoEdicao.salario
            : null,
          comissao: registroSelecionadoEdicao.isFuncionario
            ? registroSelecionadoEdicao.comissao
            : null,
        },
      );

      alert("Alterações salvas com sucesso!");

      await obterDadosIniciais();
      setIsModalEdicaoAberto(false);
      setRegistroSelecionadoEdicao(null);
    } catch (erro) {
      console.error("Erro ao editar aluno:", erro);
      alert(
        erro.response?.data?.erro ||
          erro.response?.data?.message ||
          "Erro ao editar cadastro",
      );
    }
  }

  function dispararRemocao(item) {
    setRegistroSelecionadoRemocao(item);
    setIsModalRemocaoAberto(true);
  }

  async function executarRemocao() {
    if (!registroSelecionadoRemocao) return;

    try {
      await api.delete(`${ENDPOINT_API}/${registroSelecionadoRemocao.id}`);

      setListaPessoas((estadoAnterior) =>
        estadoAnterior.filter(
          (item) => item.id !== registroSelecionadoRemocao.id,
        ),
      );
      setIsModalRemocaoAberto(false);
      setRegistroSelecionadoRemocao(null);
    } catch (erro) {
      console.error("Erro ao excluir aluno:", erro);
      alert(
        erro.response?.data?.erro ||
          erro.response?.data?.message ||
          "Erro ao excluir cadastro",
      );
    }
  }

  function converterData(valor) {
    if (!valor) return "-";
    if (valor.includes("/")) return valor;

    const [ano, mes, dia] = valor.split("-");
    if (!ano || !mes || !dia) return valor;

    return `${dia.slice(0, 2)}/${mes}/${ano}`;
  }

  function extrairIniciais(nomeCompleto = "") {
    return nomeCompleto
      .split(" ")
      .filter(Boolean)
      .map((palavra) => palavra[0])
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
            <h1>Cadastro de Pessoas</h1>
            <p>Cadastro de pessoas para a acadêmia</p>
          </div>

          <button
            className="btn btn--primary"
            onClick={() => setIsModalInclusaoAberto(true)}
          >
            <Plus size={17} />
            Nova Pessoa
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon stat-blue">
              <Users size={22} />
            </div>

            <div>
              <span>Total Registrado</span>
              <strong>{indicadores.total}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-green">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Novos este mês</span>
              <strong>{indicadores.novosMes}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-red">
              <CircleX size={22} />
            </div>

            <div>
              <span>Cancelamentos</span>
              <strong>{indicadores.cancelamentos}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-green">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Taxa de Crescimento</span>
              <strong>
                {indicadores.crescimento > 0 ? "+" : ""}
                {indicadores.crescimento}%
              </strong>
            </div>
          </article>
        </section>

        <section className="alunos-content">
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou e-mail..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
              />
            </div>

            <div className="filters">
              {["Todos", "Ativo", "Inadimplente", "Cancelado"].map((status) => (
                <button
                  key={status}
                  className={filtroAtual === status ? "active" : ""}
                  onClick={() => setFiltroAtual(status)}
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
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Data Nascimento</th>
                  <th>Endereço</th>
                  <th>Matrícula</th>
                </tr>
              </thead>

              <tbody>
                {dadosFiltrados.map((pessoa) => (
                  <tr key={pessoa.id}>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => dispararEdicao(pessoa)}
                          title="Editar cadastro"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => dispararRemocao(pessoa)}
                          title="Excluir cadastro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="student-cell">
                        <div className="avatar">
                          {extrairIniciais(pessoa.nome)}
                        </div>
                        <span>{pessoa.nome}</span>
                      </div>
                    </td>

                    <td>{pessoa.cpf}</td>
                    <td>{pessoa.telefone}</td>
                    <td>{pessoa.email}</td>
                    <td>
                      {converterData(
                        pessoa.dataNascimento || pessoa.data_nascimento,
                      )}
                    </td>
                    <td className="address-cell">{pessoa.endereco}</td>
                    <td>{converterData(pessoa.matricula)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>
              Mostrando {dadosFiltrados.length} de {listaPessoas.length} pessoas
            </span>
          </footer>
        </section>
      </main>

      {/* MODAL PARA CRIAÇÃO */}
      {isModalInclusaoAberto && (
        <ModalCadastroPessoa
          titulo="Novo Registro"
          dados={dadosNovoRegistro}
          setDados={setDadosNovoRegistro}
          onClose={() => setIsModalInclusaoAberto(false)}
          onSave={executarInclusao}
          textoBotao="Salvar"
          planos={listaPlanos}
          cargos={listaCargos}
        />
      )}

      {/* MODAL NOVO APLICADO PARA EDICAO */}
      {isModalEdicaoAberto && registroSelecionadoEdicao && (
        <ModalCadastroPessoa
          titulo="Editar Informações"
          icone={<Pencil size={18} />}
          dados={registroSelecionadoEdicao}
          setDados={setRegistroSelecionadoEdicao}
          onClose={() => {
            setIsModalEdicaoAberto(false);
            setRegistroSelecionadoEdicao(null);
          }}
          onSave={executarEdicao}
          textoBotao="Salvar alterações"
          planos={listaPlanos}
          cargos={listaCargos}
        />
      )}

      {/* MODAL REMOÇÃO */}
      {isModalRemocaoAberto && registroSelecionadoRemocao && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>
                <Trash2 size={18} />
                Excluir Cadastro
              </h2>

              <button
                className="modal-close"
                onClick={() => setIsModalRemocaoAberto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alert-box">
              <AlertTriangle size={20} />
              <div>
                <strong>Atenção!</strong>
                <p>O registro será removido da listagem.</p>
              </div>
            </div>

            <p className="delete-question">Deseja excluir este registro?</p>

            <div className="delete-info">
              <strong>{registroSelecionadoRemocao.nome}</strong>
              <div>
                <span>CPF: {registroSelecionadoRemocao.cpf}</span>
                <span>Plano: {registroSelecionadoRemocao.plano || "-"}</span>
                <span>
                  Status: {registroSelecionadoRemocao.status_assinatura || "-"}
                </span>
                <span>Matrícula: {registroSelecionadoRemocao.matricula}</span>
                <span>
                  Nascimento:{" "}
                  {converterData(
                    registroSelecionadoRemocao.dataNascimento ||
                      registroSelecionadoRemocao.data_nascimento,
                  )}
                </span>
                <span>E-mail: {registroSelecionadoRemocao.email}</span>
                <span>Telefone: {registroSelecionadoRemocao.telefone}</span>
                <span>Endereço: {registroSelecionadoRemocao.endereco}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--outline"
                onClick={() => setIsModalRemocaoAberto(false)}
              >
                Cancelar
              </button>

              <button className="btn btn--danger" onClick={executarRemocao}>
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
