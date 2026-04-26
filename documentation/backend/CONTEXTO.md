# 📖 CONTEXTO TÉCNICO — Chamados API

Documento de referência técnica do backend do sistema de gestão de chamados (helpdesk). Descreve a arquitetura, modelagem de dados, regras de negócio, fluxos e convenções do projeto.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Modelagem de Dados](#-modelagem-de-dados)
- [Regras de Negócio](#-regras-de-negócio)
- [Sistema de Autenticação](#-sistema-de-autenticação)
- [Sistema de Autorização (RBAC)](#-sistema-de-autorização-rbac)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Convenções e Padrões](#-convenções-e-padrões)

---

## 🎯 Visão Geral

O **Chamados Backend** é uma API REST para gestão de chamados técnicos (helpdesk). O sistema cobre desde o cadastro e autenticação de funcionários até a abertura, atribuição e encerramento de chamados com suporte a anexos (imagens e documentos). Implementa controle de acesso baseado em papéis (RBAC) com dois níveis: **ADMIN** e **USER**.

### Domínios da aplicação

| Domínio        | Responsabilidade                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Usuários**   | Cadastro, autenticação, consulta de perfil, vínculo com setor e gerenciamento de papéis (roles) |
| **Setores**    | CRUD de setores/departamentos com controle de status (ACTIVE/INACTIVE) e proteção por chamados  |
| **Categorias** | CRUD de categorias de chamados por setor com prioridade e controle de status                    |
| **Chamados**   | Abertura, atribuição, encerramento e listagem de chamados com suporte a anexos via Cloudinary   |

---

## 🚀 Stack Tecnológica

| Camada         | Tecnologia         | Versão | Papel                                               |
| -------------- | ------------------ | ------ | --------------------------------------------------- |
| Runtime        | Node.js            | 18+    | Ambiente de execução                                |
| Linguagem      | TypeScript         | 5.4.5  | Tipagem estática e segurança em desenvolvimento     |
| Framework HTTP | Express            | 5.2.1  | Roteamento e middlewares                            |
| ORM            | Prisma             | 7      | Acesso ao banco, migrations e client tipado         |
| DB Adapter     | @prisma/adapter-pg | 7      | Adaptador PostgreSQL nativo para Prisma             |
| Banco de Dados | PostgreSQL         | latest | Persistência relacional                             |
| Autenticação   | jsonwebtoken       | 9.0.3  | Geração e verificação de tokens JWT                 |
| Hash de senhas | bcryptjs           | 3.0.3  | Criptografia segura de senhas (salt 10)             |
| Validação      | Zod                | 4.3.6  | Validação de schemas de request (body/params/query) |
| Upload         | Multer             | 2.1.1  | Upload de múltiplos arquivos em memória             |
| Cloud Storage  | Cloudinary         | 2.9.0  | Armazenamento de anexos dos chamados na nuvem       |
| CORS           | cors               | 2.8.6  | Liberação de origens cruzadas                       |
| Segurança HTTP | helmet             | 8.1.0  | Headers de segurança HTTP                           |
| Rate Limit     | express-rate-limit | 8.4.1  | Limite de requisições por IP (100 req/15min)        |
| Env vars       | dotenv             | 17.3.1 | Carregamento do arquivo `.env`                      |
| Console        | console-log-colors | 0.5.0  | Colorização de logs no terminal                     |
| Dev Runner     | ts-node-dev        | 2.0.0  | Execução de TypeScript com watch mode               |

---

## 🏗️ Arquitetura

### Padrão de Camadas

O projeto segue uma arquitetura em camadas bem definida:

```
┌─────────────────────────────────────────────────────┐
│                     HTTP Request                    │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   routes.ts                         │
│  Centraliza e delega para rotas específicas         │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            Rotas específicas (routes/domínio)        │
│  Aplica middlewares: isAuthenticated, hasRole,       │
│  loadUserSector, validateSchema + multer (upload)    │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   Controller                        │
│  Extrai dados do request (body/query/params/file)   │
│  Chama o Service e retorna a resposta HTTP          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                    Service                          │
│  Toda a regra de negócio fica aqui                  │
│  Validações, cálculos e operações no banco          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                 PrismaClient                        │
│  Acesso ao banco de dados PostgreSQL                │
│  (via @prisma/adapter-pg)                           │
└─────────────────────────────────────────────────────┘
```

### Fluxo de Middlewares nas Rotas

```
Request → validateSchema (Zod) → isAuthenticated (JWT) → hasRole (Role) → loadUserSector → Controller → Service → DB
```

Nem todas as rotas aplicam todos os middlewares. A composição varia:

| Tipo de rota                                           | Middlewares aplicados                                          |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Rotas públicas (POST /users, POST /sessions)           | `validateSchema`                                               |
| Rotas autenticadas (GET /me, GET /sectors)             | `isAuthenticated`                                              |
| Rotas admin (POST /sectors, DELETE /categories)        | `isAuthenticated` → `hasRole("ADMIN")` → `validateSchema`      |
| Rotas de chamados com setor (GET /tickets, PUT assign) | `isAuthenticated` → `loadUserSector` → `validateSchema`        |
| Rota de criação de chamado com upload                  | `isAuthenticated` → `upload.array("files")` → `validateSchema` |

### Validação de Requests com Zod

Todas as rotas que recebem dados (body, params ou query) são validadas via middleware `validateSchema` usando schemas Zod. Os schemas estão centralizados em `src/schema/{domínio}/index.ts` e validam a estrutura completa do request:

```typescript
// Exemplo de schema
const createSectorSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		description: z.string().min(1, "Description is required"),
	}),
});
```

O middleware retorna erros de validação no formato:

```json
{
	"error": "Validation failed",
	"details": [
		{
			"field": "body.name",
			"message": "Name is required"
		}
	]
}
```

### Tratamento Global de Erros

Erros de regra de negócio são lançados com `throw new AppError("mensagem", statusCode)` dentro dos Services. O middleware global em `server.ts` os captura e retorna a resposta padronizada:

```typescript
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({ error: error.message });
	}
	return res.status(500).json({ error: "Internal Server Error" });
});
```

### Upload de Anexos

O sistema utiliza **Multer** (armazenamento em memória) + **Cloudinary** para upload de múltiplos arquivos nos chamados:

1. Multer recebe os arquivos em memória (buffer) com limite de 5MB por arquivo
2. Tipos aceitos: `image/jpeg`, `image/png`, `image/jpg`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
3. Cada buffer é convertido em stream e enviado ao Cloudinary via `upload_stream`
4. O `public_id` é composto por `{ticket_id}_{nome_original}-{timestamp}` para evitar duplicatas
5. Os uploads são feitos em paralelo com `Promise.all`
6. A URL segura (`secure_url`) e o `public_id` são salvos na tabela `ticket_attachments`

```typescript
// Configuração do Multer
storage: multer.memoryStorage(),
limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
fileFilter: allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf", "...docx"]
```

### Segurança HTTP

- **helmet**: Adiciona headers de segurança HTTP (Content-Security-Policy, X-Frame-Options, etc.)
- **express-rate-limit**: Limita a 100 requisições por IP a cada 15 minutos

---

## 🗄️ Modelagem de Dados

### Diagrama de Relacionamento

```
┌──────────────────────────┐
│          users           │
├──────────────────────────┤
│ id        UUID (PK)      │
│ name      String         │
│ email     String (UQ)    │
│ password  String         │
│ sector_id UUID (FK?)     │────────────┐
│ role      Enum (ADMIN|   │            │
│           USER)          │            │
│ isRoot    Boolean        │            │
│ created_at DateTime      │            │
│ updated_at DateTime      │            │
└──────────────────────────┘            │
                                        ▼
┌──────────────────────────────────────────────────────┐
│                       sectors                        │
├──────────────────────────────────────────────────────┤
│ id          UUID (PK)                                │
│ name        String (UQ)                              │
│ description String                                   │
│ status      Enum (ACTIVE|INACTIVE, default ACTIVE)   │
│ created_at  DateTime                                 │
│ updated_at  DateTime                                 │
└────────────────────────┬─────────────────────────────┘
                         │
              ┌──────────┴────────────┐
              │                       │
              ▼                       ▼
┌─────────────────────┐   ┌────────────────────────────────┐
│      categories     │   │            tickets             │
├─────────────────────┤   ├────────────────────────────────┤
│ id        UUID (PK) │   │ id            UUID (PK)        │
│ name      String    │   │ ticket_number Int (autoincr.)  │
│ priority  Enum      │   │ title         String           │
│ status    Enum      │   │ description   String           │
│ sector_id UUID (FK) │◄──│ sector_id     UUID (FK)        │
│ created_at DateTime │   │ category_id   UUID (FK)        │
│ updated_at DateTime │   │ user_id       UUID (FK)        │
└─────────────────────┘   │ assigned_to   UUID (FK?)       │
                          │ resolution    String?          │
                          │ status        Enum             │
                          │ started_at    DateTime?        │
                          │ closed_at     DateTime?        │
                          │ created_at    DateTime         │
                          │ updated_at    DateTime         │
                          └──────────────┬─────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────────┐
                          │        ticket_attachments        │
                          ├──────────────────────────────────┤
                          │ id        UUID (PK)              │
                          │ url       String                 │
                          │ name      String                 │
                          │ mime_type String                 │
                          │ size      Int                    │
                          │ public_id String                 │
                          │ ticket_id UUID (FK)              │
                          │ created_at DateTime              │
                          │ updated_at DateTime              │
                          └──────────────────────────────────┘
```

**Relacionamentos:**

- Um usuário pertence a zero ou um setor (`N:1` opcional)
- Um setor possui zero ou mais usuários (`1:N`)
- Um setor possui zero ou mais categorias (`1:N`)
- Uma categoria pertence a um setor (`N:1`)
- Um setor possui zero ou mais chamados (`1:N`)
- Uma categoria possui zero ou mais chamados (`1:N`)
- Um usuário abre zero ou mais chamados (`1:N`)
- Um chamado pode estar atribuído a zero ou um usuário (`N:1` opcional via `assigned_to`)
- Um chamado possui zero ou mais anexos (`1:N`)

### Tabela `users`

| Campo        | Tipo     | Constraints               | Descrição                                                 |
| ------------ | -------- | ------------------------- | --------------------------------------------------------- |
| `id`         | String   | PK, UUID, auto            | Identificador único gerado automaticamente                |
| `name`       | String   | NOT NULL                  | Nome do funcionário                                       |
| `email`      | String   | NOT NULL, UNIQUE          | Email — chave de autenticação                             |
| `password`   | String   | NOT NULL                  | Senha armazenada como **hash bcrypt** (salt: 10)          |
| `sector_id`  | String?  | FK → sectors.id, NULLABLE | Setor ao qual o usuário pertence (opcional)               |
| `role`       | Enum     | NOT NULL, default USER    | Papel do usuário: `ADMIN` ou `USER`                       |
| `isRoot`     | Boolean  | NOT NULL, default false   | Se é o primeiro usuário cadastrado (admin raiz, imutável) |
| `created_at` | DateTime | default now()             | Data de criação do registro                               |
| `updated_at` | DateTime | @updatedAt                | Data da última atualização                                |

### Tabela `sectors`

| Campo         | Tipo     | Constraints              | Descrição                                        |
| ------------- | -------- | ------------------------ | ------------------------------------------------ |
| `id`          | String   | PK, UUID, auto           | Identificador único gerado automaticamente       |
| `name`        | String   | NOT NULL, UNIQUE         | Nome do setor (único no sistema, salvo em UPPER) |
| `description` | String   | NOT NULL                 | Descrição do setor                               |
| `status`      | Enum     | NOT NULL, default ACTIVE | Estado do setor: `ACTIVE` ou `INACTIVE`          |
| `created_at`  | DateTime | default now()            | Data de criação do registro                      |
| `updated_at`  | DateTime | @updatedAt               | Data da última atualização                       |

### Tabela `categories`

| Campo        | Tipo     | Constraints              | Descrição                                           |
| ------------ | -------- | ------------------------ | --------------------------------------------------- |
| `id`         | String   | PK, UUID, auto           | Identificador único gerado automaticamente          |
| `name`       | String   | NOT NULL                 | Nome da categoria (salvo em UPPER, único por setor) |
| `priority`   | Enum     | NOT NULL                 | Prioridade: `LOW`, `MEDIUM` ou `HIGH`               |
| `status`     | Enum     | NOT NULL, default ACTIVE | Estado: `ACTIVE` ou `INACTIVE`                      |
| `sector_id`  | String   | FK → sectors.id          | Setor ao qual a categoria pertence                  |
| `created_at` | DateTime | default now()            | Data de criação do registro                         |
| `updated_at` | DateTime | @updatedAt               | Data da última atualização                          |

### Tabela `tickets`

| Campo           | Tipo      | Constraints             | Descrição                                     |
| --------------- | --------- | ----------------------- | --------------------------------------------- |
| `id`            | String    | PK, UUID, auto          | Identificador único gerado automaticamente    |
| `ticket_number` | Int       | autoincrement           | Número sequencial de identificação do chamado |
| `title`         | String    | NOT NULL                | Título do chamado                             |
| `description`   | String    | NOT NULL                | Descrição detalhada do problema               |
| `resolution`    | String?   | NULLABLE                | Texto de resolução (preenchido ao encerrar)   |
| `status`        | Enum      | NOT NULL, default OPEN  | Estado: `OPEN`, `IN_PROGRESS` ou `CLOSED`     |
| `user_id`       | String    | FK → users.id           | Usuário que abriu o chamado                   |
| `sector_id`     | String    | FK → sectors.id         | Setor responsável pelo chamado                |
| `category_id`   | String    | FK → categories.id      | Categoria do chamado                          |
| `assigned_to`   | String?   | FK → users.id, NULLABLE | ID do usuário responsável pelo atendimento    |
| `started_at`    | DateTime? | NULLABLE                | Data/hora de início do atendimento            |
| `closed_at`     | DateTime? | NULLABLE                | Data/hora de encerramento do chamado          |
| `created_at`    | DateTime  | default now()           | Data de criação do registro                   |
| `updated_at`    | DateTime  | @updatedAt              | Data da última atualização                    |

### Tabela `ticket_attachments`

| Campo        | Tipo     | Constraints     | Descrição                                          |
| ------------ | -------- | --------------- | -------------------------------------------------- |
| `id`         | String   | PK, UUID, auto  | Identificador único gerado automaticamente         |
| `url`        | String   | NOT NULL        | URL pública do arquivo no Cloudinary               |
| `name`       | String   | NOT NULL        | Nome original do arquivo (ex: `relatorio.pdf`)     |
| `mime_type`  | String   | NOT NULL        | Tipo MIME (ex: `image/png`, `application/pdf`)     |
| `size`       | Int      | NOT NULL        | Tamanho do arquivo em bytes                        |
| `public_id`  | String   | NOT NULL        | ID público do arquivo no Cloudinary (para deleção) |
| `ticket_id`  | String   | FK → tickets.id | Chamado ao qual o anexo pertence                   |
| `created_at` | DateTime | default now()   | Data de criação do registro                        |
| `updated_at` | DateTime | @updatedAt      | Data da última atualização                         |

---

## 📐 Regras de Negócio

### Cadastro de Usuário

- Os campos `name`, `email` e `password` são obrigatórios
- `password` deve ter no mínimo 6 caracteres
- `email` deve ser único no sistema
- A senha é hasheada com `bcryptjs` antes de ser persistida (salt: 10)
- O **primeiro usuário** cadastrado recebe o papel `ADMIN` e a flag `isRoot = true`
- Usuários subsequentes recebem o papel `USER` por padrão
- Race condition de criação simultânea com o mesmo email é tratada via captura do erro `P2002` do Prisma

### Autenticação

- Login realizado com `email` + `password`
- Senha comparada com o hash armazenado via `bcrypt.compare`
- Se email não encontrado → `404 User not found`
- Se senha incorreta → `401 Invalid credentials`
- Token JWT gerado com validade de **30 dias**, assinado com `JWT_SECRET`
- Payload do token: `{ sub: user_id, role, sector_id }`
- O `sector_id` é armazenado no token no momento do login — rotas que precisam do setor leem direto do token via `loadUserSector`

### Gerenciamento de Papéis (Roles)

- Apenas `ADMIN` pode alterar o papel de outros usuários
- Não é permitido alterar para o mesmo papel que o usuário já possui
- O parâmetro `role` é enviado na URL: `PATCH /users/:user_id/role/:role`

### Vínculo de Setor ao Usuário

- Apenas `ADMIN` pode vincular um setor a um usuário
- O setor deve estar com status `ACTIVE` para o vínculo ser realizado
- O `sector_id` é atualizado diretamente no usuário — o token anterior continua com o `sector_id` antigo até o próximo login

### Setores

- `name` e `description` são obrigatórios
- O nome é normalizado para UPPER antes de salvar e verificar duplicatas
- Um setor **não pode ser removido** se existirem chamados vinculados (qualquer status)
- A inativação de um setor **não é permitida** se existirem chamados com status `OPEN` ou `IN_PROGRESS`
- Ao alterar status de um setor, todas as categorias do setor também têm seu status atualizado (via `$transaction`)
- Atualização valida se os novos valores são diferentes dos atuais antes de prosseguir

### Categorias

- `name`, `priority` e `sector_id` são obrigatórios na criação
- O nome é normalizado para UPPER e deve ser único **por setor**
- O setor referenciado deve estar com status `ACTIVE`
- Apenas `ADMIN` pode criar, atualizar, excluir ou alterar status
- Uma categoria **não pode ser removida** se existirem chamados vinculados
- O status da categoria pode ser alternado entre `ACTIVE` e `INACTIVE`

### Chamados (Tickets)

- `title`, `description`, `sector_id` e `category_id` são obrigatórios
- Qualquer usuário autenticado pode abrir um chamado
- O chamado é criado com `status = OPEN`
- Arquivos (imagens/PDFs/DOCX) podem ser anexados no momento da criação via `upload.array("files")`
- **Fluxo do chamado:** `OPEN` → `IN_PROGRESS` → `CLOSED`

### Atribuição de Chamados (Assign)

- O usuário que atribui deve pertencer ao **mesmo setor** do chamado
- O usuário que abriu o chamado **não pode** se atribuir ao próprio chamado
- Chamados já atribuídos ou com status `CLOSED` não podem ser atribuídos novamente
- Ao atribuir: `status → IN_PROGRESS`, `started_at → now()`, `assigned_to → user_id`

### Encerramento de Chamados (Close)

- Apenas o usuário **atribuído** ao chamado pode encerrá-lo
- O usuário deve pertencer ao **mesmo setor** do chamado
- Chamados já encerrados (`CLOSED`) não podem ser encerrados novamente
- O campo `resolution` é obrigatório ao encerrar
- Ao encerrar: `status → CLOSED`, `closed_at → now()`, `resolution → texto`

### Listagem de Chamados

- `USER` sem setor → `403 User without sector`
- `ADMIN` pode listar chamados de **todos os setores** (`everySector=true`) ou de um setor específico (`sector_id`)
- `USER` lista apenas chamados do **seu setor** (via `user_sector_id` do token)
- Filtro por `status`: `OPEN`, `IN_PROGRESS`, `CLOSED` (apenas `ADMIN` pode filtrar por `CLOSED`)
- Paginação obrigatória: `page` (mínimo 1) e `limit` (mínimo 1), padrões `page=1, limit=10`
- Por padrão (sem filtro de status), retorna apenas `OPEN` e `IN_PROGRESS`
- Ordenação: por nome do setor (asc), depois por data de criação (asc)
- Retorna metadados de paginação: `{ data, meta: { total, page, limit, totalpages } }`

### Visualização de Chamado Individual

- Regra de acesso: o usuário pode ver o chamado se for **do mesmo setor** OU se foi **ele quem abriu** o chamado
- Retorna o chamado com seus anexos (`ticketAttachments`)

---

## 🔐 Sistema de Autenticação

```
POST /sessions → email + password → JWT (30d) → { id, name, email, role, token }
```

Token JWT payload:

```json
{
	"sub": "user-uuid",
	"role": "ADMIN",
	"sector_id": "sector-uuid-or-null",
	"iat": 1234567890,
	"exp": 1237159890
}
```

O middleware `isAuthenticated` injeta no `req`:

- `req.user_id` ← `payload.sub`
- `req.role` ← `payload.role`
- `req.user_sector_id` ← `payload.sector_id` (se existir)

---

## 🛡️ Sistema de Autorização (RBAC)

| Papel   | Descrição                                                                |
| ------- | ------------------------------------------------------------------------ |
| `ADMIN` | Acesso total. Gerencia setores, categorias, usuários e todos os chamados |
| `USER`  | Acesso restrito. Abre chamados, atribui e encerra do seu setor           |

### Middleware `hasRole`

```typescript
// Bloqueia apenas se a rota exige ADMIN e o usuário é USER
if (role === "ADMIN" && roleActive === "USER") {
	return res.status(403).json({ message: "Not authorized" });
}
```

### Middleware `loadUserSector`

Valida se o usuário possui `sector_id` no token. Obrigatório em rotas que operam sobre chamados do setor. Retorna `403` caso o usuário não tenha setor atribuído.

---

## 📦 Módulos do Sistema

### Usuários

| Service                     | Ação                                                  |
| --------------------------- | ----------------------------------------------------- |
| `CreateUserService`         | Valida email único, hasheia senha, define root e role |
| `AuthUserService`           | Valida credenciais e assina token JWT de 30 dias      |
| `DetailUserService`         | Busca dados do usuário autenticado (sem senha)        |
| `AssignedSectorUserService` | Vincula um setor ativo a um usuário                   |
| `ListUserService`           | Lista todos os usuários (sem senha)                   |
| `UpdateUserRoleService`     | Valida e atualiza papel do usuário                    |

### Setores

| Service               | Ação                                                                            |
| --------------------- | ------------------------------------------------------------------------------- |
| `CreateSectorService` | Normaliza nome, trata `P2002` para nomes duplicados                             |
| `ListSectorService`   | Lista setores por status, incluindo categorias vinculadas                       |
| `DetailSectorService` | Retorna detalhes de um setor específico                                         |
| `UpdateSectorService` | Valida existência e diferença de valores antes de atualizar                     |
| `DeleteSectorService` | Bloqueia exclusão se houver chamados vinculados                                 |
| `ToggleStatusService` | Atualiza status do setor + categorias em transação; bloqueia se tickets abertos |

### Categorias

| Service                 | Ação                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `CreateCategoryService` | Valida setor ativo e nome único por setor (normalizado em UPPER)      |
| `ListCategoryService`   | Lista categorias por status e setor (opcional), inclui dados do setor |
| `DetailCategoryService` | Retorna detalhes de uma categoria específica                          |
| `UpdateCategoryService` | Valida nome único por setor antes de atualizar                        |
| `DeleteCategoryService` | Bloqueia exclusão se houver chamados vinculados                       |
| `ToggleStatusService`   | Alterna status da categoria                                           |

### Chamados

| Service                   | Ação                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| `CreateTicketService`     | Valida usuário e categoria, cria ticket, faz upload paralelo de anexos |
| `AssignedTicketService`   | Valida regras de atribuição e transiciona status para `IN_PROGRESS`    |
| `CloseTicketService`      | Valida autorização de encerramento e transiciona status para `CLOSED`  |
| `DetailTicketService`     | Retorna ticket com anexos, validando acesso por setor ou autoria       |
| `ListTicketService`       | Lista com paginação, filtros de setor/status e regras por role         |
| `ListTicketByUserService` | Lista todos os chamados abertos pelo usuário autenticado               |

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `backend/` com as seguintes variáveis:

```env
# String de conexão com o banco PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Chave secreta para assinar tokens JWT
JWT_SECRET="sua-chave-secreta-aqui"

# Porta do servidor
PORT=3333

# Cloudinary (upload de anexos)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="sua-api-secret"
```

---

## 📏 Convenções e Padrões

### Nomenclatura de Arquivos

| Tipo       | Padrão                            | Exemplo                     |
| ---------- | --------------------------------- | --------------------------- |
| Controller | `{Domínio}Controller.ts`          | `TicketController.ts`       |
| Service    | `{Ação}{Domínio}Service.ts`       | `CreateTicketService.ts`    |
| Routes     | `routes/{domínio}/index.ts`       | `routes/ticket/index.ts`    |
| Schema     | `schema/{domínio}/index.ts`       | `schema/ticket/index.ts`    |
| Types      | `@types/{domínio}/{domínio}.d.ts` | `@types/ticket/ticket.d.ts` |

### Campos do Banco de Dados

- Todos os campos usam `snake_case`: `created_at`, `updated_at`, `sector_id`, `user_id`, `ticket_id`
- Timestamps: `created_at` (default now) e `updated_at` (@updatedAt)
- PKs: UUID gerado automaticamente (`@default(uuid())`)
- Enums mapeados diretamente no schema Prisma

### Padrão de Exports

```typescript
// Named export com chaves — SEMPRE
export { NomeDaClasse };

// Nunca usar export default em classes/funções
```

### Padrão de Controller

- Uma classe por domínio com múltiplos métodos
- Instancia o Service internamente: `new CreateTicketService().execute(...)`
- Nunca acessa o banco diretamente
- Comentários em português acima de cada método

### Padrão de Service

- Uma classe por caso de uso com método `execute(params)`
- Toda regra de negócio fica no service
- Erros lançados com `throw new AppError("mensagem", statusCode)`
- Services podem chamar outros services: `new DetailUserService().execute(user_id)`

### Padrão de Schema Zod

```typescript
// Validação aninhada com { body, params, query }
const schema = z.object({
    body: z.object({ ... }),
    params: z.object({ ... }),
    query: z.object({ ... }),
});
```

### Responses HTTP

| Situação                                      | Status |
| --------------------------------------------- | ------ |
| Criação bem-sucedida                          | `201`  |
| Operação bem-sucedida (leitura/update/delete) | `200`  |
| Erro de validação (Zod)                       | `400`  |
| Não autenticado                               | `401`  |
| Não autorizado (role)                         | `403`  |
| Recurso não encontrado                        | `404`  |
| Conflito (duplicata)                          | `409`  |
| Erro interno                                  | `500`  |
