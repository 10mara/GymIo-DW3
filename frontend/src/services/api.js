import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api', // URL do backend
  withCredentials: true, // Enviar cookies para autenticação
});

export default api;