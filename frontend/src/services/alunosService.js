import api from './api';

export const getAlunos = async () => {
  const response = await api.get('/pessoas?tipo=aluno');
  return response.data;
};

export const createAluno = async (aluno) => {
  const response = await api.post('/pessoas', { ...aluno, isAluno: true });
  return response.data;
};

export const updateAluno = async (id, aluno) => {
  const response = await api.put(`/pessoas/${id}`, aluno);
  return response.data;
};

export const deleteAluno = async (id) => {
  const response = await api.delete(`/pessoas/${id}`);
  return response.data;
};