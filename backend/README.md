# 🎫 Chamados — Backend

API REST para gestão de chamados técnicos (helpdesk), com controle de setores, categorias, usuários, abertura e atendimento de chamados com suporte a anexos.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=flat&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?style=flat&logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.3.6-3068B7?style=flat&logo=zod&logoColor=white)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Rotas](#-rotas)
- [Serviços e Arquitetura](#-serviços-e-arquitetura)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Documentação](#-documentação)

---

## 🎯 Sobre o Projeto

O **Chamados Backend** é uma API REST para gestão completa de chamados técnicos (helpdesk). O sistema cobre desde o cadastro e autenticação de funcionários até a abertura, atribuição e encerramento de chamados com suporte a múltiplos anexos (imagens e documentos). Organiza os chamados por setores e categorias com controle de prioridade.

### Características principais

- ✅ Arquitetura em camadas — Controller → Service → Prisma
- ✅ Autenticação JWT com middleware de proteção de rotas
- ✅ Sistema RBAC com dois papéis: ADMIN e USER
- ✅ Primeiro usuário cadastrado vira ADMIN automaticamente (root)
- ✅ Hashing seguro de senhas com bcryptjs (salt 10)
- ✅ Validação de requests com Zod (body, params e query)
- ✅ Upload de múltiplos anexos (imagens + PDFs + DOCX) via Multer + Cloudinary
- ✅ Fluxo completo de chamados: OPEN → IN_PROGRESS → CLOSED
- ✅ Paginação e filtros na listagem de chamados
- ✅ Tratamento global de erros centralizado no `server.ts`
- ✅ Segurança HTTP via helmet + rate limiting (100 req/15min)
- ✅ Prisma com adaptador nativo PostgreSQL (`@prisma/adapter-pg`)

---

## 🚀 Tecnologias

| Categoria           | Tecnologia         | Versão | Descrição                                  |
| ------------------- | ------------------ | ------ | ------------------------------------------ |
| **Core**            | Node.js            | 18+    | Ambiente de execução JavaScript            |
| **Linguagem**       | TypeScript         | 5.4.5  | Superset JavaScript com tipagem estática   |
| **Framework**       | Express            | 5.2.1  | Framework web minimalista e flexível       |
| **ORM**             | Prisma             | 7      | ORM moderno com migrations e client tipado |
| **Banco**           | PostgreSQL         | latest | Banco de dados relacional                  |
| **Auth**            | jsonwebtoken       | 9.0.3  | Geração e verificação de tokens JWT        |
| **Segurança**       | bcryptjs           | 3.0.3  | Hashing seguro de senhas (salt 10)         |
| **Validação**       | Zod                | 4.3.6  | Validação de schemas de request            |
| **Upload**          | Multer             | 2.1.1  | Upload de múltiplos arquivos em memória    |
| **Cloud Storage**   | Cloudinary         | 2.9.0  | Armazenamento de anexos na nuvem           |
| **HTTP Security**   | helmet             | 8.1.0  | Headers de segurança HTTP                  |
| **Rate Limit**      | express-rate-limit | 8.4.1  | Limite de requisições por IP               |
| **Utilitários**     | cors               | 2.8.6  | Liberação de Cross-Origin Resource Sharing |
| **Utilitários**     | dotenv             | 17.3.1 | Carregamento de variáveis de ambiente      |
| **Utilitários**     | console-log-colors | 0.5.0  | Colorização de logs no terminal            |
| **Desenvolvimento** | ts-node-dev        | 2.0.0  | Execução de TypeScript com watch mode      |

---

## ⚙️ Funcionalidades

### 🔐 Autenticação & Autorização

- Registro de novos funcionários com senha hasheada via bcryptjs
- Primeiro usuário cadastrado recebe automaticamente papel ADMIN (root)
- Login com email e senha retornando token JWT (validade: 30 dias)
- Middleware `isAuthenticated` protegendo todas as rotas privadas
- Middleware `hasRole` restringindo ações administrativas
- Middleware `loadUserSector` validando vínculo com setor nas rotas de chamados
- Token enviado no header `Authorization: Bearer <token>`
- Payload do token inclui `sector_id` para validação sem query ao banco

### 👤 Usuários

- Cadastro com validação de email único e hash de senha
- Login retornando token JWT com dados do usuário e setor
- Consulta dos dados do usuário autenticado (`/me`)
- Vínculo de setor a usuário (ADMIN only, setor deve estar ativo)
- Listagem de todos os usuários (ADMIN only)
- Alteração de papel (ADMIN can promote/demote outros usuários)

### 🏢 Setores

- CRUD completo de setores (nome + descrição)
- Nome normalizado em UPPER e único no sistema
- Status `ACTIVE` / `INACTIVE` com toggle
- Ao inativar setor: todas as categorias vinculadas também são inativadas (transação)
- Proteção contra inativação com chamados `OPEN` ou `IN_PROGRESS`
- Proteção contra exclusão quando existem chamados vinculados
- Listagem por status incluindo categorias do setor

### 📂 Categorias

- CRUD completo de categorias por setor (nome + prioridade)
- Nome normalizado em UPPER e único por setor
- Prioridades: `LOW`, `MEDIUM`, `HIGH`
- Status `ACTIVE` / `INACTIVE` com toggle individual
- Setor referenciado deve estar ativo na criação
- Proteção contra exclusão quando existem chamados vinculados

### 🎫 Chamados

- Abertura por qualquer usuário autenticado
- Suporte a múltiplos anexos: JPEG, PNG, PDF, DOCX (max 5MB/arquivo)
- Upload paralelo para Cloudinary via stream em memória
- **Fluxo:** `OPEN` → `IN_PROGRESS` → `CLOSED`
- Atribuição: usuário do mesmo setor, que não seja quem abriu
- Encerramento: apenas o responsável atribuído, com `resolution` obrigatória
- Listagem com paginação (`page`, `limit`) e filtros (`status`, `sector_id`)
- `ADMIN` pode listar todos os setores; `USER` vê apenas seu setor
- Apenas `ADMIN` pode filtrar chamados por status `CLOSED`
- Exceção: o próprio usuário pode visualizar chamados `CLOSED` que ele abriu
- Consulta individual: acesso liberado para quem é do setor ou quem abriu

---

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma                          # Modelos: User, Sector, Category, Ticket, TicketAttachment
│   └── migrations/                            # Histórico de migrations SQL
│
├── src/
│   ├── server.ts                              # Ponto de entrada, helmet, rate limit, CORS e middleware global de erros
│   ├── routes.ts                              # Centralização de todas as rotas
│   │
│   ├── @types/
│   │   ├── express/
│   │   │   └── express.d.ts                   # Extensão do Request: user_id, role, user_sector_id
│   │   ├── jwt/
│   │   │   └── jwt.d.ts                       # Interface TokenPayload: sub, role, sector_id
│   │   ├── user/
│   │   │   └── user.d.ts                      # Interfaces de request do módulo usuário
│   │   ├── sector/
│   │   │   └── sector.d.ts                    # Interfaces de request do módulo setor
│   │   ├── category/
│   │   │   └── category.d.ts                  # Interfaces de request do módulo categoria
│   │   └── ticket/
│   │       └── ticket.d.ts                    # Interfaces de request do módulo chamado
│   │
│   ├── config/
│   │   ├── cloudinary/
│   │   │   └── index.ts                       # Configuração do Cloudinary (cloud storage)
│   │   ├── jwt/
│   │   │   └── index.ts                       # generateToken e validateToken
│   │   ├── multer/
│   │   │   └── index.ts                       # Configuração do Multer (upload em memória, 5MB)
│   │   └── prisma/
│   │       └── client.ts                      # Instância global do PrismaClient (com adapter-pg)
│   │
│   ├── errors/
│   │   └── AppError.ts                        # Classe de erro customizado com statusCode
│   │
│   ├── loggers/
│   │   └── logger.ts                          # Logger colorido para mensagem de inicialização
│   │
│   ├── middlewares/
│   │   ├── isAuthenticated.ts                 # Validação do token JWT + injeção de user_id/role/sector_id
│   │   ├── hasRole.ts                         # Verificação de papel (ADMIN/USER)
│   │   ├── loadUserSector.ts                  # Validação de setor vinculado ao usuário
│   │   └── validateSchema.ts                  # Validação de request via Zod (body/params/query)
│   │
│   ├── schema/                                # Schemas de validação Zod por módulo
│   │   ├── user/
│   │   │   └── index.ts                       # createUser, login, assignSector, updateRole
│   │   ├── sector/
│   │   │   └── index.ts                       # create, list, detail, update, delete, toggleStatus
│   │   ├── category/
│   │   │   └── index.ts                       # create, list, detail, update, delete, toggleStatus
│   │   └── ticket/
│   │       └── index.ts                       # create, assign, close, detail, list
│   │
│   ├── routes/                                # Definição de rotas por módulo
│   │   ├── user/
│   │   │   └── index.ts                       # Rotas de usuário
│   │   ├── sector/
│   │   │   └── index.ts                       # Rotas de setor
│   │   ├── category/
│   │   │   └── index.ts                       # Rotas de categoria
│   │   └── ticket/
│   │       └── index.ts                       # Rotas de chamado
│   │
│   ├── controllers/                           # Camada de entrada HTTP (uma classe por módulo)
│   │   ├── user/
│   │   │   └── UserController.ts              # create, login, detail, assignSector, list, updateRole
│   │   ├── sector/
│   │   │   └── SectorController.ts            # create, list, detail, update, delete, toggleStatus
│   │   ├── category/
│   │   │   └── CategoryController.ts          # create, list, detail, update, delete, toggleStatus
│   │   └── ticket/
│   │       └── TicketController.ts            # create, assign, close, detail, list, listByUser
│   │
│   ├── services/                              # Camada de regras de negócio (uma classe por caso de uso)
│   │   ├── user/
│   │   │   ├── CreateUserService.ts
│   │   │   ├── AuthUserService.ts
│   │   │   ├── DetailUserService.ts
│   │   │   ├── AssignedSectorUserService.ts
│   │   │   ├── ListUserService.ts
│   │   │   └── UpdateUserRoleService.ts
│   │   ├── sector/
│   │   │   ├── CreateSectorService.ts
│   │   │   ├── ListSectorService.ts
│   │   │   ├── DetailSectorService.ts
│   │   │   ├── UpdateSectorService.ts
│   │   │   ├── DeleteSectorService.ts
│   │   │   └── ToggleStatusService.ts
│   │   ├── category/
│   │   │   ├── CreateCategoryService.ts
│   │   │   ├── ListCategoryService.ts
│   │   │   ├── DetailCategoryService.ts
│   │   │   ├── UpdateCategoryService.ts
│   │   │   ├── DeleteCategoryService.ts
│   │   │   └── ToggleStatusService.ts
│   │   └── ticket/
│   │       ├── CreateTicketService.ts
│   │       ├── AssignedTicketService.ts
│   │       ├── CloseTicketService.ts
│   │       ├── DetailTicketService.ts
│   │       ├── ListTicketService.ts
│   │       └── ListTicketByUserService.ts
│   │
│   └── generated/
│       └── prisma/                            # Client gerado automaticamente pelo Prisma
│
├── .env                                       # Variáveis de ambiente (git ignored)
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **PostgreSQL** rodando localmente ou em nuvem
- **Conta Cloudinary** para upload de anexos

---

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/samuelgomes0309/Chamados.git

# Acesse a pasta do backend
cd backend

# Instale as dependências
yarn install
# ou
npm install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz da pasta `backend/` com as seguintes variáveis:

```env
# String de conexão com o banco PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Chave secreta para assinar tokens JWT
JWT_SECRET="sua-chave-secreta-aqui"

# Porta do servidor
PORT=3333

# Cloudinary (upload de anexos dos chamados)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="sua-api-secret"
```

---

## 💻 Execução

```bash
# Aplica as migrations e cria as tabelas no banco
npx prisma migrate dev

# Gera o Prisma Client
npx prisma generate

# Inicia o servidor de desenvolvimento com watch mode
yarn dev
# ou
npm run dev
```

O servidor ficará disponível em **http://localhost:3333**.

---

## 🗺️ Rotas

### Usuários

| Rota                         | Método  | Protegida | Permissão | Controller                    | Descrição                            |
| ---------------------------- | ------- | --------- | --------- | ----------------------------- | ------------------------------------ |
| `/users`                     | `POST`  | ❌        | Pública   | `UserController.create`       | Cria um novo funcionário             |
| `/sessions`                  | `POST`  | ❌        | Pública   | `UserController.login`        | Autentica e retorna token JWT        |
| `/me`                        | `GET`   | ✅        | Todos     | `UserController.detail`       | Retorna dados do usuário autenticado |
| `/users/sector`              | `PUT`   | ✅        | ADMIN     | `UserController.assignSector` | Vincula setor a um usuário           |
| `/users`                     | `GET`   | ✅        | ADMIN     | `UserController.list`         | Lista todos os usuários              |
| `/users/:user_id/role/:role` | `PATCH` | ✅        | ADMIN     | `UserController.updateRole`   | Altera papel de um usuário           |

### Setores

| Rota                                 | Método   | Protegida | Permissão | Controller                      | Descrição                    |
| ------------------------------------ | -------- | --------- | --------- | ------------------------------- | ---------------------------- |
| `/sectors`                           | `POST`   | ✅        | ADMIN     | `SectorController.create`       | Cria novo setor              |
| `/sectors`                           | `GET`    | ✅        | Todos     | `SectorController.list`         | Lista setores por status     |
| `/sectors/:sector_id`                | `GET`    | ✅        | Todos     | `SectorController.detail`       | Retorna detalhes de um setor |
| `/sectors/:sector_id`                | `PUT`    | ✅        | ADMIN     | `SectorController.update`       | Atualiza um setor            |
| `/sectors/:sector_id`                | `DELETE` | ✅        | ADMIN     | `SectorController.delete`       | Remove um setor              |
| `/sectors/:sector_id/status/:status` | `PATCH`  | ✅        | ADMIN     | `SectorController.toggleStatus` | Ativa ou inativa um setor    |

### Categorias

| Rota                                      | Método   | Protegida | Permissão | Controller                        | Descrição                           |
| ----------------------------------------- | -------- | --------- | --------- | --------------------------------- | ----------------------------------- |
| `/categories`                             | `POST`   | ✅        | ADMIN     | `CategoryController.create`       | Cria nova categoria                 |
| `/categories`                             | `GET`    | ✅        | Todos     | `CategoryController.list`         | Lista categorias por status e setor |
| `/categories/:category_id`                | `GET`    | ✅        | Todos     | `CategoryController.detail`       | Retorna detalhes de uma categoria   |
| `/categories/:category_id`                | `PUT`    | ✅        | ADMIN     | `CategoryController.update`       | Atualiza uma categoria              |
| `/categories/:category_id`                | `DELETE` | ✅        | ADMIN     | `CategoryController.delete`       | Remove uma categoria                |
| `/categories/:category_id/status/:status` | `PATCH`  | ✅        | ADMIN     | `CategoryController.toggleStatus` | Ativa ou inativa uma categoria      |

### Chamados

| Rota                         | Método | Protegida | Permissão             | Controller                    | Descrição                              |
| ---------------------------- | ------ | --------- | --------------------- | ----------------------------- | -------------------------------------- |
| `/tickets`                   | `POST` | ✅        | Todos                 | `TicketController.create`     | Abre chamado (com anexos opcionais)    |
| `/tickets/me`                | `GET`  | ✅        | Todos                 | `TicketController.listByUser` | Lista chamados abertos pelo usuário    |
| `/tickets/:ticket_id`        | `GET`  | ✅        | Setor/Autor           | `TicketController.detail`     | Retorna detalhes do chamado com anexos |
| `/tickets`                   | `GET`  | ✅        | Todos (com setor)     | `TicketController.list`       | Lista chamados com paginação e filtros |
| `/tickets/assign/:ticket_id` | `PUT`  | ✅        | Mesmo setor           | `TicketController.assign`     | Atribui chamado ao usuário autenticado |
| `/tickets/close/:ticket_id`  | `PUT`  | ✅        | Responsável atribuído | `TicketController.close`      | Encerra chamado com resolução          |

---

## 🏗️ Serviços e Arquitetura

O fluxo de uma requisição segue sempre o padrão:

```
Request → Router → [validateSchema?] → [isAuthenticated?] → [hasRole?] → [loadUserSector?] → Controller → Service → Prisma (DB)
```

### Services de Usuário

| Service                     | Método    | Endpoint                      | Descrição                                              |
| --------------------------- | --------- | ----------------------------- | ------------------------------------------------------ |
| `CreateUserService`         | `execute` | `POST /users`                 | Valida email único, hasheia senha, define root e role  |
| `AuthUserService`           | `execute` | `POST /sessions`              | Valida credenciais e assina token JWT de 30 dias       |
| `DetailUserService`         | `execute` | `GET /me`                     | Busca dados do usuário (id, name, email, role, sector) |
| `AssignedSectorUserService` | `execute` | `PUT /users/sector`           | Valida setor ativo e vincula ao usuário                |
| `ListUserService`           | `execute` | `GET /users`                  | Lista todos os usuários (sem senha)                    |
| `UpdateUserRoleService`     | `execute` | `PATCH /users/:id/role/:role` | Valida e atualiza papel do usuário                     |

### Services de Setor

| Service               | Método    | Endpoint                            | Descrição                                                             |
| --------------------- | --------- | ----------------------------------- | --------------------------------------------------------------------- |
| `CreateSectorService` | `execute` | `POST /sectors`                     | Normaliza nome, trata P2002 para duplicatas                           |
| `ListSectorService`   | `execute` | `GET /sectors`                      | Lista setores por status com categorias vinculadas                    |
| `DetailSectorService` | `execute` | `GET /sectors/:id`                  | Retorna detalhes de um setor específico                               |
| `UpdateSectorService` | `execute` | `PUT /sectors/:id`                  | Valida existência e diferença antes de atualizar                      |
| `DeleteSectorService` | `execute` | `DELETE /sectors/:id`               | Bloqueia se houver chamados vinculados                                |
| `ToggleStatusService` | `execute` | `PATCH /sectors/:id/status/:status` | Atualiza setor + categorias em transação, bloqueia se tickets abertos |

### Services de Categoria

| Service                 | Método    | Endpoint                               | Descrição                                       |
| ----------------------- | --------- | -------------------------------------- | ----------------------------------------------- |
| `CreateCategoryService` | `execute` | `POST /categories`                     | Valida setor ativo e nome único por setor       |
| `ListCategoryService`   | `execute` | `GET /categories`                      | Lista por status e setor, inclui dados do setor |
| `DetailCategoryService` | `execute` | `GET /categories/:id`                  | Retorna detalhes de uma categoria               |
| `UpdateCategoryService` | `execute` | `PUT /categories/:id`                  | Valida nome único no setor antes de atualizar   |
| `DeleteCategoryService` | `execute` | `DELETE /categories/:id`               | Bloqueia se houver chamados vinculados          |
| `ToggleStatusService`   | `execute` | `PATCH /categories/:id/status/:status` | Alterna status da categoria                     |

### Services de Chamado

| Service                   | Método    | Endpoint                  | Descrição                                                          |
| ------------------------- | --------- | ------------------------- | ------------------------------------------------------------------ |
| `CreateTicketService`     | `execute` | `POST /tickets`           | Valida usuário e categoria, cria ticket, upload paralelo de anexos |
| `AssignedTicketService`   | `execute` | `PUT /tickets/assign/:id` | Valida regras de atribuição, status → IN_PROGRESS                  |
| `CloseTicketService`      | `execute` | `PUT /tickets/close/:id`  | Valida autorização, status → CLOSED, registra resolution           |
| `DetailTicketService`     | `execute` | `GET /tickets/:id`        | Retorna ticket com anexos, valida acesso por setor/autoria         |
| `ListTicketService`       | `execute` | `GET /tickets`            | Paginação, filtros por setor/status, regras por role               |
| `ListTicketByUserService` | `execute` | `GET /tickets/me`         | Lista chamados abertos pelo usuário, ordenados por ticket_number   |

---

## 📜 Scripts Disponíveis

```bash
# Inicia o servidor com watch mode (ts-node-dev)
yarn dev

# Aplica migrations no banco de dados
npx prisma migrate dev

# Gera o Prisma Client após alterações no schema
npx prisma generate

# Abre o Prisma Studio (interface visual do banco)
npx prisma studio

# Reseta o banco e reaplica todas as migrations
npx prisma migrate reset
```

---

## 📚 Documentação

A documentação técnica completa está disponível na pasta `documentation/backend/`:

| Arquivo        | Descrição                                                       |
| -------------- | --------------------------------------------------------------- |
| `CONTEXTO.md`  | Arquitetura, modelagem de dados, regras de negócio e convenções |
| `ENDPOINTS.md` | Documentação completa de todos os endpoints com exemplos        |
