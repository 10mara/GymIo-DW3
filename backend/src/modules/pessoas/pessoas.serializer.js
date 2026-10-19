/**
 * Converte o resultado do Prisma (camelCase, Date, Decimal) para o formato que o frontend
 * já consome hoje (snake_case, datas "AAAA-MM-DD", números). Nunca expõe a senha.
 */
const { formatDateOnly } = require("../../utils/date");

const iso = (d) => (d ? d.toISOString() : null);

function toListItem(pessoa) {
  const aluno = pessoa.alunos?.[0];
  const assinatura = aluno?.assinaturas?.[0];
  const funcionario = pessoa.funcionarios?.[0];

  return {
    id: pessoa.id,
    nome: pessoa.nome,
    cpf: pessoa.cpf,
    telefone: pessoa.telefone,
    email: pessoa.email,
    dataNascimento: formatDateOnly(pessoa.dataNascimento),
    endereco: pessoa.endereco,

    isAluno: !!aluno,
    aluno_id: aluno?.id || null,
    matricula: formatDateOnly(aluno?.dataMatricula) || "-",

    plano: assinatura?.plano?.nomePlano || "-",
    plano_id: assinatura?.planoId || "-",

    status: assinatura?.statusAssinatura || aluno?.status || funcionario?.status || "-",

    isFuncionario: !!funcionario,
    cargo_id: funcionario?.cargoId || "-",
    data_admissao: formatDateOnly(funcionario?.dataAdmissao) || "-",

    senha: pessoa.password ? "••••••••" : "-",
  };
}

const toPessoaRow = (p) => ({
  id: p.id,
  nome: p.nome,
  cpf: p.cpf,
  data_nascimento: formatDateOnly(p.dataNascimento),
  telefone: p.telefone,
  email: p.email,
  endereco: p.endereco,
  created_at: iso(p.createdAt),
  deleted_at: iso(p.deletedAt),
  auth_id: p.authId,
});

const toAlunoRow = (a) =>
  a && {
    id: a.id,
    pessoa_id: a.pessoaId,
    status: a.status,
    data_matricula: formatDateOnly(a.dataMatricula),
    deleted_at: iso(a.deletedAt),
  };

const toFuncionarioRow = (f) =>
  f && {
    id: f.id,
    pessoa_id: f.pessoaId,
    cargo_id: f.cargoId,
    data_admissao: formatDateOnly(f.dataAdmissao),
    ctps: f.ctps,
    status: f.status,
    deleted_at: iso(f.deletedAt),
  };

const toPlanoRow = (p) => ({
  id: p.id,
  nome_plano: p.nomePlano,
  descricao: p.descricao,
  valor: Number(p.valor),
  duracao_meses: p.duracaoMeses,
  deleted_at: iso(p.deletedAt),
});

const toCargoRow = (c) => ({
  id: c.id,
  nome_cargo: c.nomeCargo,
  salario_base: c.salarioBase === null ? null : Number(c.salarioBase),
});

module.exports = { toListItem, toPessoaRow, toAlunoRow, toFuncionarioRow, toPlanoRow, toCargoRow };
