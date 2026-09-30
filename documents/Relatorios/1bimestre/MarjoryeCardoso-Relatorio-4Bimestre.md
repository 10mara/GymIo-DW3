# 📄 Relatório Individual – Projeto GymIO

## 👤 Integrante: Marjory Gonçalves Cardoso  
**Função:** Desenvolvedora Backend  

---

## 1. Atividades Realizadas no Projeto

Durante o desenvolvimento do projeto GymIO, atuei como desenvolvedora backend, participando principalmente da implementação da funcionalidade de gerenciamento de alunos e da integração entre frontend e backend do sistema.

Minha atuação envolveu tanto manutenção no frontend quanto desenvolvimento e organização da lógica do backend. No frontend, utilizando React, auxiliei na manutenção e correção da página de gerenciamento de alunos (`Alunos.jsx`), garantindo o funcionamento adequado das operações de cadastro, edição, listagem e exclusão de alunos, além da integração correta com a API.

No backend, utilizando Node.js e Supabase, fui responsável pela construção, organização e refatoração do controller de pessoas/alunos (`pessoa.controller.js`). Nessa etapa, implementei e corrigi as principais operações relacionadas ao gerenciamento de alunos dentro do sistema.

Entre as funcionalidades desenvolvidas, destaco a implementação das requisições GET para listagem de alunos com relacionamento entre as tabelas `pessoa`, `aluno`, `assinatura` e `plano`, permitindo uma recuperação mais completa e organizada das informações. Também participei da criação de endpoints responsáveis pela listagem de planos para consumo no frontend.

Além disso, implementei funcionalidades de POST para criação de pessoa, aluno e assinatura vinculados, PUT para atualização completa dos dados dos alunos — incluindo informações de plano e senha — e DELETE utilizando exclusão lógica (soft delete), garantindo maior segurança e preservação dos dados do sistema.

Também realizei ajustes e reorganização das rotas no arquivo `pessoa.routes.js`, adicionando endpoints auxiliares como `/planos` e `/total-alunos`. Outro ponto importante foi a reorganização da ordem das rotas para evitar conflitos envolvendo parâmetros dinâmicos, como `/:id`.

Durante o desenvolvimento, também participei da integração entre frontend e backend, auxiliando na correção de inconsistências de dados e garantindo maior estabilidade na comunicação entre as diferentes camadas do sistema.

---

## 2. Conhecimentos Adquiridos

Ao longo do projeto, adquiri conhecimentos importantes relacionados ao desenvolvimento full stack e à integração entre sistemas. A experiência permitiu aprofundar minha compreensão sobre arquitetura backend, organização de controllers e estruturação de APIs REST.

Também desenvolvi habilidades relacionadas ao uso do Supabase, especialmente na criação de consultas relacionais entre tabelas e manipulação de banco de dados de forma mais organizada e eficiente.

Outro aprendizado importante foi a integração entre frontend e backend, compreendendo melhor o fluxo de dados dentro da aplicação e a importância da consistência entre as informações enviadas e recebidas pelas diferentes partes do sistema.

Além disso, aprofundei meus conhecimentos sobre organização de código, padronização de estruturas e boas práticas de desenvolvimento backend. Também adquiri maior experiência no uso do Git, especialmente em situações envolvendo integração de branches e resolução de conflitos.

---

## 3. Dificuldades Encontradas

Durante o desenvolvimento do projeto, enfrentei algumas dificuldades técnicas relacionadas principalmente à integração entre frontend e backend e à organização das estruturas do sistema.

Um dos principais desafios esteve relacionado aos conflitos de merge no Git durante a integração das branches da equipe, o que exigiu revisões constantes para evitar perda de código ou inconsistências no repositório.

Também ocorreram dificuldades envolvendo inconsistências entre nomes de campos utilizados no frontend e no backend, como diferenças entre `password` e `senha`, gerando falhas na comunicação da aplicação.

Outro desafio importante foi a modelagem dos relacionamentos entre tabelas no Supabase, especialmente nas operações que envolviam múltiplas entidades, como aluno, assinatura e plano. Além disso, surgiram problemas de sincronização de dados e erros relacionados ao estado da aplicação durante a integração das funcionalidades.

---

## 4. Como as Dificuldades Foram Resolvidas

As dificuldades foram superadas por meio de refatorações e ajustes progressivos na estrutura do sistema. Para resolver os problemas de inconsistência entre frontend e backend, foi realizada a padronização dos nomes dos campos e reorganização dos retornos da API, garantindo maior compatibilidade entre as camadas da aplicação.

Os problemas relacionados às consultas no Supabase foram solucionados através da revisão das queries e da reorganização dos relacionamentos entre as tabelas, permitindo uma recuperação de dados mais consistente e eficiente.

Já os conflitos de merge no Git foram resolvidos por meio da revisão manual das integrações, reorganização das branches e validação contínua do código após os merges realizados.

Além disso, foram realizados testes frequentes entre frontend e backend para identificar falhas, validar os dados enviados e garantir o correto funcionamento das funcionalidades implementadas.

---

## 5. Considerações Finais

A participação no projeto GymIO foi extremamente importante para o meu desenvolvimento acadêmico e profissional, especialmente na área de backend e integração de sistemas.

A experiência proporcionou um aprofundamento significativo em desenvolvimento de APIs REST, organização de arquitetura backend, manipulação de banco de dados relacionais e integração entre diferentes partes da aplicação.

Além disso, o projeto contribuiu para o desenvolvimento de habilidades importantes como resolução de problemas, organização de código, trabalho em equipe e utilização de ferramentas de versionamento em um ambiente colaborativo.

De forma geral, o aprendizado adquirido durante o desenvolvimento do projeto foi essencial para fortalecer meus conhecimentos práticos e ampliar minha preparação para futuros projetos na área de tecnologia.
# 📄 Relatório Individual – Projeto GymIO

## 👤 Integrante: Marjory Gonçalves Cardoso  
**Função:** Desenvolvedora Backend  

---

## 1. Atividades Realizadas no Projeto

Durante o desenvolvimento do projeto GymIO, atuei como desenvolvedora backend, participando principalmente da implementação da funcionalidade de gerenciamento de alunos e da integração entre frontend e backend do sistema.

Minha atuação envolveu tanto manutenção no frontend quanto desenvolvimento e organização da lógica do backend. No frontend, utilizando React, auxiliei na manutenção e correção da página de gerenciamento de alunos (`Alunos.jsx`), garantindo o funcionamento adequado das operações de cadastro, edição, listagem e exclusão de alunos, além da integração correta com a API.

No backend, utilizando Node.js e Supabase, fui responsável pela construção, organização e refatoração do controller de pessoas/alunos (`pessoa.controller.js`). Nessa etapa, implementei e corrigi as principais operações relacionadas ao gerenciamento de alunos dentro do sistema.

Entre as funcionalidades desenvolvidas, destaco a implementação das requisições GET para listagem de alunos com relacionamento entre as tabelas `pessoa`, `aluno`, `assinatura` e `plano`, permitindo uma recuperação mais completa e organizada das informações. Também participei da criação de endpoints responsáveis pela listagem de planos para consumo no frontend.

Além disso, implementei funcionalidades de POST para criação de pessoa, aluno e assinatura vinculados, PUT para atualização completa dos dados dos alunos — incluindo informações de plano e senha — e DELETE utilizando exclusão lógica (soft delete), garantindo maior segurança e preservação dos dados do sistema.

Também realizei ajustes e reorganização das rotas no arquivo `pessoa.routes.js`, adicionando endpoints auxiliares como `/planos` e `/total-alunos`. Outro ponto importante foi a reorganização da ordem das rotas para evitar conflitos envolvendo parâmetros dinâmicos, como `/:id`.

Durante o desenvolvimento, também participei da integração entre frontend e backend, auxiliando na correção de inconsistências de dados e garantindo maior estabilidade na comunicação entre as diferentes camadas do sistema.

---

## 2. Conhecimentos Adquiridos

Ao longo do projeto, adquiri conhecimentos importantes relacionados ao desenvolvimento full stack e à integração entre sistemas. A experiência permitiu aprofundar minha compreensão sobre arquitetura backend, organização de controllers e estruturação de APIs REST.

Também desenvolvi habilidades relacionadas ao uso do Supabase, especialmente na criação de consultas relacionais entre tabelas e manipulação de banco de dados de forma mais organizada e eficiente.

Outro aprendizado importante foi a integração entre frontend e backend, compreendendo melhor o fluxo de dados dentro da aplicação e a importância da consistência entre as informações enviadas e recebidas pelas diferentes partes do sistema.

Além disso, aprofundei meus conhecimentos sobre organização de código, padronização de estruturas e boas práticas de desenvolvimento backend. Também adquiri maior experiência no uso do Git, especialmente em situações envolvendo integração de branches e resolução de conflitos.

---

## 3. Dificuldades Encontradas

Durante o desenvolvimento do projeto, enfrentei algumas dificuldades técnicas relacionadas principalmente à integração entre frontend e backend e à organização das estruturas do sistema.

Um dos principais desafios esteve relacionado aos conflitos de merge no Git durante a integração das branches da equipe, o que exigiu revisões constantes para evitar perda de código ou inconsistências no repositório.

Também ocorreram dificuldades envolvendo inconsistências entre nomes de campos utilizados no frontend e no backend, como diferenças entre `password` e `senha`, gerando falhas na comunicação da aplicação.

Outro desafio importante foi a modelagem dos relacionamentos entre tabelas no Supabase, especialmente nas operações que envolviam múltiplas entidades, como aluno, assinatura e plano. Além disso, surgiram problemas de sincronização de dados e erros relacionados ao estado da aplicação durante a integração das funcionalidades.

---

## 4. Como as Dificuldades Foram Resolvidas

As dificuldades foram superadas por meio de refatorações e ajustes progressivos na estrutura do sistema. Para resolver os problemas de inconsistência entre frontend e backend, foi realizada a padronização dos nomes dos campos e reorganização dos retornos da API, garantindo maior compatibilidade entre as camadas da aplicação.

Os problemas relacionados às consultas no Supabase foram solucionados através da revisão das queries e da reorganização dos relacionamentos entre as tabelas, permitindo uma recuperação de dados mais consistente e eficiente.

Já os conflitos de merge no Git foram resolvidos por meio da revisão manual das integrações, reorganização das branches e validação contínua do código após os merges realizados.

Além disso, foram realizados testes frequentes entre frontend e backend para identificar falhas, validar os dados enviados e garantir o correto funcionamento das funcionalidades implementadas.

---

## 5. Considerações Finais

A participação no projeto GymIO foi extremamente importante para o meu desenvolvimento acadêmico e profissional, especialmente na área de backend e integração de sistemas.

A experiência proporcionou um aprofundamento significativo em desenvolvimento de APIs REST, organização de arquitetura backend, manipulação de banco de dados relacionais e integração entre diferentes partes da aplicação.

Além disso, o projeto contribuiu para o desenvolvimento de habilidades importantes como resolução de problemas, organização de código, trabalho em equipe e utilização de ferramentas de versionamento em um ambiente colaborativo.

De forma geral, o aprendizado adquirido durante o desenvolvimento do projeto foi essencial para fortalecer meus conhecimentos práticos e ampliar minha preparação para futuros projetos na área de tecnologia.
