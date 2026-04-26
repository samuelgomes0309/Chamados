# 📖 CONTEXTO TÉCNICO — Chamados Frontend

Documento de referência técnica do frontend do sistema de gestão de chamados. Descreve a arquitetura, organização de pastas, padrões de componentes, fluxo de autenticação, regras de negócio da UI e convenções do projeto.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Sistema de Autenticação](#-sistema-de-autenticação)
- [Sistema de Autorização (RBAC)](#-sistema-de-autorização-rbac)
- [Módulos da Aplicação](#-módulos-da-aplicação)
- [Sistema de Design](#-sistema-de-design)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Convenções e Padrões](#-convenções-e-padrões)

---

## 🎯 Visão Geral

O **Chamados Frontend** é uma aplicação web construída com Next.js 16 (App Router) que consome a API REST do backend para oferecer gestão completa de chamados técnicos (helpdesk). Desde o login até a abertura, atribuição e encerramento de chamados, com controle de setores e categorias e sistema de acesso por papéis.

### Domínios da aplicação

| Domínio       | Responsabilidade                                                                    |
| ------------- | ----------------------------------------------------------------------------------- |
| **Login**     | Autenticação e cadastro de funcionários com troca dinâmica de formulário            |
| **Dashboard** | Listagem paginada de chamados do setor com ações de atribuição e encerramento       |
| **Chamados**  | Abertura de novos chamados com upload de múltiplos arquivos e listagem dos próprios |
| **Setores**   | Visualização de setores ativos, detalhamento com categorias e criação (ADMIN)       |
| **Usuários**  | Listagem e atribuição de setor a outros funcionários (ADMIN)                        |

---

## 🚀 Stack Tecnológica

| Camada          | Tecnologia               | Versão     | Papel                                                  |
| --------------- | ------------------------ | ---------- | ------------------------------------------------------ |
| Framework       | Next.js                  | 16.2.2     | App Router, Server Components, Server Actions          |
| UI              | React                    | 19.2.4     | Biblioteca para construção de interfaces               |
| Linguagem       | TypeScript               | ^5         | Tipagem estática e segurança em desenvolvimento        |
| Estilização     | Tailwind CSS             | v4         | Framework CSS utility-first via `@tailwindcss/postcss` |
| Componentes     | shadcn/ui                | radix-nova | Componentes Radix primitives com CVA e Tailwind        |
| Primitivos      | radix-ui                 | ^1.4.3     | Primitivos acessíveis (Slot, Dialog, Select, etc.)     |
| Ícones          | Lucide React             | ^1.7.0     | Biblioteca de ícones SVG                               |
| Formulários     | React Hook Form          | ^7.72.1    | Gerenciamento performático de formulários              |
| Validação       | Zod                      | ^4.3.6     | Validação de schemas TypeScript-first                  |
| Variantes CSS   | class-variance-authority | ^0.7.1     | CVA para variantes de componentes                      |
| Utilitários CSS | clsx + tailwind-merge    | —          | `cn()` para composição de classes                      |
| HTTP            | Axios                    | ^1.15.0    | Cliente HTTP para Server Actions                       |
| Auth JWT        | jose                     | ^6.2.2     | Verificação de tokens JWT server-side                  |
| Notificações    | Sonner                   | ^2.0.7     | Toast notifications                                    |
| Temas           | next-themes              | ^0.4.6     | Suporte a dark/light mode (usado pelo Toaster)         |
| Animações       | tw-animate-css           | ^1.4.0     | Animações CSS para Tailwind                            |
| Formatação      | Prettier                 | ^3.8.1     | Formatador com plugin tailwindcss                      |

---

## 🏗️ Arquitetura

### Padrão de Camadas

```
┌─────────────────────────────────────────────────────┐
│              Browser (Client Component)             │
│  react-hook-form + zod → Server Action              │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            Server Action ("use server")             │
│  Valida input → api.ts (axios) → Backend REST       │
│  Retorna { success, data, error }                   │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               api.ts (Axios instance)               │
│  interceptor: injeta Bearer token do cookie         │
│  interceptor: normaliza mensagens de erro           │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                 Backend REST API                    │
│  http://localhost:3333 (NEXT_KEY_API_URL)           │
└─────────────────────────────────────────────────────┘
```

### Fluxo de Renderização (App Router)

```
Request → middleware (futuro) → Layout (Server) → Page (Server) → Client Component
                                      │
                              getUserLocal()         listTicketsAction()
                              (cookie @tickets_user)  (Server Action)
                                      │
                              UserProvider (Client)
                              AppSidebar (Client)
```

### Server Components vs. Client Components

| Tipo             | Onde                    | Responsabilidade                                                |
| ---------------- | ----------------------- | --------------------------------------------------------------- |
| Server Component | Pages (`page.tsx`)      | Busca dados via Server Actions, repassa como props              |
| Server Action    | `src/actions/{domain}/` | Executa chamadas HTTP no servidor, retorna dados para o cliente |
| Client Component | `src/components/**`     | Renderização interativa, formulários, modais, contextos         |

### Padrão de Retorno das Server Actions

Todas as actions seguem **exatamente** o mesmo padrão de retorno:

```typescript
// Sucesso
{ success: true, data: T, error: null }

// Erro
{ success: false, data: null, error: "mensagem do erro" }

// Paginado (tickets/dashboard)
{ success: true, data: T[], error: null, meta: { total, page, limit } }
```

O tratamento de erros do Axios normaliza a resposta do backend:

```typescript
// Zod validation errors (details array)
data.details.map((d) => d.message).join(", ");
// AppError (error ou message field)
data.error || data.message || "Erro desconhecido";
```

### Formulários

Padrão consistente em todos os formulários da aplicação:

```typescript
// 1. Schema Zod
export const createXSchema = z.object({ ... });
export type CreateXData = z.infer<typeof createXSchema>;

// 2. useForm
const { handleSubmit, control, reset, formState: { isSubmitting } } = useForm<CreateXData>({
    resolver: zodResolver(createXSchema),
    defaultValues: { ... },
});

// 3. Campo (sempre Controller, nunca register)
<Controller
    name="fieldName"
    control={control}
    render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Label</FieldLabel>
            <Input {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
    )}
/>

// 4. Submit
async function onSubmit(data: CreateXData) {
    const response = await createXAction(data);
    if (response.success) {
        toast.success("Mensagem de sucesso", {
            style: { background: "var(--success)", border: "none", color: "white" },
        });
    } else {
        toast.error("Mensagem de erro", {
            style: { background: "var(--destructive)", border: "none", color: "white" },
        });
    }
}
```

---

## 📁 Estrutura de Pastas

```
web/
├── app/                                             # App Router (Next.js)
│   ├── globals.css                                  # Tailwind v4 + variáveis CSS customizadas + shadcn
│   ├── layout.tsx                                   # Layout raiz: Geist font, Toaster, lang="pt-BR"
│   ├── not-found.tsx                                # Página 404
│   ├── login/
│   │   └── page.tsx                                 # Página pública de login/cadastro
│   └── (authenticated)/                             # Route group protegida
│       ├── layout.tsx                               # Layout autenticado: getUserLocal + UserProvider + AppSidebar
│       ├── dashboard/
│       │   └── page.tsx                             # Server: listTicketsAction com paginação
│       ├── sectors/
│       │   └── page.tsx                             # Server: listSectorAction (ACTIVE)
│       ├── tickets/
│       │   └── page.tsx                             # Server: listSectorAction + listTicketByUserAction
│       └── users/
│           └── page.tsx                             # Server: listUsersAction + listSectorAction (ADMIN)
│
└── src/
    ├── @types/                                      # Interfaces TypeScript globais
    │   ├── category/
    │   │   └── category.d.ts                        # Interface Category
    │   ├── login/
    │   │   └── login.d.ts                           # Interface LoginComponentProps
    │   ├── sector/
    │   │   └── sector.d.ts                          # Interface Sector (com categories[])
    │   ├── ticket/
    │   │   └── ticket.d.ts                          # Interfaces Ticket, TicketAttachment
    │   └── user/
    │       └── user.d.ts                            # Interfaces User, UserApiResponse
    │
    ├── actions/                                     # Server Actions ("use server")
    │   ├── category/
    │   │   └── index.ts                             # listCategoriesAction, createCategoryAction
    │   ├── sector/
    │   │   └── index.ts                             # createSectorAction, listSectorAction
    │   ├── ticket/
    │   │   └── index.ts                             # createTicketAction, listTicketByUserAction, listTicketsAction, assignTicketAction, closeTicketAction
    │   └── user/
    │       └── index.ts                             # loginAction, logoutAction, createUserAction, listUsersAction, assignSectorUserAction
    │
    ├── components/                                  # Componentes React
    │   ├── ui/                                      # Componentes base (shadcn/ui)
    │   │   ├── button.tsx                           # Button com CVA (variant + size)
    │   │   ├── button-group.tsx                     # Agrupamento de botões
    │   │   ├── card.tsx                             # Card, CardContent, CardHeader, etc.
    │   │   ├── dialog.tsx                           # Dialog, DialogContent, DialogHeader, etc.
    │   │   ├── field.tsx                            # Field, FieldLabel, FieldError (acessibilidade)
    │   │   ├── input.tsx                            # Input
    │   │   ├── label.tsx                            # Label
    │   │   ├── pagination.tsx                       # Pagination, PaginationContent, etc.
    │   │   ├── select.tsx                           # Select, SelectContent, SelectItem, etc.
    │   │   ├── separator.tsx                        # Separator
    │   │   ├── sonner.tsx                           # Toaster wrapper com ícones Lucide
    │   │   └── textarea.tsx                         # Textarea
    │   │
    │   ├── category/
    │   │   ├── index.tsx                            # Category — lista categorias ativas de um setor
    │   │   └── modal.tsx                            # CategoryModal — formulário de criação
    │   │
    │   ├── dashboard/
    │   │   ├── index.tsx                            # TicketsDashboard — grid paginado
    │   │   ├── card.tsx                             # DashboardCard — card com ações (assign/close)
    │   │   └── pagination.tsx                       # PaginationDashboard — paginação por URL params
    │   │
    │   ├── header/
    │   │   └── index.tsx                            # Header — título + botão de ação opcional
    │   │
    │   ├── login/
    │   │   ├── index.tsx                            # Login — controla exibição SignIn/SignUp
    │   │   ├── signin/
    │   │   │   └── index.tsx                        # SignIn — formulário de login
    │   │   └── signup/
    │   │       └── index.tsx                        # SignUp — formulário de cadastro
    │   │
    │   ├── sector/
    │   │   ├── index.tsx                            # Sector — grid de setores com modal de criação
    │   │   ├── card.tsx                             # SectorCard — card com dialog de detalhes
    │   │   └── dialog.tsx                           # SectorModal — formulário de criação
    │   │
    │   ├── sidebar/
    │   │   ├── sidebar.tsx                          # AppSidebar — responsivo (mobile/desktop)
    │   │   ├── content/
    │   │   │   └── index.tsx                        # SidebarContent — menu de navegação com usePathname
    │   │   ├── footer/
    │   │   │   └── index.tsx                        # SidebarFooter — botão de logout
    │   │   └── header/
    │   │       └── index.tsx                        # SidebarHeader — título "Nexus" + saudação
    │   │
    │   ├── ticket/
    │   │   ├── index.tsx                            # Ticket — lista chamados do usuário + modal de criação
    │   │   ├── card.tsx                             # TicketCard — card com dialog de detalhes
    │   │   └── dialog.tsx                           # TicketModal — formulário de abertura com upload
    │   │
    │   └── user/
    │       ├── index.tsx                            # User — grid de usuários
    │       ├── card.tsx                             # UserCard — card com form de atribuição de setor
    │       └── form.tsx                             # UserForm — select de setor + assign action
    │
    ├── contexts/
    │   └── userContext.tsx                          # UserContext, UserProvider, useUser()
    │
    ├── lib/
    │   ├── api.ts                                   # Instância Axios + interceptors (token + erros)
    │   ├── auth.ts                                  # isAuthenticated, saveUserLocal, getUserLocal, destroyUserLocal
    │   ├── token.ts                                 # getToken, saveToken, destroyToken (cookie HTTP-only)
    │   └── utils.ts                                 # cn() — clsx + tailwind-merge
    │
    ├── schemas/                                     # Schemas de validação Zod
    │   ├── category/
    │   │   └── index.ts                             # createCategorySchema, CreateCategoryData
    │   ├── login/
    │   │   └── index.ts                             # signinSchema, signupSchema, SigninData, SignupData
    │   ├── sector/
    │   │   └── index.ts                             # createSectorSchema, CreateSectorData
    │   ├── ticket/
    │   │   └── index.ts                             # createTicketSchema, closeTicketSchema, tipos
    │   └── user/
    │       └── index.ts                             # assignSectorUserSchema, AssignSectorUserData
    │
    └── utils/
        └── formDate.ts                              # formatDate — Intl.DateTimeFormat pt-BR
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Login

```
1. SignIn → loginAction (Server Action)
2. api.post("/sessions") → { id, name, email, sector_id, role, token }
3. saveToken(token) → cookie "@tickets_token" (httpOnly: true, maxAge: 30 dias)
4. saveUserLocal({ id, name, email, sector_id, role }) → cookie "@tickets_user" (httpOnly: false)
5. redirect("/dashboard")
```

### Fluxo de Logout

```
1. SidebarFooter → logoutAction (Server Action)
2. destroyToken() → deleta cookie "@tickets_token"
3. destroyUserLocal() → deleta cookie "@tickets_user"
4. redirect("/")
```

### Cookies

| Cookie           | httpOnly | Conteúdo    | Uso                                                             |
| ---------------- | -------- | ----------- | --------------------------------------------------------------- |
| `@tickets_token` | ✅ Sim   | JWT string  | Enviado no header `Authorization: Bearer` via interceptor Axios |
| `@tickets_user`  | ❌ Não   | JSON `User` | Lido em Server Components e injetado via `UserProvider`         |

### Helpers de Auth (`lib/auth.ts`)

| Função                | Tipo  | Descrição                             |
| --------------------- | ----- | ------------------------------------- |
| `isAuthenticated()`   | async | Valida token + busca `/me` na API     |
| `saveUserLocal(user)` | async | Persiste dados do usuário no cookie   |
| `getUserLocal()`      | async | Lê e desserializa o cookie do usuário |
| `destroyUserLocal()`  | async | Remove o cookie do usuário            |

### Helpers de Token (`lib/token.ts`)

| Função             | Tipo  | Descrição                         |
| ------------------ | ----- | --------------------------------- |
| `getToken()`       | async | Lê o JWT do cookie httpOnly       |
| `saveToken(token)` | async | Persiste o JWT no cookie httpOnly |
| `destroyToken()`   | async | Remove o cookie do JWT            |

---

## 🛡️ Sistema de Autorização (RBAC)

O controle de acesso é feito **inline** nos componentes, comparando `user.role` via `useUser()`.

### Perfis de Acesso

| Perfil    | Descrição     | Permissões                                                                   |
| --------- | ------------- | ---------------------------------------------------------------------------- |
| **ADMIN** | Administrador | Acesso total: criar setores, criar categorias, ver e gerenciar usuários      |
| **USER**  | Funcionário   | Abrir e acompanhar chamados, ver setores, acessar dashboard do próprio setor |

### Controle por Role nos Componentes

| Componente       | Comportamento por Role                                     |
| ---------------- | ---------------------------------------------------------- |
| `SidebarContent` | Oculta o item "Usuários" para `USER`                       |
| `Sector` (index) | Exibe botão "Novo setor" apenas para `ADMIN`               |
| `Category`       | Exibe botão "Vincular novo problema" apenas para `ADMIN`   |
| `DashboardCard`  | Exibe botão "Atribuir" somente se não é o autor do chamado |
| `User` (index)   | Oculta o card do próprio usuário logado                    |

---

## 📦 Módulos da Aplicação

### 🔐 Login — `/login`

- Componente `Login` (`"use client"`) alterna entre `SignIn` e `SignUp` via `useState`
- `SignIn`: formulário com email + senha, chama `loginAction`, redireciona para `/dashboard`
- `SignUp`: formulário com nome + email + senha, chama `createUserAction`, volta para `SignIn`
- Ambos usam `react-hook-form` + `zodResolver` + `Controller`
- Notificações `sonner` para sucesso e erro com style inline

### 📊 Dashboard — `/dashboard`

- Page Server Component: busca tickets paginados via `listTicketsAction({ page, limit: 10 })`
- Paginação controlada por URL search param `?page=N`
- `TicketsDashboard` + `DashboardCard` (Client): cards com badge de status
- `DashboardCard`: exibe dialog com detalhes completos do ticket
  - Botão "Atribuir": aparece se status `OPEN` + sem responsável + não é o autor
  - Formulário de "Encerrar": campo `resolution` (min 10 chars), aparece se `assigned_to === user_id`
- `PaginationDashboard`: paginação por número de páginas com botões anterior/próximo
- `STATUS_CONFIG` mapeando status → label + estilo (`CLOSED`, `OPEN`, `IN_PROGRESS`)

### 🎫 Chamados — `/tickets`

- Page Server Component: busca setores ACTIVE + chamados do usuário (`/tickets/me`)
- `Ticket` (Client): grid de `TicketCard` + botão "Novo chamado"
- `TicketModal`: formulário de abertura com:
  - Select de setor (filtra categorias dinamicamente via `useWatch`)
  - Select de categoria (reseta ao trocar setor via `useEffect`)
  - Upload de múltiplos arquivos (JPEG, PNG, WEBP, MP4, MPEG, PDF, DOC, DOCX, max 5MB cada, max 5 arquivos)
  - Envio via `FormData` para suportar uploads
- `TicketCard`: card clicável com badge de status, dialog com todos os detalhes

### 🏢 Setores — `/sectors`

- Page Server Component: busca setores ACTIVE via `listSectorAction`
- `Sector` (Client): grid de `SectorCard` + botão "Novo setor" (ADMIN only)
- `SectorCard`: card com badge de status, dialog com:
  - Nome, descrição e status do setor
  - Componente `Category` embutido: lista categorias ativas + cria nova (ADMIN only)
- `SectorModal`: formulário de criação (nome + descrição)
- `Category` (Client): carrega categorias via `useEffect` + `listCategoriesAction`
- `CategoryModal`: formulário inline com nome + prioridade (`LOW`, `MEDIUM`, `HIGH`)

### 👤 Usuários — `/users`

- Page Server Component: busca todos os usuários + setores ACTIVE
- `User` (Client): grid de `UserCard`, oculta o próprio usuário logado
- `UserCard`: exibe nome, email, role e setor do funcionário
- `UserForm`: select de setor + botão de atribuição via `assignSectorUserAction`

---

## 🎨 Sistema de Design

### Variáveis de Cores Customizadas (Tailwind v4)

O projeto usa variáveis CSS customizadas definidas em `globals.css`, acessíveis como classes Tailwind:

| Token                            | Uso                                                           |
| -------------------------------- | ------------------------------------------------------------- |
| `surface-alt`                    | Background da sidebar e modais/dialogs                        |
| `surface-deep`                   | Background dos cards                                          |
| `surface-elevated`               | Background do body                                            |
| `teal` / `teal-500` / `teal-600` | Cor primária: botões de ação, itens ativos da sidebar, badges |
| `steel`                          | Campos de informação somente-leitura (InfoField)              |
| `snow`                           | Bordas sutis com opacidade (`border-snow/15`)                 |
| `border-strong`                  | Bordas de divisão da sidebar e cards                          |
| `success`                        | Status OPEN, toasts de sucesso                                |
| `destructive`                    | Status CLOSED, toasts de erro, botão fechar                   |
| `orange`                         | Status IN_PROGRESS                                            |
| `ring`                           | Textos de subtítulo/descrição                                 |

### Padrão de Badge de Status

```tsx
const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
	CLOSED: { label: "Fechado", style: "bg-destructive/20 text-destructive" },
	OPEN: { label: "Aberto", style: "bg-success/20 text-success" },
};
const DEFAULT_STATUS = {
	label: "Em andamento",
	style: "bg-orange/20 text-orange",
};
```

### Componentes Shadcn/UI Utilizados

| Componente                                                                    | Arquivo             | Uso                                         |
| ----------------------------------------------------------------------------- | ------------------- | ------------------------------------------- |
| `Button`                                                                      | `ui/button.tsx`     | Ações primárias com CVA (variant + size)    |
| `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`           | `ui/card.tsx`       | Container de itens e formulários            |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` | `ui/dialog.tsx`     | Modais de detalhes e formulários            |
| `Field`, `FieldLabel`, `FieldError`                                           | `ui/field.tsx`      | Wrapper acessível para campos de formulário |
| `Input`                                                                       | `ui/input.tsx`      | Campos de texto                             |
| `Textarea`                                                                    | `ui/textarea.tsx`   | Campo de texto multilinha                   |
| `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`       | `ui/select.tsx`     | Seleção de opções                           |
| `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`         | `ui/pagination.tsx` | Navegação paginada                          |
| `Separator`                                                                   | `ui/separator.tsx`  | Linha divisória                             |
| `Toaster`                                                                     | `ui/sonner.tsx`     | Container de notificações                   |

### Layout Responsivo

- `AppSidebar`: detecta `window.innerWidth < 768` via `useEffect` + `addEventListener("resize")`
- Mobile: barra horizontal no topo com toggle de visibilidade (chevron/menu icon)
- Desktop: sidebar vertical fixa de `w-52` com `min-h-screen`
- Grid de cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## ⚙️ Variáveis de Ambiente

Arquivo `.env` na raiz da pasta `web/`:

```env
# URL da API REST do backend (variável pública exposta no bundle)
NEXT_KEY_API_URL=http://localhost:3333
# Segredo JWT para autenticação (não exposto no bundle)
JWT_SECRET=your_jwt_secret_here
```

> **Atenção:** A variável usa o prefixo `NEXT_KEY_` (não `NEXT_PUBLIC_`). Isso significa que ela só é acessível em Server Actions e Server Components (server-side), não no bundle do cliente.

---

## 📐 Convenções e Padrões

### Nomenclatura de Arquivos

| Tipo                            | Padrão                   | Exemplo                                           |
| ------------------------------- | ------------------------ | ------------------------------------------------- |
| Componente principal de feature | `index.tsx`              | `src/components/sector/index.tsx`                 |
| Sub-componente                  | nome descritivo          | `card.tsx`, `dialog.tsx`, `form.tsx`, `modal.tsx` |
| Sidebar sub-seções              | `index.tsx` em subpastas | `sidebar/content/index.tsx`                       |
| Action por domínio              | `index.ts`               | `src/actions/ticket/index.ts`                     |
| Schema por domínio              | `index.ts`               | `src/schemas/ticket/index.ts`                     |
| Tipos por domínio               | `{domain}.d.ts`          | `@types/ticket/ticket.d.ts`                       |

### Exportações

```typescript
// Componentes: named exports com function declaration
export function ComponentName() { ... }

// Actions: named exports no final do arquivo
export { loginAction, logoutAction, createUserAction };

// Tipos: named exports
export { User, UserApiResponse };

// Schemas: named exports inline
export const createSectorSchema = z.object({ ... });
export type CreateSectorData = z.infer<typeof createSectorSchema>;
```

### Padrão de Tipagem

- Campos da API em `snake_case`: `ticket_number`, `sector_id`, `created_at`, `assigned_to`
- Props de componentes em `camelCase`
- Interfaces sem `I` prefix: `User`, `Sector`, `Ticket`
- Tipos inferidos do Zod com `z.infer<typeof schema>`
- Importações de tipo com `import type { ... }` quando possível

### Importações

```typescript
// Path alias @/ aponta para a raiz do projeto (web/)
// Componentes UI
import { Button } from "@/src/components/ui/button";
// Tipos
import type { Ticket } from "@/src/@types/ticket/ticket";
// Actions
import { createTicketAction } from "@/src/actions/ticket";
// Schemas
import {
	createTicketSchema,
	type CreateTicketData,
} from "@/src/schemas/ticket";
// Lib
import api from "@/src/lib/api";
import { cn } from "@/src/lib/utils";
```

### Diretiva de Componentes

```typescript
// Server Action (executa no servidor)
"use server";

// Client Component (executa no cliente — obrigatório para hooks, eventos, estado)
"use client";

// Server Component (padrão — sem diretiva)
// Ex: app/(authenticated)/dashboard/page.tsx
```

### Estado Local em Listas

Ao criar um novo item, o componente atualiza o estado local sem refetch:

```typescript
// Pattern usado em Sector, Ticket, User
const [list, setList] = useState<Item[]>(initialItems);

// Callback passado para o modal
onChangeList={(newItem) => setList((prev) => [...prev, newItem])}

// Para atualizações
onChangeData={(updatedItem) => {
    setList((prev) => prev.map((i) => i.id === updatedItem.id ? updatedItem : i));
}}
```
