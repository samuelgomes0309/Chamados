# 🎫 Chamados — Frontend

Interface web para gestão de chamados técnicos (helpdesk), com dashboard de tickets por setor, controle de setores e categorias, autenticação JWT e controle de acesso RBAC (ADMIN/USER).

![Next.js](https://img.shields.io/badge/Next.js-16.2.2-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
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
- [Rotas da Aplicação](#-rotas-da-aplicação)
- [Arquitetura e Padrões](#-arquitetura-e-padrões)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Documentação](#-documentação)

---

## 🎯 Sobre o Projeto

O **Chamados Frontend** é uma aplicação web construída com Next.js 16 (App Router) que consome a API REST do backend para oferecer gestão completa de chamados técnicos. Desde o login até a abertura, atribuição e encerramento de tickets, com suporte a anexos, controle de setores e categorias e painel de administração de usuários.

### Características principais

- ✅ Arquitetura com Server Components e Server Actions (Next.js 16)
- ✅ Autenticação via JWT em cookie HTTP-only com guards por role
- ✅ UI com shadcn/ui (estilo radix-nova) e tema escuro customizado
- ✅ Validação de formulários com React Hook Form + Zod (sempre via `Controller`)
- ✅ Upload de múltiplos arquivos via `FormData` (imagens, PDFs, vídeos, documentos)
- ✅ Dashboard paginado com filtro por URL search params
- ✅ Fluxo completo de chamados: Aberto → Em andamento → Fechado
- ✅ Categorias dinâmicas no formulário (filtradas pelo setor selecionado)
- ✅ Atualização de estado local sem refetch (sem `router.refresh()`)
- ✅ Layout responsivo com sidebar colapsável em mobile
- ✅ Notificações toast com Sonner (style inline por tema)
- ✅ Controle de acesso RBAC (ADMIN/USER) inline nos componentes

### Perfis de Acesso

| Perfil    | Descrição     | Permissões                                                                           |
| --------- | ------------- | ------------------------------------------------------------------------------------ |
| **ADMIN** | Administrador | Acesso total: criar setores, criar categorias, gerenciar usuários, atribuir chamados |
| **USER**  | Funcionário   | Abrir chamados, acompanhar dashboard do setor, visualizar setores                    |

---

## 🚀 Tecnologias

| Categoria           | Tecnologia               | Versão     | Descrição                                              |
| ------------------- | ------------------------ | ---------- | ------------------------------------------------------ |
| **Framework**       | Next.js                  | 16.2.2     | App Router, Server Components, Server Actions          |
| **UI**              | React                    | 19.2.4     | Biblioteca para construção de interfaces               |
| **Linguagem**       | TypeScript               | ^5         | Superset JavaScript com tipagem estática               |
| **Estilização**     | Tailwind CSS             | v4         | Framework CSS utility-first via `@tailwindcss/postcss` |
| **Componentes**     | shadcn/ui                | radix-nova | Componentes Radix primitives + CVA + Tailwind          |
| **Primitivos**      | radix-ui                 | ^1.4.3     | Slot, Dialog, Select e outros primitivos acessíveis    |
| **Ícones**          | Lucide React             | ^1.7.0     | Biblioteca de ícones SVG                               |
| **Formulários**     | React Hook Form          | ^7.72.1    | Gerenciamento performático de formulários              |
| **Validação**       | Zod                      | ^4.3.6     | Validação de schemas TypeScript-first                  |
| **Variantes**       | class-variance-authority | ^0.7.1     | CVA para variantes de componentes                      |
| **Utilitários CSS** | clsx + tailwind-merge    | —          | `cn()` para composição segura de classes               |
| **HTTP**            | Axios                    | ^1.15.0    | Cliente HTTP para Server Actions                       |
| **Auth JWT**        | jose                     | ^6.2.2     | Verificação de tokens JWT server-side                  |
| **Notificações**    | Sonner                   | ^2.0.7     | Toast notifications                                    |
| **Temas**           | next-themes              | ^0.4.6     | Suporte a dark/light (usado pelo Toaster)              |
| **Animações**       | tw-animate-css           | ^1.4.0     | Animações CSS para Tailwind                            |
| **Formatação**      | Prettier                 | ^3.8.1     | Formatador com plugin tailwindcss                      |

---

## ⚙️ Funcionalidades

### 🔐 Autenticação e Acesso

- Login com email e senha (JWT em cookie HTTP-only `@tickets_token`)
- Cadastro de novos funcionários (volta para login ao concluir)
- Dados do usuário persistidos em cookie `@tickets_user` (não-httpOnly, acessível em Server Components)
- Logout com limpeza de ambos os cookies e redirect para `/`
- Acesso RBAC inline nos componentes via `useUser().role`

### 📊 Dashboard

- Listagem paginada de chamados do setor do usuário autenticado
- Paginação controlada por URL search params (`?page=N`)
- Badge de status colorido (Aberto, Em andamento, Fechado)
- **Atribuir chamado:** botão visível se o ticket está `OPEN`, sem responsável e não é o próprio autor
- **Encerrar chamado:** formulário com campo `resolution` (min 10 chars), visível apenas para o responsável atribuído
- `noStore()` para garantir dados sempre frescos

### 🎫 Chamados

- Listagem dos chamados abertos pelo usuário autenticado
- Abertura de novo chamado com: título, descrição, setor, categoria e anexos opcionais
  - Select de categoria filtra dinamicamente ao trocar o setor
  - Upload de até 5 arquivos (JPEG, PNG, WEBP, MP4, MPEG, PDF, DOC, DOCX — max 5MB cada)
- Card de chamado com dialog de detalhes: status, título, descrição, setor, categoria, datas

### 🏢 Setores

- Listagem de todos os setores ativos
- Card com badge de status e dialog de detalhes
- Dentro do dialog: lista de categorias ativas do setor (carregadas via `useEffect`)
- Criar novo setor (ADMIN only): nome + descrição
- Criar nova categoria vinculada ao setor (ADMIN only): nome + prioridade

### 👤 Usuários

- Listagem de todos os funcionários (sem o próprio usuário logado)
- Card com nome, email, role e setor atual
- Atribuir setor a um funcionário via select (ADMIN only)

---

## 📁 Estrutura do Projeto

```
web/
├── app/
│   ├── globals.css                                  # Tailwind v4 + variáveis CSS customizadas
│   ├── layout.tsx                                   # Layout raiz: Geist fonts, Toaster, lang="pt-BR"
│   ├── not-found.tsx                                # Página 404
│   ├── login/
│   │   └── page.tsx                                 # Página pública — <Login />
│   └── (authenticated)/                             # Route group protegida
│       ├── layout.tsx                               # Server: getUserLocal + UserProvider + AppSidebar
│       ├── dashboard/
│       │   └── page.tsx                             # Server: listTicketsAction (paginado, noStore)
│       ├── sectors/
│       │   └── page.tsx                             # Server: listSectorAction (ACTIVE)
│       ├── tickets/
│       │   └── page.tsx                             # Server: listSectorAction + listTicketByUserAction
│       └── users/
│           └── page.tsx                             # Server: listUsersAction + listSectorAction
│
└── src/
    ├── @types/
    │   ├── category/category.d.ts                   # Interface Category
    │   ├── login/login.d.ts                         # Interface LoginComponentProps
    │   ├── sector/sector.d.ts                       # Interface Sector (com categories[])
    │   ├── ticket/ticket.d.ts                       # Interfaces Ticket, TicketAttachment
    │   └── user/user.d.ts                           # Interfaces User, UserApiResponse
    │
    ├── actions/                                     # Server Actions ("use server")
    │   ├── category/index.ts                        # listCategoriesAction, createCategoryAction
    │   ├── sector/index.ts                          # createSectorAction, listSectorAction
    │   ├── ticket/index.ts                          # createTicketAction, listTicketByUserAction, listTicketsAction, assignTicketAction, closeTicketAction
    │   └── user/index.ts                            # loginAction, logoutAction, createUserAction, listUsersAction, assignSectorUserAction
    │
    ├── components/
    │   ├── ui/                                      # Componentes base shadcn/ui
    │   │   ├── button.tsx                           # Button com CVA
    │   │   ├── button-group.tsx                     # ButtonGroup
    │   │   ├── card.tsx                             # Card, CardContent, CardHeader, etc.
    │   │   ├── dialog.tsx                           # Dialog, DialogContent, etc.
    │   │   ├── field.tsx                            # Field, FieldLabel, FieldError
    │   │   ├── input.tsx                            # Input
    │   │   ├── label.tsx                            # Label
    │   │   ├── pagination.tsx                       # Pagination e itens
    │   │   ├── select.tsx                           # Select e itens
    │   │   ├── separator.tsx                        # Separator
    │   │   ├── sonner.tsx                           # Toaster wrapper
    │   │   └── textarea.tsx                         # Textarea
    │   │
    │   ├── category/
    │   │   ├── index.tsx                            # Category — lista e cria categorias de um setor
    │   │   └── modal.tsx                            # CategoryModal — formulário de criação
    │   │
    │   ├── dashboard/
    │   │   ├── index.tsx                            # TicketsDashboard — grid + paginação
    │   │   ├── card.tsx                             # DashboardCard — ações (assign/close)
    │   │   └── pagination.tsx                       # PaginationDashboard
    │   │
    │   ├── header/
    │   │   └── index.tsx                            # Header — título + botão opcional
    │   │
    │   ├── login/
    │   │   ├── index.tsx                            # Login — alterna SignIn/SignUp
    │   │   ├── signin/index.tsx                     # SignIn — formulário de login
    │   │   └── signup/index.tsx                     # SignUp — formulário de cadastro
    │   │
    │   ├── sector/
    │   │   ├── index.tsx                            # Sector — grid + modal de criação
    │   │   ├── card.tsx                             # SectorCard — dialog de detalhes
    │   │   └── dialog.tsx                           # SectorModal — formulário de criação
    │   │
    │   ├── sidebar/
    │   │   ├── sidebar.tsx                          # AppSidebar — responsivo
    │   │   ├── content/index.tsx                    # SidebarContent — menu de navegação
    │   │   ├── footer/index.tsx                     # SidebarFooter — botão de logout
    │   │   └── header/index.tsx                     # SidebarHeader — título e saudação
    │   │
    │   ├── ticket/
    │   │   ├── index.tsx                            # Ticket — grid de chamados + modal de criação
    │   │   ├── card.tsx                             # TicketCard — dialog de detalhes
    │   │   └── dialog.tsx                           # TicketModal — formulário com upload
    │   │
    │   └── user/
    │       ├── index.tsx                            # User — grid de usuários
    │       ├── card.tsx                             # UserCard — dados + formulário de setor
    │       └── form.tsx                             # UserForm — assign sector
    │
    ├── contexts/
    │   └── userContext.tsx                          # UserContext, UserProvider, useUser()
    │
    ├── lib/
    │   ├── api.ts                                   # Instância Axios + interceptors
    │   ├── auth.ts                                  # Helpers de autenticação (cookie @tickets_user)
    │   ├── token.ts                                 # Helpers de token (cookie @tickets_token)
    │   └── utils.ts                                 # cn() — clsx + tailwind-merge
    │
    ├── schemas/
    │   ├── category/index.ts                        # createCategorySchema
    │   ├── login/index.ts                           # signinSchema, signupSchema
    │   ├── sector/index.ts                          # createSectorSchema
    │   ├── ticket/index.ts                          # createTicketSchema, closeTicketSchema
    │   └── user/index.ts                            # assignSectorUserSchema
    │
    └── utils/
        └── formDate.ts                              # formatDate — pt-BR com hora
```

---

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **Backend do Chamados** rodando em `http://localhost:3333`

---

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/samuelgomes0309/Chamados.git

# Acesse a pasta do frontend
cd web

# Instale as dependências
npm install
# ou
yarn install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz da pasta `web/`:

```env
# URL da API REST do backend (acessível apenas server-side)
NEXT_KEY_API_URL=http://localhost:3333
```

> **Atenção:** O prefixo `NEXT_KEY_` (não `NEXT_PUBLIC_`) garante que a variável **não** seja exposta no bundle do cliente. Ela é usada apenas nas Server Actions (servidor).

---

## 💻 Execução

```bash
# Inicia o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

A aplicação ficará disponível em **http://localhost:3000**.

> Certifique-se de que o backend esteja rodando em `http://localhost:3333` antes de iniciar o frontend.

---

## 🗺️ Rotas da Aplicação

| Rota         | Tipo      | Componente             | Dados buscados                                | Permissão          |
| ------------ | --------- | ---------------------- | --------------------------------------------- | ------------------ |
| `/login`     | Pública   | `<Login />`            | —                                             | Todos              |
| `/dashboard` | Protegida | `<TicketsDashboard />` | `listTicketsAction` (paginado)                | Todos              |
| `/tickets`   | Protegida | `<Ticket />`           | `listSectorAction` + `listTicketByUserAction` | Todos              |
| `/sectors`   | Protegida | `<Sector />`           | `listSectorAction(ACTIVE)`                    | Todos              |
| `/users`     | Protegida | `<User />`             | `listUsersAction` + `listSectorAction`        | Visível para ADMIN |

---

## 🏗️ Arquitetura e Padrões

### Fluxo de Requisição

```
Page (Server) → Server Action ("use server") → api.ts (Axios) → Backend REST
     ↑                                              ↑
  getUserLocal()                          interceptor injeta Bearer token
  (cookie @tickets_user)                  (cookie @tickets_token)
```

### Server Actions — Padrão de Retorno

Todas as actions retornam o mesmo contrato:

```typescript
{ success: true,  data: T,    error: null   }  // Sucesso
{ success: false, data: null, error: string }  // Erro
```

### Formulários — Padrão Consistente

Todos os formulários seguem `react-hook-form` + `zodResolver` + `Controller`:

```typescript
// Nunca use `register`. Sempre use Controller
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
```

### Notificações — Padrão de Style

```typescript
toast.success("Mensagem", {
	style: { background: "var(--success)", border: "none", color: "white" },
});
toast.error("Mensagem", {
	style: { background: "var(--destructive)", border: "none", color: "white" },
});
```

### Atualização de Estado Local

Listas são atualizadas localmente sem refetch (sem `router.refresh()`):

```typescript
// Inserção
onChangeList={(newItem) => setList((prev) => [...prev, newItem])}

// Atualização
onChangeData={(updated) => setList((prev) => prev.map(i => i.id === updated.id ? updated : i))}
```

---

## 📜 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Gera o build de produção
npm run build

# Inicia o servidor de produção (após build)
npm run start

# Executa o linter ESLint
npm run lint
```

---

## 📚 Documentação

A documentação técnica completa está disponível na pasta `documentation/frontend/`:

| Arquivo       | Descrição                                                                           |
| ------------- | ----------------------------------------------------------------------------------- |
| `CONTEXTO.md` | Arquitetura, organização de pastas, padrões de componentes, auth, RBAC e convenções |
| `ROTAS.md`    | Documentação completa de todas as rotas e Server Actions com inputs/outputs         |
| `README.md`   | Este arquivo — visão geral e guia de início rápido                                  |
