import { pgTable, pgPolicy, uuid, text, numeric, timestamp, foreignKey, date, integer, unique, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cargo = pgTable("cargo", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nomeCargo: text("nome_cargo").notNull(),
	salarioBase: numeric("salario_base", { precision: 10, scale:  2 }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const aluno = pgTable("aluno", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	pessoaId: uuid("pessoa_id"),
	status: text().default('ativo'),
	dataMatricula: date("data_matricula").default(sql`CURRENT_DATE`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.pessoaId],
			foreignColumns: [pessoa.id],
			name: "aluno_pessoa_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Liberar tudo aluno", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("liberar tudo aluno", { as: "permissive", for: "all", to: ["public"] }),
]);

export const plano = pgTable("plano", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nomePlano: text("nome_plano").notNull(),
	descricao: text(),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	duracaoMeses: integer("duracao_meses"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	pgPolicy("liberar tudo plano", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const controlePonto = pgTable("controle_ponto", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	funcionarioId: uuid("funcionario_id"),
	entrada: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	saida: timestamp({ withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.funcionarioId],
			foreignColumns: [funcionario.id],
			name: "controle_ponto_funcionario_id_fkey"
		}),
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const equipamento = pgTable("equipamento", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nomeEquipamento: text("nome_equipamento").notNull(),
	dataAquisicao: date("data_aquisicao"),
	statusConservacao: text("status_conservacao"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	codigo: text(),
	categoria: text(),
	fabricante: text(),
	modelo: text(),
	garantia: date(),
	localizacao: text(),
	observacoes: text(),
}, (table) => [
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const manutencaoEquipamento = pgTable("manutencao_equipamento", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	equipamentoId: uuid("equipamento_id"),
	funcionarioId: uuid("funcionario_id"),
	dataManutencao: date("data_manutencao").default(sql`CURRENT_DATE`),
	descricaoServico: text("descricao_servico"),
	custo: numeric({ precision: 10, scale:  2 }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	dataFinalizacao: date("data_finalizacao"),
	tipoManutencao: text("tipo_manutencao"),
	tecnico: text(),
}, (table) => [
	foreignKey({
			columns: [table.equipamentoId],
			foreignColumns: [equipamento.id],
			name: "manutencao_equipamento_equipamento_id_fkey"
		}),
	foreignKey({
			columns: [table.funcionarioId],
			foreignColumns: [funcionario.id],
			name: "manutencao_equipamento_funcionario_id_fkey"
		}),
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const pessoa = pgTable("pessoa", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	cpf: varchar({ length: 14 }).notNull(),
	dataNascimento: date("data_nascimento"),
	telefone: text(),
	email: text(),
	endereco: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	password: text(),
	passwordResetToken: text("password_reset_token"),
	passewordResetExpires: timestamp("passeword_reset_expires", { mode: 'string' }),
	authId: uuid("auth_id"),
}, (table) => [
	unique("pessoa_cpf_key").on(table.cpf),
	unique("pessoa_email_key").on(table.email),
	pgPolicy("Liberar tudo pessoa", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("liberar tudo pessoa", { as: "permissive", for: "all", to: ["public"] }),
]);

export const conta = pgTable("conta", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	saldo: numeric().notNull(),
	data: date(),
	deleteAt: timestamp("delete_at", { mode: 'string' }),
});

export const funcionario = pgTable("funcionario", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	pessoaId: uuid("pessoa_id"),
	cargoId: uuid("cargo_id"),
	dataAdmissao: date("data_admissao").default(sql`CURRENT_DATE`),
	ctps: varchar({ length: 20 }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	status: text(),
}, (table) => [
	foreignKey({
			columns: [table.cargoId],
			foreignColumns: [cargo.id],
			name: "funcionario_cargo_id_fkey"
		}),
	foreignKey({
			columns: [table.pessoaId],
			foreignColumns: [pessoa.id],
			name: "funcionario_pessoa_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const acesso = pgTable("acesso", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	alunoId: uuid("aluno_id"),
	dataHoraAcesso: timestamp("data_hora_acesso", { withTimezone: true, mode: 'string' }).defaultNow(),
	tipoAcesso: text("tipo_acesso"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	horaEntrada: timestamp("hora_entrada", { mode: 'string' }),
	horaSaida: timestamp("hora_saida", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "acesso_aluno_id_fkey"
		}),
	pgPolicy("all", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
]);

export const movimentacaoFinanceira = pgTable("movimentacao_financeira", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tipoMovimentacao: text("tipo_movimentacao"),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	dataMovimentacao: timestamp("data_movimentacao", { withTimezone: true, mode: 'string' }).defaultNow(),
	descricao: text(),
	assinaturaId: uuid("assinatura_id"),
	manutencaoId: uuid("manutencao_id"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	contaId: uuid("conta_id").notNull(),
	alunoId: uuid("aluno_id"),
	vencimento: date(),
	status: text().default('Pendente'),
	categoria: text(),
}, (table) => [
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "movimentacao_financeira_aluno_id_fkey"
		}),
	foreignKey({
			columns: [table.assinaturaId],
			foreignColumns: [assinatura.id],
			name: "movimentacao_financeira_assinatura_id_fkey"
		}),
	foreignKey({
			columns: [table.contaId],
			foreignColumns: [conta.id],
			name: "movimentacao_financeira_conta_id_fkey"
		}),
	foreignKey({
			columns: [table.manutencaoId],
			foreignColumns: [manutencaoEquipamento.id],
			name: "movimentacao_financeira_manutencao_id_fkey"
		}),
]);

export const assinatura = pgTable("assinatura", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	alunoId: uuid("aluno_id"),
	planoId: uuid("plano_id"),
	dataInicio: date("data_inicio").default(sql`CURRENT_DATE`),
	dataFim: date("data_fim"),
	statusAssinatura: text("status_assinatura"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	dataAssinatura: date("data_assinatura"),
}, (table) => [
	foreignKey({
			columns: [table.alunoId],
			foreignColumns: [aluno.id],
			name: "assinatura_aluno_id_fkey"
		}),
	foreignKey({
			columns: [table.planoId],
			foreignColumns: [plano.id],
			name: "assinatura_plano_id_fkey"
		}),
	pgPolicy("Liberar tudo assinatura", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("liberar tudo assinatura", { as: "permissive", for: "all", to: ["public"] }),
]);
