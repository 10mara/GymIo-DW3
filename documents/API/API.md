# 📚 Documentação da API - GymIO

## Visão Geral

A API do **GymIO** segue o padrão **REST** e foi desenvolvida utilizando **Node.js**, **Express** e **Supabase**.

Ela é responsável por disponibilizar os serviços utilizados pela aplicação web, permitindo o gerenciamento de autenticação, pessoas, planos e matrículas.

---

# Tecnologias

- Node.js
- Express
- Supabase
- PostgreSQL
- JWT
- Cookies HTTP
- OpenAPI 3.1

---

# Base URL

Servidor local:

```text
http://localhost:3002
```

---

# Autenticação

A autenticação utiliza o serviço de autenticação do Supabase.

Após o login, a API cria um cookie HTTP chamado:

```text
token
```

Este cookie é utilizado automaticamente para acessar as rotas protegidas.

---

# Endpoints

## Autenticação

| Método | Endpoint | Descrição |
|---------|----------|-----------|
| POST | /api/auth/register | Cadastro de usuário |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Dados do usuário autenticado |

---

## Pessoas

| Método | Endpoint |
|---------|----------|
| GET | /api/pessoas |
| POST | /api/pessoas |
| PUT | /api/pessoas/{id} |
| DELETE | /api/pessoas/{id} |
| GET | /api/pessoas/total-alunos |
| GET | /api/pessoas/planos |
| GET | /api/pessoas/cargos |

---

## Planos

| Método | Endpoint |
|---------|----------|
| GET | /api/planos |
| POST | /api/planos |
| PUT | /api/planos/{id} |
| DELETE | /api/planos/{id} |

---

## Matrículas

| Método | Endpoint |
|---------|----------|
| GET | /api/planos/matriculas |
| POST | /api/planos/matriculas |
| PATCH | /api/planos/matriculas/{id}/cancelar |
| PATCH | /api/planos/matriculas/{id}/renovar |

---

# Códigos HTTP

| Código | Significado |
|---------|-------------|
| 200 | Operação realizada com sucesso |
| 201 | Recurso criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

# Formato das Requisições

Todas as requisições utilizam o padrão:

```http
Content-Type: application/json
```

Exemplo:

```json
{
    "nome":"João",
    "email":"joao@email.com"
}
```

---

# Formato das Respostas

Sucesso:

```json
{
    "mensagem":"Operação realizada com sucesso."
}
```

Erro:

```json
{
    "erro":"Descrição do erro."
}
```

---

# Segurança

A API utiliza:

- JWT
- Cookies HTTP
- Middleware de autenticação
- Validação de credenciais pelo Supabase

---

# Estrutura da API

```text
Cliente

↓

React

↓

Express

↓

Controllers

↓

Models

↓

Supabase

↓

PostgreSQL
```

---

# Documentação OpenAPI

Toda a especificação da API encontra-se no arquivo:

```text
swagger.yaml
```

Este arquivo segue o padrão **OpenAPI 3.1** e pode ser visualizado utilizando Swagger UI, Swagger Editor ou Redoc.

---

# Considerações

A API foi construída seguindo o estilo REST, utilizando recursos organizados por entidades.

Cada endpoint possui responsabilidades bem definidas, retornando respostas em formato JSON e utilizando códigos HTTP apropriados para indicar o resultado das operações.