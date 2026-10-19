# Correções aplicadas — Ryan e Emanuel

## Ryan
- Mantida a arquitetura modular com Prisma Client centralizado em `backend/src/config/prisma.js`.
- Auth, Pessoas e Funcionários ficam nos módulos `backend/src/modules/auth`, `pessoas` e `funcionarios`.
- Sanitizado `backend/.env.example`: a URL do banco agora usa placeholders, sem credencial embutida.

## Emanuel
- Criado `backend/src/modules/acesso` com repository, service, controller e routes usando o Prisma compartilhado.
- Implementados listagem de acessos, registro de entrada/saída, validação de CPF, aluno ativo, assinatura válida, prevenção de entrada duplicada e intervalo mínimo entre entradas.
- Criado `backend/src/modules/dashboard` com consultas Prisma para os indicadores usados pelo frontend.
- Os módulos Acesso e Dashboard exigem sessão JWT via cookie, usando o middleware compartilhado.
- Endpoints usados pelo frontend: `/api/acessos` e `/api/dashboard`.

## Verificações
- `node --check` executado com sucesso nos arquivos JavaScript dos módulos Ryan/Emanuel e utilitários compartilhados.
- Não foi possível testar uma conexão real nem validar consultas contra o banco porque este pacote não inclui o `.env` (intencionalmente, para não distribuir credenciais).

## Como validar localmente
1. Extraia o ZIP.
2. Instale as dependências em `backend` com `npm install`.
3. Crie `backend/.env` a partir de `.env.example` e preencha `DATABASE_URL` e `JWT_SECRET` reais localmente.
4. Execute `npx prisma validate` e `npx prisma generate`.
5. Execute `npm run dev` e teste login, `/api/acessos` e `/api/dashboard`.

**Importante:** o ZIP não contém `.env`, `.git` nem `node_modules`. A URL real do banco não deve ser commitada; se a senha que estava no `.env.example` era válida, rotacione-a no provedor do banco.
