import api from './api';

export const getAlunos = async () => {
  const response = await api.get('/alunos');
  return response.data;
};

export const createAluno = async (aluno) => {
  const response = await api.post('/alunos', aluno);
  return response.data;
};

export const updateAluno = async (id, aluno) => {
  const response = await api.put(`/alunos/${id}`, aluno);
  return response.data;
};

export const deleteAluno = async (id) => {
  const response = await api.delete(`/alunos/${id}`);
  return response.data;
};