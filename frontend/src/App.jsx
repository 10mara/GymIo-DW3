import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/globals.css";

import Pessoa from "./pages/Pessoa"
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Planos from "./pages/Planos";
import Equipe from "./pages/Equipe";
import Financeiro from "./pages/Financeiro";
import Acesso from "./pages/Acesso";
import Equipamentos from "./pages/Equipamentos";
import Relatorios from "./pages/Relatorios";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />

        {/* App */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/alunos" element={
          <ProtectedRoute>
            <Alunos />
          </ProtectedRoute>
        } />
          <Route path="/pessoas" element={
          <ProtectedRoute>
            <Pessoa />
          </ProtectedRoute>
        } />
        <Route path="/planos" element={
          <ProtectedRoute>
            <Planos />
          </ProtectedRoute>
        } />
        <Route path="/equipe" element={
          <ProtectedRoute>
            <Equipe />
          </ProtectedRoute>
        } />
        <Route path="/financeiro" element={
          <ProtectedRoute>
            <Financeiro />
          </ProtectedRoute>
        } />
        <Route path="/acesso" element={
          <ProtectedRoute>
            <Acesso />
          </ProtectedRoute>
        } />
        <Route path="/equipamentos" element={
          <ProtectedRoute>
            <Equipamentos />
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        } />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
