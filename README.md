# 🏋️ GymIO

<div align="center">

### Sistema de Gestão Interna para Academias

Aplicação web desenvolvida para automatizar e centralizar os processos administrativos de academias, proporcionando maior controle operacional, financeiro e gerencial.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github)

</div>

---

# 📖 Sobre o Projeto

O **GymIO** é um sistema web desenvolvido durante a disciplina de **Projeto Integrador**, com o objetivo de informatizar a gestão interna de academias.

A aplicação reúne em uma única plataforma os principais processos administrativos, permitindo o gerenciamento de alunos, funcionários, planos, matrículas, pagamentos, equipamentos, controle de acesso e geração de relatórios.

Além disso, o sistema fornece indicadores estratégicos por meio de um dashboard, auxiliando a tomada de decisões pelos administradores da academia.

---

# ✨ Funcionalidades

- 🔐 Autenticação de usuários
- 👤 Cadastro e gerenciamento de alunos
- 👨‍💼 Cadastro de funcionários
- 📋 Gestão de planos e matrículas
- 💳 Controle financeiro
- 🚪 Controle de acesso (catraca)
- 🏋️ Controle de equipamentos
- 📈 Dashboard administrativo
- 📊 Relatórios gerenciais

---

# 🚀 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| React | Interface da aplicação |
| Vite | Build e ambiente de desenvolvimento |
| Node.js | Backend da aplicação |
| JavaScript | Linguagem principal |
| Supabase | Banco de dados PostgreSQL e autenticação |
| CSS | Estilização |
| Lucide React | Ícones |
| React Router DOM | Gerenciamento de rotas |
| Git | Controle de versão |
| GitHub | Hospedagem do repositório |

---

# 📂 Estrutura do Projeto

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
│   ├── API.md
│   ├── CONFIGURACAO.md
│   ├── VALIDACAO.md
│   ├── swagger.yaml
│   └── Relatorios
│
└── README.md
```

---

# ⚙️ Requisitos

- Node.js 22+
- npm
- Git
- Conta no Supabase

---

# ▶️ Instalação

## Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/GymIO.git
```

```bash
cd GymIO
```

---

## Backend

```bash
cd backend
npm install
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Configuração

Crie um arquivo `.env` na pasta do backend contendo:

```env
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
PORT=3000
```

As demais instruções encontram-se em:

```text
documents/CONFIGURACAO.md
```

---

# 📚 Documentação

A documentação técnica do projeto encontra-se na pasta **documents**.

| Documento | Descrição |
|------------|-----------|
| API.md | Documentação completa da API REST |
| CONFIGURACAO.md | Guia de instalação e execução |
| VALIDACAO.md | Validação dos requisitos funcionais |
| swagger.yaml | Especificação OpenAPI |
| Relatorios | Documentação complementar |

---

# 🌱 Fluxo de Versionamento

```
main
│
├── develop
│
├── feature/login
├── feature/alunos
├── feature/financeiro
├── feature/equipamentos
└── feature/dashboard
```

- **main** → versão estável
- **develop** → integração das funcionalidades
- **feature/** → desenvolvimento de novas funcionalidades

---

# 👥 Equipe

| Integrante | Responsabilidade |
|------------|------------------|
| Emanuel Alves | Desenvolvedor Full Stack |
| Emilly Damasceno Walter | Analista de Sistemas • Backend |
| Isabelly Turquino | Front-end • Controle de Versionamento |
| Marjory Cardoso | Backend |
| Ryan Thomaz | Backend |
| Samara Oliveira | Scrum Master • Front-end |
| Yasmym Lemes | Front-end |

---

# 📌 Status do Projeto

🚧 **Em desenvolvimento**

Projeto desenvolvido durante a disciplina de **Projeto Integrador**, recebendo novas funcionalidades de forma incremental ao longo dos bimestres.

---

<div align="center">

Desenvolvido com ❤️ pela equipe **GymIO**

</div>