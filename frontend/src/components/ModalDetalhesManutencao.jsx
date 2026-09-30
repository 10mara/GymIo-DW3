import React from "react";
import { X } from "lucide-react";

export default function ModalDetalhesManutencao({ aberto, fechar, manutencao }) {
  if (!aberto || !manutencao) return null;

  const formatarValor = (valor) =>
    valor ? `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}` : "—";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Detalhes da Manutenção</h2>
          <button className="modal-fechar" onClick={fechar}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-detalhe">
              <span className="detalhe-label">Equipamento</span>
              <span className="detalhe-valor">{manutencao.equipamento || "—"}</span>
            </div>

            <div className="modal-detalhe">
              <span className="detalhe-label">Tipo</span>
              <span className="detalhe-valor">{manutencao.tipo || "—"}</span>
            </div>

            <div className="modal-detalhe">
              <span className="detalhe-label">Data</span>
              <span className="detalhe-valor">{manutencao.data || "—"}</span>
            </div>

            <div className="modal-detalhe">
              <span className="detalhe-label">Técnico Responsável</span>
              <span className="detalhe-valor">{manutencao.tecnico || "—"}</span>
            </div>

            <div className="modal-detalhe">
              <span className="detalhe-label">Valor Previsto</span>
              <span className="detalhe-valor">{formatarValor(manutencao.valorPrevisto)}</span>
            </div>

            <div className="modal-detalhe modal-campo-full">
              <span className="detalhe-label">Observações</span>
              <span className="detalhe-valor">{manutencao.observacoes || "—"}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-salvar" onClick={fechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}