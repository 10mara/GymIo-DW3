import React from "react";
import { X, Pencil, LogOut } from "lucide-react";
import "../styles/modal_perfil.css";

export default function ModalPerfil({ pessoa, onClose, onEdit }) {
  if (!pessoa) return null;

  function iniciais(nome = "") {
    return nome
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function formatarData(data) {
    if (!data) return "-";
    if (data.includes("/")) return data;

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <div className="modal-overlay">
      <div className="perfil-modal">
        
        {/* BOTÃO FECHAR */}
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* AVATAR */}
        <div className="perfil-header">
          <div className="perfil-avatar">
            {iniciais(pessoa.nome)}
          </div>

          <h2>{pessoa.nome}</h2>

          <span className={`status ${pessoa.status?.toLowerCase()}`}>
            {pessoa.status || "Sem status"}
          </span>
        </div>

        <hr />

        {/* INFORMAÇÕES */}
        <div className="perfil-info">
          <div className="info-item">
            <strong>Email</strong>
            <p>{pessoa.email || "-"}</p>
          </div>

          <div className="info-item">
            <strong>Telefone</strong>
            <p>{pessoa.telefone || "-"}</p>
          </div>

          <div className="info-item">
            <strong>CPF</strong>
            <p>{pessoa.cpf || "-"}</p>
          </div>

          <div className="info-item">
            <strong>Data de nascimento</strong>
            <p>
              {formatarData(
                pessoa.dataNascimento || pessoa.data_nascimento
              )}
            </p>
          </div>

          <div className="info-item">
            <strong>Endereço</strong>
            <p>{pessoa.endereco || "-"}</p>
          </div>

          <div className="info-item">
            <strong>Plano</strong>
            <p>{pessoa.plano || "-"}</p>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="perfil-actions">
          <button
            className="btn btn-edit"
            onClick={() => onEdit(pessoa)}
          >
            <Pencil size={16} />
            Editar Perfil
          </button>

          <button className="btn btn-logout">
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}