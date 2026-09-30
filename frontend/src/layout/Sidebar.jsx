import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCog,
  DollarSign,
  Lock,
  Wrench,
  FileText,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  Pencil,
  X,
  User,
} from "lucide-react";

import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "alunos", label: "Alunos", path: "/Alunos", icon: <Users size={18} /> },
  { id: "pessoa", label: "Pessoas", path: "/pessoas", icon: <User size={18} /> },
  { id: "planos", label: "Planos", path: "/planos", icon: <CreditCard size={18} /> },
  { id: "equipe", label: "Equipe", path: "/Equipe", icon: <UserCog size={18} /> },
  { id: "financeiro", label: "Financeiro", path: "/Financeiro", icon: <DollarSign size={18} /> },
  { id: "acesso", label: "Acesso", path: "/Acesso", icon: <Lock size={18} /> },
  { id: "equipamentos", label: "Equipamentos", path: "/Equipamentos", icon: <Wrench size={18} /> },
  { id: "relatorios", label: "Relatórios", path: "/Relatorios", icon: <FileText size={18} /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);

  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });

  useEffect(() => {
    if (modalPerfilAberto) {
      setDadosEditados({
        nome: user?.nome || "",
        email: user?.email || "",
        telefone: user?.telefone || "",
        cargo: user?.cargo || "",
      });
      setEditando(false);
    }
  }, [modalPerfilAberto, user]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <aside className="gymio-sidebar">
        {/* LOGO */}
        <div className="gymio-sidebar__brand">
          <div className="gymio-sidebar__brand-icon">G</div>
          <div>
            <div className="gymio-sidebar__brand-name">GymIO</div>
            <div className="gymio-sidebar__brand-sub">Sistema de Gestão</div>
          </div>
        </div>

        {/* USUÁRIO */}
        <div
          className="gymio-sidebar__user"
          onClick={() => setModalPerfilAberto(true)}
        >
          <div className="gymio-sidebar__avatar">
            {user?.nome?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <div className="gymio-sidebar__user-name">
              {user?.nome || "Usuário"}
            </div>
            <div className="gymio-sidebar__user-role">
              {user?.status || "Sem status"}
            </div>
          </div>
        </div>

        <div className="gymio-sidebar__section-label">
          Menu Principal
        </div>

        {/* MENU */}
        <nav className="gymio-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`gymio-sidebar__nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}

              {isActive(item.path) && (
                <span className="gymio-sidebar__nav-chevron">
                  <ChevronRight size={14} />
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="gymio-sidebar__footer">
          <button
            className="gymio-sidebar__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MODAL PERFIL */}
      {modalPerfilAberto && (
        <div className="perfil-overlay">
          <div className="perfil-modal">

            <button
              className="perfil-fechar"
              onClick={() => setModalPerfilAberto(false)}
            >
              <X size={22} />
            </button>

            {/* TOPO */}
            <div className="perfil-topo">
              <div className="perfil-avatar">
                {dadosEditados.nome?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {editando ? (
                <input
                  value={dadosEditados.nome}
                  onChange={(e) =>
                    setDadosEditados({
                      ...dadosEditados,
                      nome: e.target.value,
                    })
                  }
                />
              ) : (
                <h2>{user?.nome || "Usuário"}</h2>
              )}

              <span>{user?.status || "Sem status"}</span>
            </div>

            <div className="perfil-linha"></div>

            {/* EMAIL */}
            <div className="perfil-item">
              <div className="perfil-icone azul">
                <Mail size={18} />
              </div>
              <div>
                <p>Email</p>
                {editando ? (
                  <input
                    value={dadosEditados.email}
                    onChange={(e) =>
                      setDadosEditados({
                        ...dadosEditados,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{user?.email || "sememail@gmail.com"}</strong>
                )}
              </div>
            </div>

            {/* TELEFONE */}
            <div className="perfil-item">
              <div className="perfil-icone verde">
                <Phone size={18} />
              </div>
              <div>
                <p>Telefone</p>
                {editando ? (
                  <input
                    value={dadosEditados.telefone}
                    onChange={(e) =>
                      setDadosEditados({
                        ...dadosEditados,
                        telefone: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{user?.telefone || "(44) 99999-9999"}</strong>
                )}
              </div>
            </div>

            {/* CARGO */}
            <div className="perfil-item">
              <div className="perfil-icone roxo">
                <Briefcase size={18} />
              </div>
              <div>
                <p>Cargo</p>
                {editando ? (
                  <input
                    value={dadosEditados.cargo}
                    onChange={(e) =>
                      setDadosEditados({
                        ...dadosEditados,
                        cargo: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{user?.cargo || "Administrador"}</strong>
                )}
              </div>
            </div>

            {/* BOTÕES */}
            <div className="perfil-botoes">

              {!editando && (
                <button
                  className="btn btn--primary"
                  onClick={() => setEditando(true)}
                >
                  <Pencil size={18} />
                  Editar Perfil
                </button>
              )}

              {editando && (
                <>
                  <button
                    className="btn btn--primary"
                    onClick={() => {
                      user.nome = dadosEditados.nome;
                      user.email = dadosEditados.email;
                      user.telefone = dadosEditados.telefone;
                      user.cargo = dadosEditados.cargo;

                      setEditando(false);
                    }}
                  >
                    Salvar alterações
                  </button>

                  <button
                    className="btn btn--outline"
                    onClick={() => setEditando(false)}
                  >
                    Cancelar
                  </button>
                </>
              )}

            </div>

            <button
              className="btn-sair"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair
            </button>

          </div>
        </div>
      )}
    </>
  );
}
