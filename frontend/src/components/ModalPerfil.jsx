import { useState } from "react";

import "../styles/modal_perfil.css";

import {
  Mail,
  Phone,
  Briefcase,
  Pencil,
  LogOut,
  X,
  Save,
} from "lucide-react";

export default function ModalPerfil({
  aberto,
  fechar,
}) {

  const [editando, setEditando] = useState(false);

  const [usuario, setUsuario] = useState({
    nome: "Anna Costa",
    cargo: "Gerente",
    email: "ana@gymio.com",
    telefone: "(44) 99999-9999",
  });

  if (!aberto) return null;

  function alterarCampo(campo, valor) {
    setUsuario({
      ...usuario,
      [campo]: valor,
    });
  }

  function salvar() {
    setEditando(false);

    alert("Perfil atualizado com sucesso!");
  }

  return (
    <div className="perfil-overlay">

      <div className="perfil-modal">

        <button
          className="perfil-fechar"
          onClick={fechar}
        >
          <X size={22} />
        </button>

        <div className="perfil-topo">

          <div className="perfil-avatar">
            {usuario.nome
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {editando ? (
            <>
              <input
                className="perfil-input-nome"
                value={usuario.nome}
                onChange={(e) =>
                  alterarCampo("nome", e.target.value)
                }
              />

              <input
                className="perfil-input-cargo"
                value={usuario.cargo}
                onChange={(e) =>
                  alterarCampo("cargo", e.target.value)
                }
              />
            </>
          ) : (
            <>
              <h2>{usuario.nome}</h2>
              <span>{usuario.cargo}</span>
            </>
          )}

        </div>

        <div className="perfil-linha"></div>

        <div className="perfil-item">

          <div className="perfil-icone azul">
            <Mail size={18} />
          </div>

          <div className="perfil-conteudo">

            <p>Email</p>

            {editando ? (
              <input
                className="perfil-input"
                value={usuario.email}
                onChange={(e) =>
                  alterarCampo("email", e.target.value)
                }
              />
            ) : (
              <strong>{usuario.email}</strong>
            )}

          </div>

        </div>

        <div className="perfil-item">

          <div className="perfil-icone verde">
            <Phone size={18} />
          </div>

          <div className="perfil-conteudo">

            <p>Telefone</p>

            {editando ? (
              <input
                className="perfil-input"
                value={usuario.telefone}
                onChange={(e) =>
                  alterarCampo("telefone", e.target.value)
                }
              />
            ) : (
              <strong>{usuario.telefone}</strong>
            )}

          </div>

        </div>

        <div className="perfil-item">

          <div className="perfil-icone roxo">
            <Briefcase size={18} />
          </div>

          <div className="perfil-conteudo">

            <p>Cargo</p>

            <strong>{usuario.cargo}</strong>

          </div>

        </div>

        {editando ? (

          <button
            className="btn-editar"
            onClick={salvar}
          >
            <Save size={18} />

            Salvar Alterações
          </button>

        ) : (

          <button
            className="btn-editar"
            onClick={() => setEditando(true)}
          >
            <Pencil size={18} />

            Editar Perfil
          </button>

        )}

        <button className="btn-sair">

          <LogOut size={18} />

          Sair

        </button>

      </div>
    </div>
  );
}