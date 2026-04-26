<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge" alt="Licença" />
</p>

# 🎫 ChamadosSG — Sistema de Gestão de Chamados (Helpdesk)

Sistema fullstack para gerenciamento de chamados técnicos com **API REST**, **painel web interativo** e **controle de acesso por papéis (ADMIN/USER)**. Gerencie setores, categorias, chamados com upload de arquivos, atribuição de responsáveis e encerramento com resolução. Desenvolvido por **Samuel Gomes da Silva**.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white" />
</p>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Stack Tecnológica](#-stack-tecnológica)
- [Modelos de Dados](#-modelos-de-dados)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Fluxos Principais](#-fluxos-principais)
- [Documentação Detalhada](#-documentação-detalhada)
- [Licença](#-licença)
- [Autor](#-autor)

---

## 🎯 Visão Geral

O **ChamadosSG** é um ecossistema completo para gestão de helpdesk, dividido em duas aplicações integradas:

| Aplicação    | Público-Alvo          | Função                                                                                       |
| ------------ | --------------------- | -------------------------------------------------------------------------------------------- |
| **Backend**  | API central           | Gerencia autenticação, RBAC, setores, categorias, chamados com upload e controle de status   |
| **Frontend** | Todos os funcionários | Painel web para abertura de chamados, atribuição, encerramento, gestão de setores e usuários |

### Fluxo de Operação

```
  👤 ADMIN (Web)                       👥 USER (Web)                    🔧 API (Backend)
  ─────────────────────                ─────────────────────            ─────────────────
  Gerencia setores e                   Abre chamados com                Processa todas as
  categorias                           anexos (até 5 arquivos)          operações REST
  Atribui setores a                    Acompanha seus                   Autentica via JWT
  funcionários                         chamados  				        Armazena no PostgreSQL
  Altera roles dos                     Visualiza detalhes e             Faz upload de anexos
  usuários                             histórico completo               via Cloudinary
									   Atende chamados do
									   seu setor
```

---

## 🏗️ Arquitetura do Sistema

```
                    ┌─────────────────────────────┐
                    │     Next.js Frontend         │
                    │   (App Router + SSR/SSG)     │
                    │                             │
                    │  Server Components (pages)  │
                    │  Server Actions (mutations) │
                    │  Client Components (forms)  │
                    └──────────────┬──────────────┘
                                   │ HTTP (Axios)
                                   │ Bearer token
                    ┌──────────────▼──────────────┐
                    │     Express REST API         │
                    │       (Backend)              │
                    │                             │
                    │  routes → middleware →      │
                    │  controller → service →     │
                    │  PrismaClient               │
                    └───────┬─────────────┬───────┘
                            │             │
               ┌────────────▼──┐   ┌──────▼──────────┐
               │  PostgreSQL   │   │   Cloudinary     │
               │  (dados)      │   │   (anexos)       │
               └───────────────┘   └──────────────────┘
```

### Padrão Arquitetural (Backend)

O backend segue o padrão **MVC adaptado** com camadas bem definidas:

```
┌─────────────────────────────────────────────┐
│                  HTTP Request               │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│              routes.ts                      │
│  Centraliza e delega para rotas específicas │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│   validateSchema → isAuthenticated → hasRole│
│  Zod valida input, JWT verifica token,      │
│  RBAC verifica permissão                    │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│              Controller                     │
│  Extrai dados do request (body/query/params)│
│  Chama o Service e retorna a resposta HTTP  │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│               Service                       │
│  Toda a regra de negócio fica aqui          │
│  Validações, cálculos e operações no banco  │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│            PrismaClient                     │
│  Acesso ao banco de dados PostgreSQL        │
│  (via @prisma/adapter-pg)                   │
└─────────────────────────────────────────────┘
```

### Padrão Arquitetural (Frontend)

O frontend segue uma arquitetura baseada em **Server Components + Server Actions** do Next.js App Router:

```
┌─────────────────────────────────────────────────┐
│               Ação do Usuário                   │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Next.js App Router (Server)             │
│  Resolve a rota, aplica route group protegida   │
│  Carrega dados via Server Actions               │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│        Server Component (Página)                │
│  Renderiza layout (Sidebar + Conteúdo)          │
│  Passa dados para Client Components             │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│       Client Components (Interativos)           │
│  Formulários, modais, filtros, toasts           │
│  Chamam Server Actions para mutações            │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│       Server Actions ("use server")             │
│  Chamam API via Axios + interceptor JWT         │
│  Retornam { success, data, error }              │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│           Backend REST (Express)                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Stack Tecnológica

### Backend

| Tecnologia         | Versão | Função                                       |
| ------------------ | ------ | -------------------------------------------- |
| Node.js            | ≥ 18   | Runtime JavaScript                           |
| TypeScript         | 5.4.5  | Tipagem estática                             |
| Express            | 5.2.1  | Framework HTTP                               |
| Prisma             | 7      | ORM com type-safety                          |
| @prisma/adapter-pg | 7      | Adaptador PostgreSQL nativo para Prisma      |
| PostgreSQL         | latest | Banco de dados relacional                    |
| JWT (jsonwebtoken) | 9.0.3  | Autenticação via token                       |
| bcryptjs           | 3.0.3  | Hash de senhas (salt 10)                     |
| Zod                | 4.3.6  | Validação de schemas de request              |
| Multer             | 2.1.1  | Upload de múltiplos arquivos em memória      |
| Cloudinary         | 2.9.0  | Armazenamento de anexos na nuvem             |
| helmet             | 8.1.0  | Headers de segurança HTTP                    |
| express-rate-limit | 8.4.1  | Limite de requisições (100 req/15min por IP) |
| cors               | 2.8.6  | Liberação de origens cruzadas                |
| dotenv             | 17.3.1 | Carregamento de variáveis de ambiente        |
| ts-node-dev        | 2.0.0  | Execução de TypeScript com watch mode        |

### Frontend

| Tecnologia               | Versão | Função                                       |
| ------------------------ | ------ | -------------------------------------------- |
| Next.js                  | 16.2.2 | Framework React com App Router e SSR         |
| React                    | 19.2.4 | Biblioteca de UI                             |
| TypeScript               | ^5     | Tipagem estática                             |
| Tailwind CSS             | v4     | Estilização utility-first                    |
| shadcn/ui                | —      | Componentes UI (Radix + CVA + Tailwind)      |
| radix-ui                 | ^1.4.3 | Primitivos acessíveis (Dialog, Select, etc.) |
| React Hook Form          | 7.72.1 | Gerenciamento performático de formulários    |
| Zod                      | 4.3.6  | Schemas de validação TypeScript-first        |
| Axios                    | 1.15.0 | Cliente HTTP para chamadas à API             |
| jose                     | 6.2.2  | Verificação de tokens JWT server-side        |
| Sonner                   | 2.0.7  | Toast notifications                          |
| next-themes              | 0.4.6  | Suporte a dark/light mode                    |
| class-variance-authority | 0.7.1  | CVA para variantes de componentes            |
| Lucide React             | ^1.7.0 | Ícones SVG como componentes React            |
| Prettier                 | 3.8.1  | Formatador com plugin tailwindcss            |

---

## 🗄️ Modelos de Dados

O banco de dados PostgreSQL contém 5 tabelas gerenciadas pelo Prisma:

```
┌──────────────────────────┐
│          users           │
├──────────────────────────┤
│ id         UUID (PK)     │
│ name       String        │
│ email      String (UQ)   │
│ password   String        │
│ sector_id  UUID (FK?)    │────────────────────┐
│ role       Enum          │                    │
│            ADMIN|USER    │                    │
│ isRoot     Boolean       │                    │
│ created_at DateTime      │                    │
│ updated_at DateTime      │                    │
└──────────────────────────┘                    │
                                                ▼
┌───────────────────────────────────────────────────────┐
│                        sectors                        │
├───────────────────────────────────────────────────────┤
│ id          UUID (PK)                                 │
│ name        String (UQ)                               │
│ description String                                    │
│ status      Enum (ACTIVE|INACTIVE, default ACTIVE)    │
│ created_at  DateTime                                  │
│ updated_at  DateTime                                  │
└────────────────┬────────────────────┬─────────────────┘
                 │                    │
                 ▼                    ▼
┌─────────────────────┐   ┌──────────────────────────────────┐
│      categories     │   │             tickets              │
├─────────────────────┤   ├──────────────────────────────────┤
│ id         UUID(PK) │   │ id            UUID (PK)          │
│ name       String   │   │ ticket_number Int (autoincrement)│
│ priority   Enum     │   │ title         String             │
│  LOW|MEDIUM|HIGH    │   │ description   String             │
│ status     Enum     │   │ resolution    String?            │
│  ACTIVE|INACTIVE    │   │ status        Enum               │
│ sector_id  UUID(FK) │   │  OPEN|IN_PROGRESS|CLOSED         │
│ created_at DateTime │   │ user_id       UUID (FK)          │
│ updated_at DateTime │   │ sector_id     UUID (FK)          │
└─────────────────────┘   │ category_id   UUID (FK)          │
                          │ assigned_to   UUID? (FK)         │
                          │ created_at    DateTime           │
                          │ updated_at    DateTime           │
                          └──────────────┬───────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────────┐
                          │       ticket_attachments         │
                          ├──────────────────────────────────┤
                          │ id         UUID (PK)             │
                          │ url        String                │
                          │ name       String                │
                          │ mime_type  String                │
                          │ size       Int                   │
                          │ public_id  String                │
                          │ ticket_id  UUID (FK)             │
                          │ created_at DateTime              │
                          │ updated_at DateTime              │
                          └──────────────────────────────────┘
```

### Enums

| Enum       | Valores                         | Uso                            |
| ---------- | ------------------------------- | ------------------------------ |
| `Role`     | `ADMIN`, `USER`                 | Papel do usuário no sistema    |
| `Priority` | `LOW`, `MEDIUM`, `HIGH`         | Prioridade da categoria        |
| `Status`   | `OPEN`, `IN_PROGRESS`, `CLOSED` | Estado atual do chamado        |
| `Active`   | `ACTIVE`, `INACTIVE`            | Estado de setores e categorias |

---

## ✨ Funcionalidades

### Autenticação e Usuários

- [x] Cadastro de funcionários (primeiro usuário recebe `ADMIN` automaticamente)
- [x] Login com JWT (validade de 30 dias)
- [x] Consulta do perfil autenticado (`/me`)
- [x] Listagem de todos os funcionários (ADMIN)
- [x] Vinculação de setor ao funcionário (ADMIN)
- [x] Alteração de papel (`ADMIN` ↔ `USER`) com proteção ao `isRoot`

### Setores

- [x] Criação de setores com nome e descrição (ADMIN)
- [x] Listagem de setores (com filtro por status)
- [x] Ativação e inativação de setores
- [x] Proteção contra exclusão de setores com chamados vinculados

### Categorias

- [x] Criação de categorias por setor com prioridade (ADMIN)
- [x] Listagem de categorias (com filtro por setor e status)
- [x] Ativação e inativação de categorias

### Chamados

- [x] Abertura de chamados com título, descrição, setor e categoria
- [x] Upload de até 5 anexos (JPEG, PNG, JPG, WEBP, MP4, MPEG, PDF, DOC, DOCX — máx. 5MB cada)
- [x] Listagem paginada de chamados do setor (Dashboard)
- [x] Listagem dos chamados abertos pelo usuário autenticado
- [x] Atribuição de chamado a um responsável
- [x] Encerramento de chamado com texto de resolução (mín. 10 chars)
- [x] Numeração automática e sequencial de chamados (`ticket_number`)

---

## 📁 Estrutura do Monorepo

```
chamados-1/
├── backend/                        # API REST (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma           # Modelos de dados (5 tabelas)
│   │   └── migrations/             # Histórico de migrations
│   └── src/
│       ├── server.ts               # Entry point + middlewares globais
│       ├── routes.ts               # Centraliza todas as rotas
│       ├── controllers/            # Extração de dados e resposta HTTP
│       │   ├── user/
│       │   ├── sector/
│       │   ├── category/
│       │   └── ticket/
│       ├── services/               # Regras de negócio
│       │   ├── user/
│       │   ├── sector/
│       │   ├── category/
│       │   └── ticket/
│       ├── routes/                 # Rotas por domínio com middlewares
│       │   ├── user/
│       │   ├── sector/
│       │   ├── category/
│       │   └── ticket/
│       ├── schema/                 # Schemas Zod por domínio
│       ├── middlewares/            # isAuthenticated, hasRole, validateSchema, loadUserSector
│       ├── config/                 # Configurações (Prisma, JWT, Multer, Cloudinary)
│       ├── errors/
│       │   └── AppError.ts         # Classe de erro customizado
│       └── @types/                 # Extensões de tipos (Express, JWT, etc.)
│
├── web/                            # Frontend (Next.js 16 App Router)
│   ├── app/
│   │   ├── globals.css             # Tailwind v4 + variáveis CSS + shadcn tokens
│   │   ├── layout.tsx              # Layout raiz: fontes, Toaster, lang="pt-BR"
│   │   ├── login/
│   │   │   └── page.tsx            # Página pública: SignIn + SignUp
│   │   └── (authenticated)/        # Route group protegida
│   │       ├── layout.tsx          # getUserLocal + UserProvider + AppSidebar
│   │       ├── dashboard/          # Chamados paginados do setor
│   │       ├── tickets/            # Chamados do usuário + abertura
│   │       ├── sectors/            # Listagem e criação de setores
│   │       └── users/              # Gestão de funcionários (ADMIN)
│   └── src/
│       ├── actions/                # Server Actions ("use server") por domínio
│       ├── components/             # Client Components organizados por domínio
│       ├── schemas/                # Schemas Zod para formulários
│       ├── @types/                 # Interfaces TypeScript globais
│       ├── contexts/
│       │   └── userContext.tsx     # UserProvider + useUser() hook
│       └── lib/
│           ├── api.ts              # Instância Axios com interceptors
│           ├── auth.ts             # Helpers: isAuthenticated, getUserLocal
│           └── token.ts            # Helpers: getToken, saveToken, destroyToken
│
└── documentation/                  # Documentação técnica detalhada
    ├── backend/
    │   ├── CONTEXTO.md             # Referência técnica completa do backend
    │   └── ENDPOINTS.md            # Todos os endpoints com exemplos
    └── frontend/
        ├── CONTEXTO.md             # Referência técnica completa do frontend
        └── ROTAS.md                # Rotas do App Router + Server Actions
```

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** `>= 18.0.0`
- **npm** ou **yarn**
- **PostgreSQL** rodando localmente ou em um serviço gerenciado
- **Conta Cloudinary** para upload de anexos

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/samuelgomes0309/Chamados.git
cd Chamados
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend/`:

```env
PORT=3333
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chamados"
JWT_SECRET="sua_chave_secreta_jwt_aqui"
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

Execute as migrations e gere o Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 3. Configure o Frontend

```bash
cd ../web
npm install
```

Crie o arquivo `.env.local` na pasta `web/`:

```env
NEXT_KEY_API_URL="http://localhost:3333"
JWT_SECRET="sua_chave_secreta_jwt_aqui"
```

> **Importante:** `JWT_SECRET` deve ser **idêntico** ao valor definido no backend. O frontend usa esse segredo para verificar o token JWT no middleware de autenticação (`proxy.ts`).

---

## ▶️ Executando o Projeto

### Backend

```bash
cd backend
npm run dev
```

> Servidor disponível em `http://localhost:3333`

### Frontend

```bash
cd web
npm run dev
```

> Aplicação disponível em `http://localhost:3000`

---

## 📡 Endpoints da API

> **Base URL:** `http://localhost:3333`
> **Autenticação:** `Authorization: Bearer <token>`

A coluna **Frontend** indica se o endpoint já possui uma Server Action implementada no frontend.

| Método  | Rota                                      | Auth | Role  | Frontend | Descrição                                  |
| ------- | ----------------------------------------- | ---- | ----- | :------: | ------------------------------------------ |
| `POST`  | `/users`                                  | ❌   | —     |    ✅    | Cadastra novo funcionário                  |
| `POST`  | `/sessions`                               | ❌   | —     |    ✅    | Autentica e retorna token JWT              |
| `GET`   | `/me`                                     | ✅   | Todos |    ✅    | Retorna dados do usuário autenticado       |
| `GET`   | `/users`                                  | ✅   | ADMIN |    ✅    | Lista todos os funcionários                |
| `PUT`   | `/users/sector`                           | ✅   | ADMIN |    ✅    | Vincula setor a um funcionário             |
| `PATCH` | `/users/:user_id/role/:role`              | ✅   | ADMIN |    ⏳    | Altera papel do usuário                    |
| `POST`  | `/sectors`                                | ✅   | ADMIN |    ✅    | Cria novo setor                            |
| `GET`   | `/sectors`                                | ✅   | Todos |    ✅    | Lista setores (filtro por status)          |
| `PATCH` | `/sectors/:sector_id/status/:status`      | ✅   | ADMIN |    ⏳    | Ativa ou inativa setor                     |
| `POST`  | `/categories`                             | ✅   | ADMIN |    ✅    | Cria categoria em um setor                 |
| `GET`   | `/categories`                             | ✅   | Todos |    ✅    | Lista categorias (filtro por setor/status) |
| `PATCH` | `/categories/:category_id/status/:status` | ✅   | ADMIN |    ⏳    | Ativa ou inativa categoria                 |
| `POST`  | `/tickets`                                | ✅   | Todos |    ✅    | Abre chamado com upload de anexos          |
| `GET`   | `/tickets`                                | ✅   | Todos |    ✅    | Lista chamados paginados do setor          |
| `GET`   | `/tickets/user`                           | ✅   | Todos |    ✅    | Lista chamados do usuário autenticado      |
| `PUT`   | `/tickets/assign/:ticket_id`              | ✅   | Todos |    ✅    | Atribui chamado a si mesmo                 |
| `PUT`   | `/tickets/close/:ticket_id`               | ✅   | Todos |    ✅    | Encerra chamado com resolução              |

> **Legenda:** ✅ Implementado no frontend — ⏳ Disponível no backend, pendente de implementação no frontend

> Documentação detalhada: [`documentation/backend/ENDPOINTS.md`](documentation/backend/ENDPOINTS.md)

---

## 🔐 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável                | Obrigatória | Descrição                                        |
| ----------------------- | ----------- | ------------------------------------------------ |
| `PORT`                  | ✅          | Porta em que o servidor vai escutar (ex: `3333`) |
| `DATABASE_URL`          | ✅          | String de conexão PostgreSQL                     |
| `JWT_SECRET`            | ✅          | Chave secreta para assinatura dos tokens         |
| `CLOUDINARY_CLOUD_NAME` | ✅          | Nome do cloud no Cloudinary                      |
| `CLOUDINARY_API_KEY`    | ✅          | Chave de API do Cloudinary                       |
| `CLOUDINARY_API_SECRET` | ✅          | Secret de API do Cloudinary                      |

### Frontend (`web/.env.local`)

| Variável           | Obrigatória | Descrição                                                                       |
| ------------------ | ----------- | ------------------------------------------------------------------------------- |
| `NEXT_KEY_API_URL` | ✅          | URL base da API (server-side only, sem `NEXT_PUBLIC_`)                          |
| `JWT_SECRET`       | ✅          | Chave secreta JWT para verificação de token no middleware (`proxy.ts` + `jose`) |

---

## 🔄 Fluxos Principais

### Cadastro e Login

```
1. Usuário acessa /login → formulário de cadastro (SignUp)
2. createUserAction → POST /users (primeiro usuário vira ADMIN automaticamente)
3. Usuário faz login (SignIn)
4. loginAction → POST /sessions → retorna { user, token }
5. saveToken(token) → cookie "@tickets_token" (httpOnly, 30 dias)
6. saveUserLocal(user) → cookie "@tickets_user" (30 dias)
7. redirect("/dashboard")
```

### Abertura de Chamado

```
1. Usuário clica em "Novo chamado" na página /tickets
2. TicketModal: seleciona Setor → filtra Categorias dinamicamente
3. Preenche título, descrição e anexa arquivos (máx. 5 × 5MB)
4. createTicketAction → POST /tickets (FormData com arquivos)
5. Backend: Multer (memória) → Cloudinary (upload paralelo) → PostgreSQL
6. Frontend: toast.success + atualiza lista local sem reload
```

### Atribuição e Encerramento

```
1. Dashboard exibe chamados paginados do setor do usuário
2. Chamado OPEN sem responsável: botão "Assumir chamado"
   → assignTicketAction → PUT /tickets/assign/:id
3. Chamado atribuído ao usuário logado: formulário "Encerrar"
   → resolution (mín. 10 chars) → closeTicketAction → PUT /tickets/close/:id
4. Status muda para CLOSED e badge atualiza no card
```

### Gestão de Setores e Categorias (ADMIN)

```
1. ADMIN acessa /sectors
2. Cria setor → POST /sectors (nome normalizado em UPPER no backend)
3. Setor criado aparece com status ACTIVE
4. ADMIN pode ativar/inativar setores e categorias via PATCH
5. Setor só pode ser inativado se não tiver chamados vinculados
```

---

## 📚 Documentação Detalhada

| Documento                                                                  | Conteúdo                                                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`documentation/backend/CONTEXTO.md`](documentation/backend/CONTEXTO.md)   | Arquitetura, modelos de dados, regras de negócio, middlewares, upload, segurança HTTP, convenções |
| [`documentation/backend/ENDPOINTS.md`](documentation/backend/ENDPOINTS.md) | Todos os endpoints com exemplos de request/response, erros e validações                           |
| [`documentation/frontend/CONTEXTO.md`](documentation/frontend/CONTEXTO.md) | Arquitetura Next.js, sistema de auth, RBAC, sistema de design, variáveis CSS, convenções          |
| [`documentation/frontend/ROTAS.md`](documentation/frontend/ROTAS.md)       | Rotas do App Router + todas as Server Actions com inputs, outputs e endpoints chamados            |

---

## 📜 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

---

## 👨‍💻 Autor

**Samuel Gomes da Silva**

- GitHub: [@samuelgomes0309](https://github.com/samuelgomes0309)
- Repositório: [github.com/samuelgomes0309/Chamados](https://github.com/samuelgomes0309/Chamados)
