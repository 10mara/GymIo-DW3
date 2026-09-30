import React, { useState } from "react";
import { X } from "lucide-react";

const formInicial = {
  equipamento: "", tipo: "", data: "", tecnico: "", valorPrevisto: "", observacoes: "",
};

export default function ModalNovaManutencao({ aberto, fechar, salvar }) {
  const [form, setForm] = useState(formInicial);

  if (!aberto) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAgendar = () => { salvar(form); setForm(formInicial); fechar(); };
  const handleFechar = () => { setForm(formInicial); fechar(); };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Nova Manutenção</h2>
          <button className="modal-fechar" onClick={handleFechar}><X size={20} /></button>
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
          <button className="btn-cancelar" onClick={handleFechar}>Cancelar</button>
          <button className="btn-salvar" onClick={handleAgendar}>Agendar</button>
        </div>
      </div>
    </div>
  );
}