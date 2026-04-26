# 🗺️ ROTAS E ACTIONS — Chamados Frontend

Documentação completa das rotas da aplicação (App Router) e das Server Actions disponíveis no sistema.

> **Base URL da API:** `http://localhost:3333` (configurado em `NEXT_KEY_API_URL`)
> **Autenticação:** JWT em cookie HTTP-only `@tickets_token`, injetado automaticamente pelo interceptor Axios

---

## 📋 Índice

- [Rotas da Aplicação](#-rotas-da-aplicação)
  - [/ — Root](#-root)
  - [/login — Autenticação](#login--autenticação)
  - [/dashboard — Dashboard](#dashboard--dashboard)
  - [/tickets — Chamados](#tickets--chamados)
  - [/sectors — Setores](#sectors--setores)
  - [/users — Usuários](#users--usuários)
- [Server Actions](#-server-actions)
  - [Actions de Usuário](#-actions-de-usuário)
  - [Actions de Setor](#-actions-de-setor)
  - [Actions de Categoria](#-actions-de-categoria)
  - [Actions de Chamado](#-actions-de-chamado)
- [Padrão de Retorno](#-padrão-de-retorno)
- [Fluxo de Dados](#-fluxo-de-dados)

---

## 🧭 Rotas da Aplicação

### `/` — Root

- **Arquivo:** `app/page.tsx` (implícito, sem arquivo — redireciona para `/login`)
- **Tipo:** Pública
- **Comportamento:** Redireciona para a página de login

---

### `/login` — Autenticação

- **Arquivo:** `app/login/page.tsx`
- **Tipo:** Pública (não requer autenticação)
- **Componente:** `<Login />` (`src/components/login/index.tsx`)
- **Estado:** Controla exibição de `SignIn` ou `SignUp` via `useState<boolean>`

#### SignIn — Formulário de Login

**Schema:** `signinSchema`

| Campo      | Tipo   | Validação   | Descrição            |
| ---------- | ------ | ----------- | -------------------- |
| `email`    | string | `z.email()` | Email do funcionário |
| `password` | string | min 6 chars | Senha do funcionário |

**Fluxo:**

1. `handleSubmit` → `loginAction(data)`
2. Sucesso: `toast.success` + `redirect("/dashboard")`
3. Erro: `toast.error` + `reset(data)` (mantém os valores)

---

#### SignUp — Formulário de Cadastro

**Schema:** `signupSchema`

| Campo      | Tipo   | Validação   | Descrição            |
| ---------- | ------ | ----------- | -------------------- |
| `name`     | string | min 1 char  | Nome do funcionário  |
| `email`    | string | `z.email()` | Email do funcionário |
| `password` | string | min 6 chars | Senha                |

**Fluxo:**

1. `handleSubmit` → `createUserAction(data)`
2. Sucesso: `toast.success` + `onSwitch()` (volta para SignIn)
3. Erro: `toast.error` + `reset(data)`

---

### `/dashboard` — Dashboard

- **Arquivo:** `app/(authenticated)/dashboard/page.tsx`
- **Tipo:** Protegida (route group `(authenticated)`)
- **Componente:** `<TicketsDashboard />` (`src/components/dashboard/index.tsx`)
- **Server Action usada:** `listTicketsAction({ page, limit: 10 })`
- **Search Params:** `?page=N` (default: 1, min: 1)

**Props passadas ao componente:**

| Prop      | Tipo       | Descrição                         |
| --------- | ---------- | --------------------------------- |
| `tickets` | `Ticket[]` | Lista de chamados da página atual |
| `page`    | `number`   | Página atual                      |
| `limit`   | `number`   | Itens por página (10)             |
| `total`   | `number`   | Total de chamados                 |

**Funcionalidades no cliente:**

- Grid de `DashboardCard` com paginação
- `DashboardCard`: badge de status, dialog com detalhes completos
  - **Atribuir chamado:** aparece se `status === "OPEN"` + `!assigned_to` + `user_id !== ticket.user_id`
  - **Encerrar chamado:** formulário com `resolution` (min 10 chars), aparece se `assigned_to === user_id`
- `PaginationDashboard`: navegação por URL params (`router.push`)
- `noStore()` para desativar cache e sempre buscar dados frescos

---

### `/tickets` — Chamados

- **Arquivo:** `app/(authenticated)/tickets/page.tsx`
- **Tipo:** Protegida
- **Componente:** `<Ticket />` (`src/components/ticket/index.tsx`)
- **Server Actions usadas:**
  - `listSectorAction({ status: "ACTIVE" })` — para popular o select de setores
  - `listTicketByUserAction()` — chamados do usuário autenticado

**Props passadas ao componente:**

| Prop      | Tipo       | Descrição                     |
| --------- | ---------- | ----------------------------- |
| `sectors` | `Sector[]` | Setores ativos com categorias |
| `tickets` | `Ticket[]` | Chamados do usuário           |

**Funcionalidades no cliente:**

- Grid de `TicketCard` com todos os chamados do usuário
- Botão "Novo chamado" abre `TicketModal`
- `TicketModal`: formulário de abertura com:
  - Select de setor (lista `sectors`)
  - Select de categoria (filtra categoricamente via `useWatch("sector_id")`)
  - Campo de título e descrição
  - Upload de arquivos (múltiplos, via `<input type="file" multiple>`)
  - Envio como `FormData` via `createTicketAction`
- `TicketCard`: badge de status, dialog com detalhes (título, descrição, setor, categoria, status, datas)

**Upload de arquivos:**

| Atributo          | Valor                                           |
| ----------------- | ----------------------------------------------- |
| Tipos aceitos     | JPEG, PNG, JPG, WEBP, MP4, MPEG, PDF, DOC, DOCX |
| Tamanho máximo    | 5MB por arquivo                                 |
| Quantidade máxima | 5 arquivos                                      |

---

### `/sectors` — Setores

- **Arquivo:** `app/(authenticated)/sectors/page.tsx`
- **Tipo:** Protegida
- **Componente:** `<Sector />` (`src/components/sector/index.tsx`)
- **Server Action usada:** `listSectorAction({ status: "ACTIVE" })`

**Props passadas ao componente:**

| Prop      | Tipo       | Descrição                     |
| --------- | ---------- | ----------------------------- |
| `sectors` | `Sector[]` | Setores ativos com categorias |

**Funcionalidades no cliente:**

- Grid de `SectorCard` (todos os usuários)
- Botão "Novo setor" visível apenas para `ADMIN` (via `useUser().role`)
- `SectorModal`: formulário de criação (nome + descrição)
- `SectorCard`: badge de status ativo/inativo, click abre dialog de detalhes
  - Dialog exibe nome, descrição, status
  - Componente `Category` embutido: lista categorias ativas do setor
    - Carregadas via `useEffect` + `listCategoriesAction({ sector_id, status: "ACTIVE" })`
    - Botão "Vincular novo problema" (ADMIN only) abre `CategoryModal`
    - `CategoryModal`: formulário com nome + prioridade (LOW/MEDIUM/HIGH)

---

### `/users` — Usuários

- **Arquivo:** `app/(authenticated)/users/page.tsx`
- **Tipo:** Protegida (visível apenas para `ADMIN` no menu)
- **Componente:** `<User />` (`src/components/user/index.tsx`)
- **Server Actions usadas:**
  - `listUsersAction()` — todos os funcionários
  - `listSectorAction({ status: "ACTIVE" })` — setores para o select

**Props passadas ao componente:**

| Prop      | Tipo       | Descrição                   |
| --------- | ---------- | --------------------------- |
| `users`   | `User[]`   | Todos os funcionários       |
| `sectors` | `Sector[]` | Setores ativos para seleção |

**Funcionalidades no cliente:**

- Grid de `UserCard` (oculta o card do próprio usuário logado via `user.id !== userLogged.id`)
- `UserCard`: exibe nome, email, role e setor do usuário
- `UserForm` embutido: select de setor + `assignSectorUserAction`

---

## ⚡ Server Actions

Todas as actions ficam em `src/actions/{domain}/index.ts`, declaradas com `"use server"` no topo do arquivo.

### 👤 Actions de Usuário

**Arquivo:** `src/actions/user/index.ts`

---

#### `loginAction(userData: SigninData)`

Autentica o usuário, persiste token e dados em cookies.

**Input:** `SigninData` (`signinSchema`)

| Campo      | Tipo   | Descrição        |
| ---------- | ------ | ---------------- |
| `email`    | string | Email do usuário |
| `password` | string | Senha do usuário |

**Endpoint chamado:** `POST /sessions`

**Comportamento:**

1. Chama `api.post("/sessions", { email, password })`
2. Chama `saveToken(token)` → cookie `@tickets_token` (httpOnly, 30 dias)
3. Chama `saveUserLocal({ id, name, email, sector_id, role })` → cookie `@tickets_user` (30 dias)

**Retorno:**

```typescript
// Sucesso
{ success: true, data: User, error: null }
// Erro
{ success: false, data: null, error: "Email ou senha incorretos" }
```

---

#### `createUserAction(userData: SignupData)`

Registra um novo funcionário.

**Input:** `SignupData` (`signupSchema`)

| Campo      | Tipo   | Descrição           |
| ---------- | ------ | ------------------- |
| `name`     | string | Nome do funcionário |
| `email`    | string | Email único         |
| `password` | string | Senha               |

**Endpoint chamado:** `POST /users`

**Retorno:**

```typescript
{ success: true, data: null, error: null }
{ success: false, data: null, error: "User already exists" }
```

---

#### `logoutAction()`

Encerra a sessão do usuário.

**Endpoint chamado:** Nenhum (apenas manipula cookies)

**Comportamento:**

1. `destroyToken()` → deleta `@tickets_token`
2. `destroyUserLocal()` → deleta `@tickets_user`
3. `redirect("/")`

---

#### `listUsersAction()`

Lista todos os funcionários (ADMIN only).

**Endpoint chamado:** `GET /users`

**Retorno:**

```typescript
{ success: true, data: User[], error: null }
{ success: false, data: null, error: "Insufficient permissions" }
```

---

#### `assignSectorUserAction(userData: AssignSectorUserData)`

Vincula um setor a um funcionário.

**Input:** `AssignSectorUserData` (`assignSectorUserSchema`)

| Campo       | Tipo          | Descrição                |
| ----------- | ------------- | ------------------------ |
| `user_id`   | string (UUID) | ID do usuário a vincular |
| `sector_id` | string (UUID) | ID do setor ativo        |

**Endpoint chamado:** `PUT /users/sector`

**Retorno:**

```typescript
{ success: true, data: User, error: null }
{ success: false, data: null, error: "Sector not found or inactive" }
```

---

### 🏢 Actions de Setor

**Arquivo:** `src/actions/sector/index.ts`

---

#### `createSectorAction(sectorData: CreateSectorData)`

Cria um novo setor (ADMIN only).

**Input:** `CreateSectorData` (`createSectorSchema`)

| Campo         | Tipo   | Validação  | Descrição                                       |
| ------------- | ------ | ---------- | ----------------------------------------------- |
| `name`        | string | min 1 char | Nome do setor (normalizado em UPPER no backend) |
| `description` | string | min 1 char | Descrição do setor                              |

**Endpoint chamado:** `POST /sectors`

**Retorno:**

```typescript
{ success: true, data: Sector, error: null }
{ success: false, data: null, error: "Sector already exists" }
```

---

#### `listSectorAction({ status })`

Lista setores por status com categorias vinculadas.

**Input:**

| Parâmetro | Tipo   | Valores                    |
| --------- | ------ | -------------------------- |
| `status`  | string | `"ACTIVE"` \| `"INACTIVE"` |

**Endpoint chamado:** `GET /sectors?status=ACTIVE`

**Retorno:**

```typescript
{ success: true, data: Sector[], error: null }
```

> `Sector` inclui `categories: Category[]` — lista das categorias do setor

---

### 📂 Actions de Categoria

**Arquivo:** `src/actions/category/index.ts`

---

#### `listCategoriesAction({ sector_id?, status })`

Lista categorias por setor e status.

**Input:**

| Parâmetro   | Tipo          | Obrigatório | Descrição                                     |
| ----------- | ------------- | ----------- | --------------------------------------------- |
| `sector_id` | string (UUID) | ❌          | Filtra por setor (omite param se não enviado) |
| `status`    | string        | ✅          | `"ACTIVE"` \| `"INACTIVE"`                    |

**Endpoint chamado:** `GET /categories?status=ACTIVE&sector_id=<uuid>`

**Retorno:**

```typescript
{ success: true, data: Category[], error: null }
```

---

#### `createCategoryAction(data: CreateCategoryData)`

Cria uma nova categoria vinculada a um setor (ADMIN only).

**Input:** `CreateCategoryData` (`createCategorySchema`)

| Campo       | Tipo          | Validação                   | Descrição              |
| ----------- | ------------- | --------------------------- | ---------------------- |
| `name`      | string        | min 1 char                  | Nome da categoria      |
| `priority`  | enum          | `LOW` \| `MEDIUM` \| `HIGH` | Prioridade             |
| `sector_id` | string (UUID) | min 1 char                  | Setor ao qual pertence |

**Endpoint chamado:** `POST /categories`

**Retorno:**

```typescript
{ success: true, data: Category, error: null }
{ success: false, data: null, error: "Category already exists in this sector" }
```

---

### 🎫 Actions de Chamado

**Arquivo:** `src/actions/ticket/index.ts`

---

#### `createTicketAction(ticketData: CreateTicketData)`

Abre um novo chamado com suporte a anexos.

**Input:** `CreateTicketData` (`createTicketSchema`)

| Campo         | Tipo          | Validação                 | Descrição             |
| ------------- | ------------- | ------------------------- | --------------------- |
| `title`       | string        | min 1 char                | Título do chamado     |
| `description` | string        | min 1 char                | Descrição detalhada   |
| `sector_id`   | string (UUID) | min 1 char                | Setor responsável     |
| `category_id` | string (UUID) | min 1 char                | Categoria do problema |
| `files`       | `FileList`    | opcional, max 5, 5MB/cada | Arquivos anexados     |

**Envio:** `FormData` (necessário para multipart com arquivos)

**Endpoint chamado:** `POST /tickets` (multipart/form-data)

**Retorno:**

```typescript
{ success: true, data: Ticket, error: null }
{ success: false, data: null, error: "Category is inactive" }
```

---

#### `listTicketByUserAction()`

Lista os chamados abertos pelo usuário autenticado.

**Endpoint chamado:** `GET /tickets/me`

**Retorno:**

```typescript
{ success: true, data: Ticket[], error: null }
```

---

#### `listTicketsAction({ page?, limit? })`

Lista todos os chamados do setor do usuário com paginação.

**Input:**

| Parâmetro | Tipo   | Default | Descrição        |
| --------- | ------ | ------- | ---------------- |
| `page`    | number | `1`     | Página atual     |
| `limit`   | number | `10`    | Itens por página |

**Endpoint chamado:** `GET /tickets?page=1&limit=10`

**Retorno:**

```typescript
{
    success: true,
    data: Ticket[],
    error: null,
    meta: { total: number, page: number, limit: number }
}
```

---

#### `assignTicketAction({ ticket_id })`

Atribui um chamado ao usuário autenticado.

**Input:**

| Parâmetro   | Tipo          | Descrição                |
| ----------- | ------------- | ------------------------ |
| `ticket_id` | string (UUID) | ID do chamado a atribuir |

**Endpoint chamado:** `PUT /tickets/assign/:ticket_id`

**Regras de negócio (validadas no backend):**

- Chamado deve estar com status `OPEN`
- Usuário não pode atribuir a si mesmo o próprio chamado
- Usuário deve ser do mesmo setor do chamado

**Retorno:**

```typescript
{ success: true, data: Ticket, error: null }
{ success: false, data: null, error: "Ticket already assigned" }
```

---

#### `closeTicketAction({ ticket_id, resolution })`

Encerra um chamado com resolução.

**Input:**

| Parâmetro    | Tipo          | Validação                          | Descrição                |
| ------------ | ------------- | ---------------------------------- | ------------------------ |
| `ticket_id`  | string (UUID) | —                                  | ID do chamado a encerrar |
| `resolution` | string        | min 10 chars (`closeTicketSchema`) | Descrição da resolução   |

**Endpoint chamado:** `PUT /tickets/close/:ticket_id`

**Regras de negócio (validadas no backend):**

- Apenas o usuário `assigned_to` pode encerrar
- Chamado deve estar com status `IN_PROGRESS`

**Retorno:**

```typescript
{ success: true, data: Ticket, error: null }
{ success: false, data: null, error: "Only the assigned user can close this ticket" }
```

---

## 📦 Padrão de Retorno

Todas as Server Actions seguem o mesmo contrato de retorno:

```typescript
// Retorno padrão
type ActionResult<T> = {
	success: boolean;
	data: T | null;
	error: string | null;
};

// Retorno paginado (listTicketsAction)
type PaginatedActionResult<T> = ActionResult<T[]> & {
	meta: {
		total: number;
		page: number;
		limit: number;
	};
};
```

**Tratamento no componente:**

```typescript
const response = await someAction(data);
if (response.success) {
	toast.success("Operação realizada!", {
		style: { background: "var(--success)", border: "none", color: "white" },
	});
	// atualiza estado local
} else {
	toast.error(response.error ?? "Erro desconhecido", {
		style: { background: "var(--destructive)", border: "none", color: "white" },
	});
}
```

---

## 🔄 Fluxo de Dados

### Fluxo de criação de item (sem refetch)

```
1. Client Component mantém estado local: const [list, setList] = useState(initialData)
2. Modal/Dialog recebe callback: onChangeList={(newItem) => setList(prev => [...prev, newItem])}
3. Action retorna o item criado: { success: true, data: newItem }
4. Callback atualiza o estado: setList(prev => [...prev, newItem])
5. Modal fecha: onClose()
```

### Fluxo de atualização de item (sem refetch)

```
1. Client Component: const [list, setList] = useState(initialData)
2. Card recebe callback: onChangeData={(updated) => setList(prev => prev.map(i => i.id === updated.id ? updated : i))}
3. Action retorna o item atualizado: { success: true, data: updatedItem }
4. Callback substitui no array: setList(prev => prev.map(...))
```

### Fluxo de paginação do Dashboard

```
1. URL: /dashboard?page=2
2. Page Server Component: await searchParams → page = 2
3. listTicketsAction({ page: 2, limit: 10 }) → API GET /tickets?page=2&limit=10
4. Props para TicketsDashboard: { tickets, page: 2, limit: 10, total }
5. PaginationDashboard: router.push("/dashboard?page=3") → full page re-render
```

### Fluxo de categorias dinâmicas (TicketModal)

```
1. Select de setor muda → useWatch("sector_id") atualiza
2. useMemo recalcula: sectors.find(s => s.id === sector_id)?.categories ?? []
3. useEffect: ao mudar sector_id → setValue("category_id", "") (reset)
4. Select de categoria renderiza as categorias do setor selecionado
```
