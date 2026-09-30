import React from "react";
import { X, Trash2 } from "lucide-react";

export default function ModalExcluirManutencao({ aberto, fechar, manutencao, excluir }) {
  if (!aberto || !manutencao) return null;

  const handleExcluir = () => { excluir(manutencao); fechar(); };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-pequeno">
        <div className="modal-header">
          <h2>Excluir Manutenção</h2>
          <button className="modal-fechar" onClick={fechar}><X size={20} /></button>
        </div>
        <div className="modal-body modal-body-confirmacao">
          <div className="confirmacao-icone"><Trash2 size={40} /></div>
          <p className="confirmacao-texto">Tem certeza que deseja excluir esta manutenção?</p>
          <p className="confirmacao-nome">{manutencao.equipamento}</p>
          <p className="confirmacao-aviso">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={fechar}>Cancelar</button>
          <button className="btn-excluir" onClick={handleExcluir}>Excluir</button>
        </div>
      </div>
    </div>
  );
}