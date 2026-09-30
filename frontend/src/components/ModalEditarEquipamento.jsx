import React, { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";

export default function ModalEditarEquipamento({ aberto, fechar, equipamento, salvar }) {
  const [form, setForm] = useState({
    nome: "", codigo: "", categoria: "", fabricante: "",
    modelo: "", dataCompra: "", garantia: "", status: "",
    localizacao: "", observacoes: "",
  });

  useEffect(() => {
    if (equipamento) setForm({ ...equipamento });
  }, [equipamento]);

  if (!aberto) return null;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSalvar = () => { salvar(form); fechar(); };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-icone azul">
              <Pencil size={18} />
            </div>
            <div className="modal-header-texto">
              <h2>Editar Equipamento</h2>
              <p>Edite as informações do equipamento.</p>
            </div>
          </div>
          <button className="modal-fechar" onClick={fechar}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-campo">
              <label>Nome do Equipamento <span className="obrigatorio">*</span></label>
              <input name="nome" value={form.nome} onChange={handle} placeholder="Ex.: Esteira Profissional" />
            </div>
            <div className="modal-campo">
              <label>Código <span className="obrigatorio">*</span></label>
              <input name="codigo" value={form.codigo} onChange={handle} placeholder="Ex.: EST-001" />
            </div>
            <div className="modal-campo">
              <label>Categoria <span className="obrigatorio">*</span></label>
              <select name="categoria" value={form.categoria} onChange={handle}>
                <option value="">Selecione a categoria</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Musculação">Musculação</option>
                <option value="Cardio">Cardio</option>
                <option value="Funcional">Funcional</option>
                <option value="Alongamento">Alongamento</option>
              </select>
            </div>
            <div className="modal-campo">
              <label>Localização <span className="obrigatorio">*</span></label>
              <select name="localizacao" value={form.localizacao} onChange={handle}>
                <option value="">Selecione a localização</option>
                <option value="Sala 1">Sala 1</option>
                <option value="Sala 2">Sala 2</option>
                <option value="Sala de Cardio">Sala de Cardio</option>
                <option value="Sala de Musculação">Sala de Musculação</option>
              </select>
            </div>
            <div className="modal-campo">
              <label>Status <span className="obrigatorio">*</span></label>
              <select name="status" value={form.status} onChange={handle}>
                <option value="">Selecione o status</option>
                <option value="Funcionando">Funcionando</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div className="modal-campo">
              <label>Data de Aquisição</label>
              <input type="date" name="dataCompra" value={form.dataCompra} onChange={handle} />
            </div>
            <div className="modal-campo">
              <label>Fornecedor</label>
              <input name="fabricante" value={form.fabricante} onChange={handle} placeholder="Ex.: nome do fornecedor" />
            </div>
            <div className="modal-campo">
              <label>Garantia até</label>
              <input type="date" name="garantia" value={form.garantia} onChange={handle} />
            </div>
            <div className="modal-campo modal-campo-full">
              <label>Observações (opcional)</label>
              <textarea name="observacoes" value={form.observacoes} onChange={handle}
                placeholder="Adicione observações sobre o equipamento..." rows={3} />
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