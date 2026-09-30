import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/auth.css";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { checkAuth } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  // Modal esqueceu senha
  const [showModal, setShowModal] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await authService.login({ email, senha });

      await checkAuth();

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao fazer login.");
    }
  };

  return (
  <div className="auth-container">

    {/* ESQUERDA */}
    <div className="auth-left">
      <div className="auth-logo">GymIO</div>

      <h1>Gerencie sua academia com inteligência</h1>
      <p>
        Sistema completo para controle de alunos, financeiro, acesso e
        equipamentos.
      </p>

      <div className="auth-stats">
        <div className="auth-card-stat">
          <strong>+500</strong><br />Academias
        </div>
        <div className="auth-card-stat">
          <strong>+50k</strong><br />Alunos
        </div>
      </div>
    </div>

    {/* DIREITA */}
    <div className="auth-right">
      <div className="auth-box">
        <h2>Bem-vindo de volta</h2>
        <p>Entre com suas credenciais para acessar o sistema</p>

        <form onSubmit={handleLogin}>

          <div className="auth-input-group">
            <Mail />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-input-group">
            <Lock />
            <input
              type={showSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <span onClick={() => setShowSenha(!showSenha)}>
              {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <div
            className="auth-link"
            onClick={() => setShowModal(true)}
          >
            Esqueceu a senha?
          </div>

          <button className="auth-button">
            Entrar no Sistema
          </button>

        </form>
      </div>
    </div>

    {/* MODAL RECUPERAÇÃO */}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal-box">

          <h3>Recuperar senha</h3>
          <p>Digite seu email para receber as instruções</p>

          <input
            type="email"
            placeholder="seu@email.com"
            value={emailRecuperacao}
            onChange={(e) => setEmailRecuperacao(e.target.value)}
          />

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>

            <button
              className="btn-primary"
              onClick={() => {
                setShowModal(false);
                setShowSuccess(true);
              }}
            >
              Enviar
            </button>
          </div>

        </div>
      </div>
    )}

    {/* MODAL SUCESSO */}
    {showSuccess && (
      <div className="modal-overlay">
        <div className="modal-success">

          <div className="check">✔</div>

          <h3>Senha enviada!</h3>
          <p>
            Enviamos sua senha para:
            <br />
            <strong>{emailRecuperacao}</strong>
          </p>

          <button
            className="btn-primary"
            onClick={() => setShowSuccess(false)}
          >
            OK, entendi
          </button>

        </div>
      </div>
    )}

  </div>
);


}
