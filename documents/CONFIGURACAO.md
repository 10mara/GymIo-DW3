# ⚙️ Guia de Configuração e Execução

Este documento descreve todos os passos necessários para configurar o ambiente de desenvolvimento, instalar as dependências e executar o projeto **GymIO** localmente.

---

# 📋 Índice

- Pré-requisitos
- Tecnologias
- Estrutura do Projeto
- Clonando o Repositório
- Instalação das Dependências
- Configuração do Banco de Dados
- Variáveis de Ambiente
- Executando o Backend
- Executando o Frontend
- Estrutura do Banco de Dados
- Fluxo Geral da Aplicação
- Solução de Problemas

---

# 💻 Pré-requisitos

Antes de executar o projeto, certifique-se de possuir os seguintes softwares instalados.

| Software | Versão Recomendada |
|-----------|--------------------|
| Node.js | 22.x ou superior |
| npm | 10.x ou superior |
| Git | Última versão |
| Navegador | Google Chrome ou Microsoft Edge |
| Conta Supabase | Obrigatória |

---

# 🚀 Tecnologias Utilizadas

## Front-end

- React
- Vite
- JavaScript
- CSS
- React Router DOM
- Lucide React

## Back-end

- Node.js
- Express
- JWT
- Supabase

## Banco de Dados

- PostgreSQL (Supabase)

---

# 📁 Estrutura do Projeto

```text
GymIO
│
├── backend
│   ├── config
│   ├── controllers
│   ├── database
│   ├── middlewares
│   ├── models
│   ├── repositories
│   ├── routes
│   ├── services
│   └── server.js
│
├── frontend
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       ├── contexts
│       ├── hooks
│       ├── layouts
│       ├── pages
│       ├── routes
│       ├── services
│       ├── styles
│       └── utils
│
├── documents
│
└── README.md
```

---

# 📥 Clonando o Projeto

Clone o repositório.

```bash
git clone https://github.com/SEU-USUARIO/GymIO.git
```

Acesse a pasta.

```bash
cd GymIO
```

---

# 📦 Instalação das Dependências

## Backend

```bash
cd backend
npm install
```

---

## Frontend

```bash
cd frontend
npm install
```

---

# 🗄 Configuração do Banco de Dados

O GymIO utiliza o **Supabase** como banco de dados principal.

O banco é responsável por armazenar:

- Usuários
- Alunos
- Funcionários
- Planos
- Matrículas
- Pagamentos
- Equipamentos
- Controle de acesso
- Relatórios

Após criar o projeto no Supabase, copie as credenciais da API.

---

# 🔐 Variáveis de Ambiente

Na pasta **backend**, crie um arquivo chamado:

```text
.env
```

Configure as seguintes variáveis.

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co

SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

JWT_SECRET=sua_chave_secreta

PORT=3000
```

Caso o frontend utilize variáveis próprias, crie também:

```text
frontend/.env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co

VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

# ▶️ Executando o Backend

Acesse a pasta.

```bash
cd backend
```

Execute.

```bash
npm run dev
```

Servidor disponível em:

```text
http://localhost:3000
```

---

# ▶️ Executando o Frontend

Acesse a pasta.

```bash
cd frontend
```

Execute.

```bash
npm run dev
```

Aplicação disponível em:

```text
http://localhost:5173
```

---

# 🔄 Fluxo de Inicialização

```text
Clonar Repositório

↓

Instalar Dependências

↓

Configurar .env

↓

Conectar ao Supabase

↓

Executar Backend

↓

Executar Frontend

↓

Acessar aplicação
```

---

# 🗃 Estrutura do Banco de Dados

O banco de dados foi desenvolvido utilizando PostgreSQL através do Supabase.

As principais entidades do sistema são:

- Usuários
- Alunos
- Funcionários
- Planos
- Matrículas
- Pagamentos
- Equipamentos
- Controle de Acesso
- Relatórios

Os relacionamentos completos encontram-se na documentação do DER.

---

# 🔐 Autenticação

A autenticação do sistema utiliza:

- JWT
- Supabase Authentication

Fluxo:

```text
Usuário

↓

Login

↓

Validação das credenciais

↓

Geração do Token

↓

Acesso às rotas protegidas
```

---

# 📂 Organização das Branches

```text
main
```

Versão estável.

```text
develop
```

Integração das funcionalidades.

```text
feature/*
```

Desenvolvimento de novas funcionalidades.

---

# 📖 Documentação

A documentação do projeto encontra-se organizada na pasta:

```text
documents/
```

Arquivos disponíveis:

```text
README.md
CONFIGURACAO.md
API.md
VALIDACAO.md
swagger.yaml
```

---

# 🛠 Solução de Problemas

## Erro ao instalar dependências

Execute:

```bash
npm install
```

novamente.

---

## Erro de conexão com o Supabase

Verifique:

- URL do projeto
- Chaves da API
- Arquivo .env
- Permissões do banco

---

## Porta em uso

Altere a variável:

```env
PORT=
```

para outra porta disponível.

---

## Erro de autenticação

Verifique:

- JWT_SECRET
- Token enviado na requisição
- Sessão do usuário

---

# ✅ Execução Esperada

Após a configuração correta:

- Backend iniciado com sucesso
- Frontend iniciado com sucesso
- Comunicação com o Supabase estabelecida
- Login funcionando
- CRUDs disponíveis
- Dashboard carregado
- Banco de dados conectado

---

# 📌 Observações

Sempre que novas dependências forem adicionadas ao projeto, execute novamente:

```bash
npm install
```

Caso sejam realizadas alterações na estrutura do banco de dados, recomenda-se atualizar a documentação técnica e o DER para manter a consistência entre a implementação e a documentação.