import {
  X,
  Info,
  Mail,
  Phone,
} from "lucide-react";

export default function ModalDetalhesFuncionario({
  aberto,
  fechar,
  funcionario,
}) {
  if (!aberto || !funcionario) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-funcionario">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-icon">
              <Info size={18} />
            </div>

            <div>
              <h2>Ver Detalhes do Funcionário</h2>
            </div>
          </div>

          <button className="close-btn" onClick={fechar}>
            <X size={18} />
          </button>
        </div>

        <div className="perfil-topo">
          <div className="avatar grande">
            {funcionario.nome
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div>
            <h3>{funcionario.nome}</h3>

            <span className="status ativo">
              {funcionario.status}
            </span>

            <p>{funcionario.cargo}</p>

            <div className="contato">
              <Mail size={14} />
              {funcionario.email}
            </div>

            <div className="contato">
              <Phone size={14} />
              {funcionario.telefone}
            </div>
          </div>
        </div>

        <div className="detalhes-grid">
          <div>
            <strong>Data de Admissão</strong>
            <span>10/03/2022</span>
          </div>

          <div>
            <strong>Data de Nascimento</strong>
            <span>15/02/1990</span>
          </div>

          <div>
            <strong>Cargo</strong>
            <span>{funcionario.cargo}</span>
          </div>

          <div>
            <strong>Permissão Financeira</strong>
            <span>Sim</span>
          </div>

          <div>
            <strong>Último Acesso</strong>
            <span>15/05/2024 08:45</span>
          </div>
        </div>

        <div className="observacoes">
          <strong>Observações</strong>

          <p>
            Responsável pelo atendimento na
            recepção da academia.
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={fechar}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}