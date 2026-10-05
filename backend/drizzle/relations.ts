import { relations } from "drizzle-orm/relations";
import { pessoa, aluno, funcionario, controlePonto, equipamento, manutencaoEquipamento, cargo, acesso, movimentacaoFinanceira, assinatura, conta, plano } from "./schema";

export const alunoRelations = relations(aluno, ({one, many}) => ({
	pessoa: one(pessoa, {
		fields: [aluno.pessoaId],
		references: [pessoa.id]
	}),
	acessos: many(acesso),
	movimentacaoFinanceiras: many(movimentacaoFinanceira),
	assinaturas: many(assinatura),
}));

export const pessoaRelations = relations(pessoa, ({many}) => ({
	alunos: many(aluno),
	funcionarios: many(funcionario),
}));

export const controlePontoRelations = relations(controlePonto, ({one}) => ({
	funcionario: one(funcionario, {
		fields: [controlePonto.funcionarioId],
		references: [funcionario.id]
	}),
}));

export const funcionarioRelations = relations(funcionario, ({one, many}) => ({
	controlePontos: many(controlePonto),
	manutencaoEquipamentos: many(manutencaoEquipamento),
	cargo: one(cargo, {
		fields: [funcionario.cargoId],
		references: [cargo.id]
	}),
	pessoa: one(pessoa, {
		fields: [funcionario.pessoaId],
		references: [pessoa.id]
	}),
}));

export const manutencaoEquipamentoRelations = relations(manutencaoEquipamento, ({one, many}) => ({
	equipamento: one(equipamento, {
		fields: [manutencaoEquipamento.equipamentoId],
		references: [equipamento.id]
	}),
	funcionario: one(funcionario, {
		fields: [manutencaoEquipamento.funcionarioId],
		references: [funcionario.id]
	}),
	movimentacaoFinanceiras: many(movimentacaoFinanceira),
}));

export const equipamentoRelations = relations(equipamento, ({many}) => ({
	manutencaoEquipamentos: many(manutencaoEquipamento),
}));

export const cargoRelations = relations(cargo, ({many}) => ({
	funcionarios: many(funcionario),
}));

export const acessoRelations = relations(acesso, ({one}) => ({
	aluno: one(aluno, {
		fields: [acesso.alunoId],
		references: [aluno.id]
	}),
}));

export const movimentacaoFinanceiraRelations = relations(movimentacaoFinanceira, ({one}) => ({
	aluno: one(aluno, {
		fields: [movimentacaoFinanceira.alunoId],
		references: [aluno.id]
	}),
	assinatura: one(assinatura, {
		fields: [movimentacaoFinanceira.assinaturaId],
		references: [assinatura.id]
	}),
	conta: one(conta, {
		fields: [movimentacaoFinanceira.contaId],
		references: [conta.id]
	}),
	manutencaoEquipamento: one(manutencaoEquipamento, {
		fields: [movimentacaoFinanceira.manutencaoId],
		references: [manutencaoEquipamento.id]
	}),
}));

export const assinaturaRelations = relations(assinatura, ({one, many}) => ({
	movimentacaoFinanceiras: many(movimentacaoFinanceira),
	aluno: one(aluno, {
		fields: [assinatura.alunoId],
		references: [aluno.id]
	}),
	plano: one(plano, {
		fields: [assinatura.planoId],
		references: [plano.id]
	}),
}));

export const contaRelations = relations(conta, ({many}) => ({
	movimentacaoFinanceiras: many(movimentacaoFinanceira),
}));

export const planoRelations = relations(plano, ({many}) => ({
	assinaturas: many(assinatura),
}));