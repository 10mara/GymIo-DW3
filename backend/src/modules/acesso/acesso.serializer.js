/**
 * Converte o resultado do Prisma (camelCase, Date) para o formato que o frontend
 * (acessoService.normalizarAcesso) já consome: snake_case, datas em ISO e
 * aluno -> pessoa aninhados.
 *
 * hora_entrada / hora_saida são colunas `timestamp` (sem fuso) gravadas em UTC; o Prisma as devolve
 * como UTC e o toISOString() adiciona o "Z", então o navegador converte para o horário local corretamente.
 */
const iso = (d) => (d ? d.toISOString() : null);

const toRow = (a) => ({
  id: a.id,
  aluno_id: a.alunoId,
  data_hora_acesso: iso(a.dataHoraAcesso),
  tipo_acesso: a.tipoAcesso,
  hora_entrada: iso(a.horaEntrada),
  hora_saida: iso(a.horaSaida),
  deleted_at: iso(a.deletedAt),
});

const toListItem = (a) => ({
  id: a.id,
  aluno_id: a.alunoId,
  data_hora_acesso: iso(a.dataHoraAcesso),
  tipo_acesso: a.tipoAcesso,
  hora_entrada: iso(a.horaEntrada),
  hora_saida: iso(a.horaSaida),
  aluno: a.aluno
    ? {
        id: a.aluno.id,
        status: a.aluno.status,
        pessoa: a.aluno.pessoa
          ? { id: a.aluno.pessoa.id, nome: a.aluno.pessoa.nome, cpf: a.aluno.pessoa.cpf }
          : null,
      }
    : null,
});

module.exports = { toRow, toListItem };
