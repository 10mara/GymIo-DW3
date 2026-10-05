const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  date,
  timestamp,
  time,
  numeric,
  uuid,
  index,
  uniqueIndex,
} = require("drizzle-orm/pg-core");

const { relations } = require("drizzle-orm");

/**
 * ============================================================
 * PESSOA
 * ============================================================
 */

const pessoa = pgTable(
  "pessoa",
  {
    id: serial("id").primaryKey(),

    nome: varchar("nome", {
      length: 150,
    }).notNull(),

    cpf: varchar("cpf", {
      length: 20,
    }).notNull(),

    telefone: varchar("telefone", {
      length: 30,
    }),

    email: varchar("email", {
      length: 150,
    }),

    dataNascimento: date("data_nascimento"),

    endereco: text("endereco"),

    password: text("password"),

    /**
     * Mantido porque o código antigo utilizava
     * o UUID do Supabase Auth.
     *
     * Durante a migração para autenticação própria,
     * esse campo poderá ser removido posteriormente.
     */
    authId: uuid("auth_id"),

    passwordResetToken: text(
      "password_reset_token"
    ),

    passwordResetExpires: timestamp(
      "password_reset_expires",
      {
        withTimezone: true,
      }
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    pessoaCpfIdx: uniqueIndex(
      "pessoa_cpf_unique_idx"
    ).on(table.cpf),

    pessoaEmailIdx: index(
      "pessoa_email_idx"
    ).on(table.email),

    pessoaDeletedIdx: index(
      "pessoa_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * CARGO
 * ============================================================
 */

const cargo = pgTable(
  "cargo",
  {
    id: serial("id").primaryKey(),

    nomeCargo: varchar("nome_cargo", {
      length: 100,
    }).notNull(),

    descricaoCargo: text(
      "descricao_cargo"
    ),

    salarioBase: numeric(
      "salario_base",
      {
        precision: 12,
        scale: 2,
      }
    ),

    status: varchar("status", {
      length: 30,
    }).default("Ativo"),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    cargoNomeIdx: index(
      "cargo_nome_idx"
    ).on(table.nomeCargo),

    cargoDeletedIdx: index(
      "cargo_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * PLANO
 * ============================================================
 */

const plano = pgTable(
  "plano",
  {
    id: serial("id").primaryKey(),

    nomePlano: varchar("nome_plano", {
      length: 100,
    }).notNull(),

    descricao: text("descricao"),

    valor: numeric(
      "valor",
      {
        precision: 12,
        scale: 2,
      }
    ).notNull(),

    duracaoMeses: integer(
      "duracao_meses"
    ).notNull(),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    planoNomeIdx: index(
      "plano_nome_idx"
    ).on(table.nomePlano),

    planoDeletedIdx: index(
      "plano_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * ALUNO
 * ============================================================
 */

const aluno = pgTable(
  "aluno",
  {
    id: serial("id").primaryKey(),

    pessoaId: integer(
      "pessoa_id"
    )
      .notNull()
      .references(() => pessoa.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    status: varchar("status", {
      length: 30,
    }).notNull().default("Ativo"),

    dataMatricula: date(
      "data_matricula"
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    alunoPessoaIdx: index(
      "aluno_pessoa_id_idx"
    ).on(table.pessoaId),

    alunoStatusIdx: index(
      "aluno_status_idx"
    ).on(table.status),

    alunoDeletedIdx: index(
      "aluno_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * FUNCIONARIO
 * ============================================================
 */

const funcionario = pgTable(
  "funcionario",
  {
    id: serial("id").primaryKey(),

    pessoaId: integer(
      "pessoa_id"
    )
      .notNull()
      .references(() => pessoa.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    cargoId: integer(
      "cargo_id"
    )
      .references(() => cargo.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),

    dataAdmissao: date(
      "data_admissao"
    ),

    ctps: varchar("ctps", {
      length: 50,
    }),

    status: varchar("status", {
      length: 30,
    }).notNull().default("Ativo"),

    salario: numeric(
      "salario",
      {
        precision: 12,
        scale: 2,
      }
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    funcionarioPessoaIdx: index(
      "funcionario_pessoa_id_idx"
    ).on(table.pessoaId),

    funcionarioCargoIdx: index(
      "funcionario_cargo_id_idx"
    ).on(table.cargoId),

    funcionarioDeletedIdx: index(
      "funcionario_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * ASSINATURA
 * ============================================================
 */

const assinatura = pgTable(
  "assinatura",
  {
    id: serial("id").primaryKey(),

    alunoId: integer(
      "aluno_id"
    )
      .notNull()
      .references(() => aluno.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    planoId: integer(
      "plano_id"
    )
      .references(() => plano.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),

    dataInicio: date(
      "data_inicio"
    ),

    dataFim: date(
      "data_fim"
    ),

    statusAssinatura: varchar(
      "status_assinatura",
      {
        length: 30,
      }
    ).notNull().default("Ativo"),

    dataAssinatura: date(
      "data_assinatura"
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    assinaturaAlunoIdx: index(
      "assinatura_aluno_id_idx"
    ).on(table.alunoId),

    assinaturaPlanoIdx: index(
      "assinatura_plano_id_idx"
    ).on(table.planoId),

    assinaturaStatusIdx: index(
      "assinatura_status_idx"
    ).on(table.statusAssinatura),

    assinaturaDeletedIdx: index(
      "assinatura_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * ACESSO
 * ============================================================
 */

const acesso = pgTable(
  "acesso",
  {
    id: serial("id").primaryKey(),

    alunoId: integer(
      "aluno_id"
    ).references(() => aluno.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    tipoAcesso: varchar(
      "tipo_acesso",
      {
        length: 30,
      }
    ).notNull(),

    dataHoraAcesso: timestamp(
      "data_hora_acesso",
      {
        withTimezone: true,
      }
    ).notNull(),

    horaEntrada: timestamp(
      "hora_entrada",
      {
        withTimezone: true,
      }
    ),

    horaSaida: timestamp(
      "hora_saida",
      {
        withTimezone: true,
      }
    ),

    status: varchar("status", {
      length: 30,
    }),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    acessoAlunoIdx: index(
      "acesso_aluno_id_idx"
    ).on(table.alunoId),

    acessoDataIdx: index(
      "acesso_data_hora_idx"
    ).on(table.dataHoraAcesso),

    acessoTipoIdx: index(
      "acesso_tipo_idx"
    ).on(table.tipoAcesso),

    acessoDeletedIdx: index(
      "acesso_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * CONTA
 * ============================================================
 */

const conta = pgTable(
  "conta",
  {
    id: serial("id").primaryKey(),

    saldo: numeric(
      "saldo",
      {
        precision: 14,
        scale: 2,
      }
    ).notNull().default("0"),

    data: date("data"),

    deleteAt: timestamp(
      "delete_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    contaDeleteIdx: index(
      "conta_delete_at_idx"
    ).on(table.deleteAt),
  })
);


/**
 * ============================================================
 * EQUIPAMENTO
 * ============================================================
 */

const equipamento = pgTable(
  "equipamento",
  {
    id: serial("id").primaryKey(),

    nomeEquipamento: varchar(
      "nome_equipamento",
      {
        length: 150,
      }
    ).notNull(),

    codigo: varchar("codigo", {
      length: 80,
    }),

    categoria: varchar("categoria", {
      length: 100,
    }),

    fabricante: varchar("fabricante", {
      length: 100,
    }),

    modelo: varchar("modelo", {
      length: 100,
    }),

    dataAquisicao: date(
      "data_aquisicao"
    ),

    garantia: varchar("garantia", {
      length: 100,
    }),

    statusConservacao: varchar(
      "status_conservacao",
      {
        length: 50,
      }
    ),

    localizacao: varchar(
      "localizacao",
      {
        length: 150,
      }
    ),

    observacoes: text(
      "observacoes"
    ),

    ultimaManutencaoId: integer(
      "ultima_manutencao_id"
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    equipamentoNomeIdx: index(
      "equipamento_nome_idx"
    ).on(table.nomeEquipamento),

    equipamentoCodigoIdx: index(
      "equipamento_codigo_idx"
    ).on(table.codigo),

    equipamentoDeletedIdx: index(
      "equipamento_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * MANUTENÇÃO DE EQUIPAMENTO
 * ============================================================
 */

const manutencaoEquipamento = pgTable(
  "manutencao_equipamento",
  {
    id: serial("id").primaryKey(),

    equipamentoId: integer(
      "equipamento_id"
    )
      .notNull()
      .references(() => equipamento.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    tipoManutencao: varchar(
      "tipo_manutencao",
      {
        length: 50,
      }
    ),

    dataManutencao: date(
      "data_manutencao"
    ),

    tecnico: varchar("tecnico", {
      length: 150,
    }),

    custo: numeric(
      "custo",
      {
        precision: 12,
        scale: 2,
      }
    ).default("0"),

    descricaoServico: text(
      "descricao_servico"
    ),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    manutencaoEquipamentoIdx: index(
      "manutencao_equipamento_id_idx"
    ).on(table.equipamentoId),

    manutencaoDataIdx: index(
      "manutencao_data_idx"
    ).on(table.dataManutencao),

    manutencaoDeletedIdx: index(
      "manutencao_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * MOVIMENTAÇÃO FINANCEIRA
 * ============================================================
 */

const movimentacaoFinanceira = pgTable(
  "movimentacao_financeira",
  {
    id: serial("id").primaryKey(),

    tipoMovimentacao: varchar(
      "tipo_movimentacao",
      {
        length: 30,
      }
    ).notNull(),

    descricao: text("descricao"),

    valor: numeric(
      "valor",
      {
        precision: 14,
        scale: 2,
      }
    ).notNull(),

    vencimento: date(
      "vencimento"
    ),

    status: varchar("status", {
      length: 50,
    }),

    categoria: varchar("categoria", {
      length: 100,
    }),

    dataMovimentacao: timestamp(
      "data_movimentacao",
      {
        withTimezone: true,
      }
    ).notNull().defaultNow(),

    alunoId: integer(
      "aluno_id"
    ).references(() => aluno.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    assinaturaId: integer(
      "assinatura_id"
    ).references(() => assinatura.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    manutencaoId: integer(
      "manutencao_id"
    ).references(
      () => manutencaoEquipamento.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      }
    ),

    contaId: integer(
      "conta_id"
    ).references(() => conta.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    movimentacaoAlunoIdx: index(
      "movimentacao_aluno_id_idx"
    ).on(table.alunoId),

    movimentacaoAssinaturaIdx: index(
      "movimentacao_assinatura_id_idx"
    ).on(table.assinaturaId),

    movimentacaoManutencaoIdx: index(
      "movimentacao_manutencao_id_idx"
    ).on(table.manutencaoId),

    movimentacaoContaIdx: index(
      "movimentacao_conta_id_idx"
    ).on(table.contaId),

    movimentacaoDataIdx: index(
      "movimentacao_data_idx"
    ).on(table.dataMovimentacao),

    movimentacaoDeletedIdx: index(
      "movimentacao_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * CONTROLE DE PONTO
 * ============================================================
 */

const controlePonto = pgTable(
  "controle_ponto",
  {
    id: serial("id").primaryKey(),

    funcionarioId: integer(
      "funcionario_id"
    )
      .notNull()
      .references(() => funcionario.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    data: date("data").notNull(),

    horaEntrada: time(
      "hora_entrada"
    ),

    horaSaida: time(
      "hora_saida"
    ),

    status: varchar("status", {
      length: 30,
    }),

    deletedAt: timestamp(
      "deleted_at",
      {
        withTimezone: true,
      }
    ),
  },

  (table) => ({
    pontoFuncionarioIdx: index(
      "controle_ponto_funcionario_id_idx"
    ).on(table.funcionarioId),

    pontoDataIdx: index(
      "controle_ponto_data_idx"
    ).on(table.data),

    pontoDeletedIdx: index(
      "controle_ponto_deleted_at_idx"
    ).on(table.deletedAt),
  })
);


/**
 * ============================================================
 * RELAÇÕES
 * ============================================================
 */

const pessoaRelations = relations(
  pessoa,
  ({ many }) => ({
    alunos: many(aluno),
    funcionarios: many(funcionario),
  })
);


const alunoRelations = relations(
  aluno,
  ({ one, many }) => ({
    pessoa: one(pessoa, {
      fields: [aluno.pessoaId],
      references: [pessoa.id],
    }),

    assinaturas: many(assinatura),

    acessos: many(acesso),

    movimentacoesFinanceiras:
      many(movimentacaoFinanceira),
  })
);


const cargoRelations = relations(
  cargo,
  ({ many }) => ({
    funcionarios: many(funcionario),
  })
);


const funcionarioRelations = relations(
  funcionario,
  ({ one, many }) => ({
    pessoa: one(pessoa, {
      fields: [funcionario.pessoaId],
      references: [pessoa.id],
    }),

    cargo: one(cargo, {
      fields: [funcionario.cargoId],
      references: [cargo.id],
    }),

    controlesPonto: many(controlePonto),
  })
);


const planoRelations = relations(
  plano,
  ({ many }) => ({
    assinaturas: many(assinatura),
  })
);


const assinaturaRelations = relations(
  assinatura,
  ({ one, many }) => ({
    aluno: one(aluno, {
      fields: [assinatura.alunoId],
      references: [aluno.id],
    }),

    plano: one(plano, {
      fields: [assinatura.planoId],
      references: [plano.id],
    }),

    movimentacoesFinanceiras:
      many(movimentacaoFinanceira),
  })
);


const acessoRelations = relations(
  acesso,
  ({ one }) => ({
    aluno: one(aluno, {
      fields: [acesso.alunoId],
      references: [aluno.id],
    }),
  })
);


const equipamentoRelations = relations(
  equipamento,
  ({ many }) => ({
    manutencoes: many(
      manutencaoEquipamento
    ),
  })
);


const manutencaoEquipamentoRelations =
  relations(
    manutencaoEquipamento,
    ({ one, many }) => ({
      equipamento: one(equipamento, {
        fields: [
          manutencaoEquipamento.equipamentoId,
        ],
        references: [equipamento.id],
      }),

      movimentacoesFinanceiras:
        many(movimentacaoFinanceira),
    })
  );


const contaRelations = relations(
  conta,
  ({ many }) => ({
    movimentacoesFinanceiras:
      many(movimentacaoFinanceira),
  })
);


const movimentacaoFinanceiraRelations =
  relations(
    movimentacaoFinanceira,
    ({ one }) => ({
      aluno: one(aluno, {
        fields: [
          movimentacaoFinanceira.alunoId,
        ],
        references: [aluno.id],
      }),

      assinatura: one(assinatura, {
        fields: [
          movimentacaoFinanceira.assinaturaId,
        ],
        references: [assinatura.id],
      }),

      manutencao: one(
        manutencaoEquipamento,
        {
          fields: [
            movimentacaoFinanceira.manutencaoId,
          ],
          references: [
            manutencaoEquipamento.id,
          ],
        }
      ),

      conta: one(conta, {
        fields: [
          movimentacaoFinanceira.contaId,
        ],
        references: [conta.id],
      }),
    })
  );


const controlePontoRelations =
  relations(
    controlePonto,
    ({ one }) => ({
      funcionario: one(funcionario, {
        fields: [
          controlePonto.funcionarioId,
        ],
        references: [funcionario.id],
      }),
    })
  );


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  pessoa,
  cargo,
  plano,
  aluno,
  funcionario,
  assinatura,
  acesso,
  conta,
  equipamento,
  manutencaoEquipamento,
  movimentacaoFinanceira,
  controlePonto,

  pessoaRelations,
  cargoRelations,
  planoRelations,
  alunoRelations,
  funcionarioRelations,
  assinaturaRelations,
  acessoRelations,
  contaRelations,
  equipamentoRelations,
  manutencaoEquipamentoRelations,
  movimentacaoFinanceiraRelations,
  controlePontoRelations,
};