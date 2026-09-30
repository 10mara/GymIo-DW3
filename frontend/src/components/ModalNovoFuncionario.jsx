import { useState } from "react";
import { X, UserPlus } from "lucide-react";

const dadosIniciais = {
  nome: "",
  email: "",
  senha: "",
  telefone: "",
  cpf: "",
  dataNascimento: "",
  cargo_id: "",
  data_admissao: "",
  status: "Ativo",
};

export default function ModalNovoFuncionario({
  aberto,
  fechar,
  cargos = [],
  onSalvar,
}) {
  const [dados, setDados] = useState(dadosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!aberto) return null;

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  };

  const enviarFormulario = async (event) => {
    event.preventDefault();

    if (typeof onSalvar !== "function") {
      setErro("Função de cadastro não configurada.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      await onSalvar(dados);
      setDados(dadosIniciais);
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      setErro(
        error.response?.data?.erro ||
          "Não foi possível cadastrar o funcionário."
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-funcionario">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-icon">
              <UserPlus size={18} />
            </div>

            <div>
              <h2>Novo Funcionário</h2>
              <p>Cadastre um novo colaborador.</p>
            </div>
          </div>

          <button className="close-btn" onClick={fechar}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label>Nome Completo *</label>
            <input
              type="text"
              placeholder="Ex: Maria Santos"
              value={dados.nome}
              onChange={(event) =>
                atualizarCampo("nome", event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail *</label>
            <input
              type="email"
              placeholder="Ex: maria@email.com"
              value={dados.email}
              onChange={(event) =>
                atualizarCampo("email", event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Senha *</label>
            <input
              type="password"
              placeholder="Digite uma senha"
              value={dados.senha}
              onChange={(event) =>
                atualizarCampo("senha", event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone *</label>
            <input
              type="text"
              placeholder="Ex: (11) 99999-2222"
              value={dados.telefone}
              onChange={(event) =>
                atualizarCampo("telefone", event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>CPF *</label>
            <input
              type="text"
              placeholder="Ex: 123.456.789-00"
              value={dados.cpf}
              onChange={(event) =>
                atualizarCampo("cpf", event.target.value)
              }
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input
                type="date"
                value={dados.dataNascimento}
                onChange={(event) =>
                  atualizarCampo("dataNascimento", event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Cargo *</label>

              <select
                value={dados.cargo_id}
                onChange={(event) =>
                  atualizarCampo("cargo_id", event.target.value)
                }
                required
              >
                <option value="">Selecione o cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nome_cargo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Data de Admissão *</label>
              <input
                type="date"
                value={dados.data_admissao}
                onChange={(event) =>
                  atualizarCampo("data_admissao", event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Status *</label>

              <select
                value={dados.status}
                onChange={(event) =>
                  atualizarCampo("status", event.target.value)
                }
                required
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          {erro && <p>{erro}</p>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancelar"
              onClick={fechar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-salvar"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
