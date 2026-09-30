import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const vazio = {
  nome: "",
  codigo: "",
  categoria: "",
  fabricante: "",
  modelo: "",
  dataCompra: "",
  garantia: "",
  status: "",
  localizacao: "",
  observacoes: "",
};

export default function ModalNovoEquipamento({ aberto, fechar, salvar }) {
  const [form, setForm] = useState(vazio);

  if (!aberto) return null;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = () => {
    if (!form.nome || !form.codigo) return;
    salvar(form);
    setForm(vazio);
    fechar();
  };

  const handleFechar = () => {
    setForm(vazio);
    fechar();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-icone azul">
              <Plus size={18} />
            </div>
            <div className="modal-header-texto">
              <h2>Novo Equipamento</h2>
              <p>Cadastre um novo equipamento no sistema.</p>
            </div>
          </div>
          <button className="modal-fechar" onClick={handleFechar}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-campo">
              <label>Nome do Equipamento <span className="obrigatorio">*</span></label>
              <input
                name="nome"
                value={form.nome}
                onChange={handle}
                placeholder="Ex.: Esteira Profissional"
              />
            </div>

            <div className="modal-campo">
              <label>Código <span className="obrigatorio">*</span></label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handle}
                placeholder="Ex.: EST-001"
              />
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
                <option value="Acessórios">Acessórios</option>
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
              <input
                type="date"
                name="dataCompra"
                value={form.dataCompra}
                onChange={handle}
              />
            </div>

            <div className="modal-campo">
              <label>Fornecedor</label>
              <input
                name="fabricante"
                value={form.fabricante}
                onChange={handle}
                placeholder="Ex.: nome do fornecedor"
              />
            </div>

            <div className="modal-campo">
              <label>Garantia até</label>
              <input
                type="date"
                name="garantia"
                value={form.garantia}
                onChange={handle}
              />
            </div>

            <div className="modal-campo modal-campo-full">
              <label>Observações (opcional)</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handle}
                placeholder="Adicione observações sobre o equipamento..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={handleFechar}>
            Cancelar
          </button>
          <button className="btn-salvar" onClick={handleSalvar}>
            Cadastrar Equipamento
          </button>
        </div>
      </div>
    </div>
  );
}