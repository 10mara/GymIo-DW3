import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalEditarManutencao({ aberto, fechar, manutencao, salvar }) {
  const [form, setForm] = useState({
    equipamento: "", tipo: "", data: "", tecnico: "", valorPrevisto: "", observacoes: "",
  });

  useEffect(() => {
    if (manutencao) setForm({ ...manutencao });
  }, [manutencao]);

  if (!aberto) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSalvar = () => { salvar(form); fechar(); };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Editar Manutenção</h2>
          <button className="modal-fechar" onClick={fechar}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-campo">
              <label>Equipamento</label>
              <input type="text" name="equipamento" value={form.equipamento} onChange={handleChange} placeholder="Nome do equipamento" />
            </div>
            <div className="modal-campo">
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="">Selecionar</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Preditiva">Preditiva</option>
              </select>
            </div>
            <div className="modal-campo">
              <label>Data</label>
              <input type="date" name="data" value={form.data} onChange={handleChange} />
            </div>
            <div className="modal-campo">
              <label>Técnico Responsável</label>
              <input type="text" name="tecnico" value={form.tecnico} onChange={handleChange} placeholder="Nome do técnico" />
            </div>
            <div className="modal-campo">
              <label>Valor Previsto (R$)</label>
              <input type="number" name="valorPrevisto" value={form.valorPrevisto} onChange={handleChange} placeholder="0,00" min="0" step="0.01" />
            </div>
            <div className="modal-campo modal-campo-full">
              <label>Observações</label>
              <textarea name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Observações sobre a manutenção" rows={3} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={fechar}>Cancelar</button>
          <button className="btn-salvar" onClick={handleSalvar}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}