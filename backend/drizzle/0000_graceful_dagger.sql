-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "cargo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_cargo" text NOT NULL,
	"salario_base" numeric(10, 2),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "cargo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid,
	"status" text DEFAULT 'ativo',
	"data_matricula" date DEFAULT CURRENT_DATE,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "aluno" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plano" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_plano" text NOT NULL,
	"descricao" text,
	"valor" numeric(10, 2) NOT NULL,
	"duracao_meses" integer,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "plano" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "controle_ponto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funcionario_id" uuid,
	"entrada" timestamp with time zone DEFAULT now(),
	"saida" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "controle_ponto" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "equipamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_equipamento" text NOT NULL,
	"data_aquisicao" date,
	"status_conservacao" text,
	"deleted_at" timestamp with time zone,
	"codigo" text,
	"categoria" text,
	"fabricante" text,
	"modelo" text,
	"garantia" date,
	"localizacao" text,
	"observacoes" text
);
--> statement-breakpoint
ALTER TABLE "equipamento" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "manutencao_equipamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipamento_id" uuid,
	"funcionario_id" uuid,
	"data_manutencao" date DEFAULT CURRENT_DATE,
	"descricao_servico" text,
	"custo" numeric(10, 2),
	"deleted_at" timestamp with time zone,
	"data_finalizacao" date,
	"tipo_manutencao" text,
	"tecnico" text
);
--> statement-breakpoint
ALTER TABLE "manutencao_equipamento" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pessoa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"data_nascimento" date,
	"telefone" text,
	"email" text,
	"endereco" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"password" text,
	"password_reset_token" text,
	"passeword_reset_expires" timestamp,
	"auth_id" uuid,
	CONSTRAINT "pessoa_cpf_key" UNIQUE("cpf"),
	CONSTRAINT "pessoa_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "pessoa" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saldo" numeric NOT NULL,
	"data" date,
	"delete_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "conta" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "funcionario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid,
	"cargo_id" uuid,
	"data_admissao" date DEFAULT CURRENT_DATE,
	"ctps" varchar(20),
	"deleted_at" timestamp with time zone,
	"status" text
);
--> statement-breakpoint
ALTER TABLE "funcionario" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "acesso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid,
	"data_hora_acesso" timestamp with time zone DEFAULT now(),
	"tipo_acesso" text,
	"deleted_at" timestamp with time zone,
	"hora_entrada" timestamp,
	"hora_saida" timestamp
);
--> statement-breakpoint
ALTER TABLE "acesso" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "movimentacao_financeira" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo_movimentacao" text,
	"valor" numeric(10, 2) NOT NULL,
	"data_movimentacao" timestamp with time zone DEFAULT now(),
	"descricao" text,
	"assinatura_id" uuid,
	"manutencao_id" uuid,
	"deleted_at" timestamp with time zone,
	"conta_id" uuid NOT NULL,
	"aluno_id" uuid,
	"vencimento" date,
	"status" text DEFAULT 'Pendente',
	"categoria" text
);
--> statement-breakpoint
ALTER TABLE "movimentacao_financeira" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "assinatura" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid,
	"plano_id" uuid,
	"data_inicio" date DEFAULT CURRENT_DATE,
	"data_fim" date,
	"status_assinatura" text,
	"deleted_at" timestamp with time zone,
	"data_assinatura" date
);
--> statement-breakpoint
ALTER TABLE "assinatura" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controle_ponto" ADD CONSTRAINT "controle_ponto_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manutencao_equipamento" ADD CONSTRAINT "manutencao_equipamento_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manutencao_equipamento" ADD CONSTRAINT "manutencao_equipamento_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acesso" ADD CONSTRAINT "acesso_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."aluno"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao_financeira" ADD CONSTRAINT "movimentacao_financeira_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."aluno"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao_financeira" ADD CONSTRAINT "movimentacao_financeira_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "public"."assinatura"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao_financeira" ADD CONSTRAINT "movimentacao_financeira_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "public"."conta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao_financeira" ADD CONSTRAINT "movimentacao_financeira_manutencao_id_fkey" FOREIGN KEY ("manutencao_id") REFERENCES "public"."manutencao_equipamento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."aluno"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "public"."plano"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "all" ON "cargo" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Liberar tudo aluno" ON "aluno" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "liberar tudo aluno" ON "aluno" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "liberar tudo plano" ON "plano" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "all" ON "controle_ponto" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "all" ON "equipamento" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "all" ON "manutencao_equipamento" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Liberar tudo pessoa" ON "pessoa" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "liberar tudo pessoa" ON "pessoa" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "all" ON "funcionario" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "all" ON "acesso" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Liberar tudo assinatura" ON "assinatura" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "liberar tudo assinatura" ON "assinatura" AS PERMISSIVE FOR ALL TO public;
*/