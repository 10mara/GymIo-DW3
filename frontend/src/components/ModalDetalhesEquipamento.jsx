import React from "react";
import { X } from "lucide-react";

export default function ModalDetalhesEquipamento({ aberto, fechar, equipamento }) {
  if (!aberto || !equipamento) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Detalhes do Equipamento</h2>
          <button className="modal-fechar" onClick={fechar}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-detalhe">
              <span className="detalhe-label">Nome</span>
              <span className="detalhe-valor">{equipamento.nome || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Código</span>
              <span className="detalhe-valor">{equipamento.codigo || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Categoria</span>
              <span className="detalhe-valor">{equipamento.categoria || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Fabricante</span>
              <span className="detalhe-valor">{equipamento.fabricante || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Modelo</span>
              <span className="detalhe-valor">{equipamento.modelo || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Data de Compra</span>
              <span className="detalhe-valor">{equipamento.dataCompra || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Garantia (até)</span>
              <span className="detalhe-valor">{equipamento.garantia || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Status</span>
              <span className="detalhe-valor">{equipamento.status || "—"}</span>
            </div>
            <div className="modal-detalhe">
              <span className="detalhe-label">Localização</span>
              <span className="detalhe-valor">{equipamento.localizacao || "—"}</span>
            </div>
            <div className="modal-detalhe modal-campo-full">
              <span className="detalhe-label">Observações</span>
              <span className="detalhe-valor">{equipamento.observacoes || "—"}</span>
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