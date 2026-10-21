# GymIO — Backend

Node.js + Express + Prisma, conectado **diretamente** ao PostgreSQL (Supabase).

```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

## Como rodar

```bash
cd backend
npm install                 # roda "prisma generate" automaticamente
npm run dev                 # http://localhost:3002  (Swagger em /api-docs)
npm test                    # testes unitários (não precisam de banco)
```

Nunca versione o `.env`. O `.env.example` só tem placeholders.

## Estrutura

```
prisma/schema.prisma        modelo do banco (conferir antes de qualquer migration)
src/config/                 env.js e prisma.js (ÚNICO PrismaClient — todos os módulos o reutilizam)
src/middlewares/            authMiddleware, errorMiddleware
src/utils/                  AppError, asyncHandler, validators, date (fuso da academia)
src/modules/<modulo>/       index.js, *.routes, *.controller, *.service, *.repository
```

Cada módulo expõe `index.js` com `{ basePath, router }`; o `src/server.js` carrega os módulos automaticamente.
Regras de negócio ficam no **service**; acesso ao banco só no **repository**. Um módulo usa outro
**pelo service** dele, nunca pelo repository.

## Módulos migrados para a nova arquitetura

| Módulo | Base | Responsável |
|---|---|---|
| Auth | `/api/auth` (login, logout, me, register*) | Ryan |
| Pessoas | `/api/pessoas` | Ryan |
| Funcionários | `/api/funcionarios` | Ryan |
| Controle de Acesso | `/api/acesso` (`/`, `/hoje`, `/aluno/:id`, `/entrada`, `/saida`) | Emanuel |
| Dashboard | `/api/dashboard` (`/resumo`, `/alunos`, `/financeiro`) | Emanuel |

\* `register` exige sessão ativa (só quem já está logado cadastra outro funcionário).

Ainda no formato legado (pastas `controllers/`, `routes/`, `models/`, `db/`; montados pelo bloco `LEGADO`
do `src/server.js`): Planos/Matrículas, Financeiro, Relatórios, Equipamentos, Manutenções. Ao migrar um módulo,
crie `src/modules/<modulo>/`, apague os arquivos legados correspondentes e remova a linha do `LEGADO`.

## Pontos de integração pendentes

- `acesso.repository.findAssinaturasDoAluno` e `dashboard.repository` leem assinaturas/financeiro direto do Prisma.
  Quando Matrículas (Marjory) e Financeiro (Samara) forem migrados, trocar por chamadas aos services deles.
- `db/index.js` (legado) abre um pool `pg` próprio, além do Prisma. Deve sumir quando os últimos módulos legados migrarem.

## Observações de comportamento

- "Hoje", "últimos 7 dias" e "mês atual" usam `APP_TIMEZONE` (padrão `America/Sao_Paulo`), não UTC.
- Acesso: entrada exige aluno `Ativo` + assinatura vigente; tentativas negadas ficam como `bloqueado`;
  após uma saída há intervalo mínimo de 5 min. Registros do mesmo aluno são serializados (lock no Postgres).
- Dashboard conta só **entradas liberadas** como "acessos"; "vencendo hoje" ignora assinaturas canceladas.
- Editar pessoa com a senha vazia ou mascarada (`••••••••`) **mantém** a senha atual.
