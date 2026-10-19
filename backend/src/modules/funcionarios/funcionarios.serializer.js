const { formatDateOnly } = require("../../utils/date");

const iso = (d) => (d ? d.toISOString() : null);

const toRow = (f) => ({
  id: f.id,
  pessoa_id: f.pessoaId,
  cargo_id: f.cargoId,
  data_admissao: formatDateOnly(f.dataAdmissao),
  ctps: f.ctps,
  status: f.status,
  deleted_at: iso(f.deletedAt),
});

// Mesmo formato que o frontend (equipeService) já recebia, com pessoa e cargo aninhados.
const toDetalhe = (f) => ({
  ...toRow(f),
  pessoa: f.pessoa && {
    id: f.pessoa.id,
    nome: f.pessoa.nome,
    cpf: f.pessoa.cpf,
    data_nascimento: formatDateOnly(f.pessoa.dataNascimento),
    telefone: f.pessoa.telefone,
    email: f.pessoa.email,
    endereco: f.pessoa.endereco,
  },
  cargo: f.cargo && { id: f.cargo.id, nome_cargo: f.cargo.nomeCargo },
});

module.exports = { toRow, toDetalhe };
