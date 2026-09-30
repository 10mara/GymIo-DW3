import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const checkAuth = async () => {

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {

      if (![401, 404].includes(error.response?.status)) {
        console.error("Erro ao verificar autenticação:", error);
      }


      setUser(null);
    } finally {
      setLoading(false);
    }

  };


  useEffect(() => {
    checkAuth();
  }, []);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
