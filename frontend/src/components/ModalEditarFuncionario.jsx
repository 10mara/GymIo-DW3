import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";

export default function ModalEditarFuncionario({
  aberto,
  fechar,
  funcionario,
  cargos = [],
  onSalvar,
}) {
  const [dados, setDados] = useState({
    cargo_id: "",
    status: "Ativo",
    permissaoFinanceira: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!funcionario) return;

    setDados({
      cargo_id: funcionario.cargo_id || "",
      status: funcionario.status || "Ativo",
      permissaoFinanceira:
        funcionario.ctps === "Sim" || funcionario.ctps === "Não"
          ? funcionario.ctps
          : "",
    });
    setErro("");
  }, [funcionario]);

  if (!aberto || !funcionario) return null;

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  };

  const enviarFormulario = async (event) => {
    event.preventDefault();

    if (typeof onSalvar !== "function") {
      setErro("Função de edição não configurada.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      await onSalvar(funcionario.id, dados);
    } catch (error) {
      console.error("Erro ao editar funcionário:", error);
      setErro(
        error.response?.data?.erro ||
          "Não foi possível editar o funcionário."
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
              <Pencil size={18} />
            </div>

            <div>
              <h2>Editar Funcionário</h2>
              <p>Edite as informações do colaborador.</p>
            </div>
          </div>

          <button className="close-btn" onClick={fechar}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label>Nome Completo *</label>
            <input value={funcionario.nome || ""} readOnly />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>E-mail *</label>
              <input value={funcionario.email || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Telefone *</label>
              <input value={funcionario.telefone || ""} readOnly />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>CPF *</label>
              <input value={funcionario.cpf || ""} readOnly />
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

            <div className="form-group">
              <label>Permissão Financeira</label>

              <select
                value={dados.permissaoFinanceira}
                onChange={(event) =>
                  atualizarCampo(
                    "permissaoFinanceira",
                    event.target.value
                  )
                }
              >
                <option value="">Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
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
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
