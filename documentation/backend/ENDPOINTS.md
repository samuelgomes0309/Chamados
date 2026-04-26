# 📡 ENDPOINTS — Chamados API

Documentação completa de todos os endpoints da API REST do sistema de gestão de chamados.

> **Base URL:** `http://localhost:3333`
> **Autenticação:** JWT via header `Authorization: Bearer <token>`

---

## 📋 Índice

- [Usuários](#-usuários)
  - [POST /users](#post-users)
  - [POST /sessions](#post-sessions)
  - [GET /me](#get-me)
  - [PUT /users/sector](#put-userssector)
  - [GET /users](#get-users)
  - [PATCH /users/:user_id/role/:role](#patch-usersuser_idrolerole)
- [Setores](#-setores)
  - [POST /sectors](#post-sectors)
  - [GET /sectors](#get-sectors)
  - [GET /sectors/:sector_id](#get-sectorssector_id)
  - [PUT /sectors/:sector_id](#put-sectorssector_id)
  - [DELETE /sectors/:sector_id](#delete-sectorssector_id)
  - [PATCH /sectors/:sector_id/status/:status](#patch-sectorssector_idstatusstatus)
- [Categorias](#-categorias)
  - [POST /categories](#post-categories)
  - [GET /categories](#get-categories)
  - [GET /categories/:category_id](#get-categoriescategory_id)
  - [PUT /categories/:category_id](#put-categoriescategory_id)
  - [DELETE /categories/:category_id](#delete-categoriescategory_id)
  - [PATCH /categories/:category_id/status/:status](#patch-categoriescategory_idstatusstatus)
- [Chamados](#-chamados)
  - [POST /tickets](#post-tickets)
  - [GET /tickets/me](#get-ticketsme)
  - [GET /tickets/:ticket_id](#get-ticketsticket_id)
  - [GET /tickets](#get-tickets)
  - [PUT /tickets/assign/:ticket_id](#put-ticketsassignticket_id)
  - [PUT /tickets/close/:ticket_id](#put-ticketscloseticket_id)
- [Códigos de Status](#-códigos-de-status)

---

## 👤 Usuários

---

### POST /users

Cria um novo usuário (funcionário) no sistema. O primeiro usuário cadastrado recebe automaticamente o papel `ADMIN` e a flag `isRoot`.

- **Autenticação:** ❌ Não requerida
- **Permissão:** Pública
- **Controller:** `UserController.create`
- **Service:** `CreateUserService`
- **Schema:** `createUserSchema`

#### Request Body

```json
{
	"name": "João Silva",
	"email": "joao@empresa.com",
	"password": "senha123"
}
```

| Campo      | Tipo   | Obrigatório | Validação         | Descrição             |
| ---------- | ------ | ----------- | ----------------- | --------------------- |
| `name`     | string | ✅          | Min. 1 caractere  | Nome do funcionário   |
| `email`    | string | ✅          | Email válido      | Email único           |
| `password` | string | ✅          | Min. 6 caracteres | Senha (será hasheada) |

#### Response — 201 Created

```json
{
	"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"name": "João Silva",
	"email": "joao@empresa.com",
	"role": "ADMIN",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

> **Nota:** O primeiro usuário recebe `role: "ADMIN"`. Usuários subsequentes recebem `role: "USER"`.

#### Erros

| Status | Mensagem                | Causa                          |
| ------ | ----------------------- | ------------------------------ |
| `400`  | `"Validation failed"`   | Campos não atendem o schema    |
| `409`  | `"User already exists"` | Email já cadastrado no sistema |

---

### POST /sessions

Autentica um usuário e retorna um token JWT.

- **Autenticação:** ❌ Não requerida
- **Permissão:** Pública
- **Controller:** `UserController.login`
- **Service:** `AuthUserService`
- **Schema:** `loginUserSchema`

#### Request Body

```json
{
	"email": "joao@empresa.com",
	"password": "senha123"
}
```

| Campo      | Tipo   | Obrigatório | Validação         | Descrição        |
| ---------- | ------ | ----------- | ----------------- | ---------------- |
| `email`    | string | ✅          | Email válido      | Email do usuário |
| `password` | string | ✅          | Min. 6 caracteres | Senha do usuário |

#### Response — 200 OK

```json
{
	"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"name": "João Silva",
	"email": "joao@empresa.com",
	"role": "ADMIN",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo   | Tipo   | Descrição                       |
| ------- | ------ | ------------------------------- |
| `id`    | string | UUID do usuário                 |
| `name`  | string | Nome do usuário                 |
| `email` | string | Email do usuário                |
| `role`  | string | Papel: `ADMIN` ou `USER`        |
| `token` | string | JWT com validade de **30 dias** |

#### Erros

| Status | Mensagem                | Causa                       |
| ------ | ----------------------- | --------------------------- |
| `400`  | `"Validation failed"`   | Campos não atendem o schema |
| `404`  | `"User not found"`      | Email não encontrado        |
| `401`  | `"Invalid credentials"` | Senha incorreta             |

---

### GET /me

Retorna os dados do usuário atualmente autenticado.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `UserController.detail`
- **Service:** `DetailUserService`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response — 200 OK

```json
{
	"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"name": "João Silva",
	"email": "joao@empresa.com",
	"role": "ADMIN",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

#### Erros

| Status | Mensagem               | Causa                           |
| ------ | ---------------------- | ------------------------------- |
| `401`  | `"Token not provided"` | Token não enviado no header     |
| `401`  | `"Invalid token"`      | Token inválido ou expirado      |
| `404`  | `"User not found"`     | Usuário não encontrado no banco |

---

### PUT /users/sector

Vincula um setor a um usuário. O setor deve estar ativo.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `UserController.assignSector`
- **Service:** `AssignedSectorUserService`
- **Schema:** `assignSectorUserSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body

```json
{
	"user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

| Campo       | Tipo   | Obrigatório | Descrição                       |
| ----------- | ------ | ----------- | ------------------------------- |
| `user_id`   | string | ✅          | UUID do usuário a ser vinculado |
| `sector_id` | string | ✅          | UUID do setor ativo             |

#### Response — 200 OK

```json
{
	"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"name": "João Silva",
	"email": "joao@empresa.com",
	"role": "USER",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

#### Erros

| Status | Mensagem                                   | Causa                           |
| ------ | ------------------------------------------ | ------------------------------- |
| `400`  | `"Validation failed"`                      | Campos não atendem o schema     |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido       |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN             |
| `404`  | `"Sector not found or inactive"`           | Setor não encontrado ou inativo |

---

### GET /users

Lista todos os usuários cadastrados no sistema.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `UserController.list`
- **Service:** `ListUserService`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response — 200 OK

```json
[
	{
		"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		"name": "João Silva",
		"email": "joao@empresa.com",
		"role": "ADMIN",
		"sector_id": null,
		"created_at": "2026-04-26T10:00:00.000Z",
		"updated_at": "2026-04-26T10:00:00.000Z"
	}
]
```

#### Erros

| Status | Mensagem                                   | Causa                     |
| ------ | ------------------------------------------ | ------------------------- |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN       |

---

### PATCH /users/:user_id/role/:role

Altera o papel (role) de um usuário.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `UserController.updateRole`
- **Service:** `UpdateUserRoleService`
- **Schema:** `updateUserRoleSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro | Tipo   | Obrigatório | Valores           | Descrição                    |
| --------- | ------ | ----------- | ----------------- | ---------------------------- |
| `user_id` | string | ✅          | UUID válido       | ID do usuário a ser alterado |
| `role`    | string | ✅          | `ADMIN` ou `USER` | Novo papel do usuário        |

#### Response — 200 OK

```json
{
	"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"name": "João Silva",
	"email": "joao@empresa.com",
	"role": "ADMIN",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

#### Erros

| Status | Mensagem                                        | Causa                           |
| ------ | ----------------------------------------------- | ------------------------------- |
| `400`  | `"Validation failed"`                           | Parâmetros não atendem o schema |
| `401`  | `"Token not provided"` / `"Invalid token"`      | Token ausente ou inválido       |
| `403`  | `"Not authorized"`                              | Usuário não é ADMIN             |
| `404`  | `"User not found"`                              | Usuário não encontrado          |
| `400`  | `"User already has the ADMIN role"` (ou `USER`) | Papel já é o mesmo              |

---

## 🏢 Setores

---

### POST /sectors

Cria um novo setor/departamento.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `SectorController.create`
- **Service:** `CreateSectorService`
- **Schema:** `createSectorSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body

```json
{
	"name": "Suporte TI",
	"description": "Setor responsável pelo suporte técnico em tecnologia da informação"
}
```

| Campo         | Tipo   | Obrigatório | Validação        | Descrição          |
| ------------- | ------ | ----------- | ---------------- | ------------------ |
| `name`        | string | ✅          | Min. 1 caractere | Nome do setor      |
| `description` | string | ✅          | Min. 1 caractere | Descrição do setor |

> **Nota:** O nome é normalizado para UPPER antes de ser salvo. `"suporte ti"` → `"SUPORTE TI"`

#### Response — 201 Created

```json
{
	"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"name": "SUPORTE TI",
	"description": "Setor responsável pelo suporte técnico em tecnologia da informação",
	"status": "ACTIVE",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                   | Causa                       |
| ------ | ------------------------------------------ | --------------------------- |
| `400`  | `"Validation failed"`                      | Campos não atendem o schema |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido   |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN         |
| `409`  | `"Sector already exists"`                  | Nome do setor já cadastrado |

---

### GET /sectors

Lista todos os setores filtrados por status.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `SectorController.list`
- **Service:** `ListSectorService`
- **Schema:** `listSectorSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Valores                | Descrição         |
| --------- | ------ | ----------- | ---------------------- | ----------------- |
| `status`  | string | ✅          | `ACTIVE` ou `INACTIVE` | Filtro por status |

#### Exemplo de Requisição

```
GET /sectors?status=ACTIVE
```

#### Response — 200 OK

```json
[
	{
		"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
		"name": "SUPORTE TI",
		"description": "Setor responsável pelo suporte técnico",
		"status": "ACTIVE",
		"created_at": "2026-04-26T10:00:00.000Z",
		"updated_at": "2026-04-26T10:00:00.000Z",
		"categories": [
			{
				"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
				"name": "HARDWARE",
				"priority": "HIGH",
				"status": "ACTIVE",
				"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
			}
		]
	}
]
```

#### Erros

| Status | Mensagem                                   | Causa                        |
| ------ | ------------------------------------------ | ---------------------------- |
| `400`  | `"Validation failed"`                      | `status` inválido ou ausente |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido    |

---

### GET /sectors/:sector_id

Retorna os detalhes de um setor específico.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `SectorController.detail`
- **Service:** `DetailSectorService`
- **Schema:** `detailSectorSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição     |
| ----------- | ------ | ----------- | ------------- |
| `sector_id` | string | ✅          | UUID do setor |

#### Response — 200 OK

```json
{
	"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"name": "SUPORTE TI",
	"description": "Setor responsável pelo suporte técnico",
	"status": "ACTIVE",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                   | Causa                     |
| ------ | ------------------------------------------ | ------------------------- |
| `400`  | `"Validation failed"`                      | `sector_id` não fornecido |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido |
| `404`  | `"Sector not found"`                       | Setor não encontrado      |

---

### PUT /sectors/:sector_id

Atualiza os dados de um setor existente.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `SectorController.update`
- **Service:** `UpdateSectorService`
- **Schema:** `updateSectorSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição     |
| ----------- | ------ | ----------- | ------------- |
| `sector_id` | string | ✅          | UUID do setor |

#### Request Body

```json
{
	"name": "Infraestrutura TI",
	"description": "Setor de infraestrutura e redes"
}
```

| Campo         | Tipo   | Obrigatório | Validação                       | Descrição               |
| ------------- | ------ | ----------- | ------------------------------- | ----------------------- |
| `name`        | string | ❌          | Min. 1 caractere (se fornecido) | Novo nome do setor      |
| `description` | string | ❌          | Min. 1 caractere (se fornecido) | Nova descrição do setor |

#### Response — 200 OK

```json
{
	"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"name": "INFRAESTRUTURA TI",
	"description": "Setor de infraestrutura e redes",
	"status": "ACTIVE",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T12:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                               | Causa                             |
| ------ | ------------------------------------------------------ | --------------------------------- |
| `400`  | `"Validation failed"`                                  | Campos não atendem o schema       |
| `401`  | `"Token not provided"` / `"Invalid token"`             | Token ausente ou inválido         |
| `403`  | `"Not authorized"`                                     | Usuário não é ADMIN               |
| `404`  | `"Sector not found"`                                   | Setor não encontrado              |
| `409`  | `"Description or name is the same as the current one"` | Valores iguais aos já cadastrados |

---

### DELETE /sectors/:sector_id

Remove um setor. Não permite exclusão se houver chamados vinculados.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `SectorController.delete`
- **Service:** `DeleteSectorService`
- **Schema:** `deleteSectorSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição     |
| ----------- | ------ | ----------- | ------------- |
| `sector_id` | string | ✅          | UUID do setor |

#### Response — 200 OK

```json
{
	"message": "Sector deleted successfully"
}
```

#### Erros

| Status | Mensagem                                   | Causa                                |
| ------ | ------------------------------------------ | ------------------------------------ |
| `400`  | `"Validation failed"`                      | `sector_id` não fornecido            |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido            |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN                  |
| `404`  | `"Sector not found"`                       | Setor não encontrado                 |
| `409`  | `"Cannot delete sector with tickets"`      | Existem chamados vinculados ao setor |

---

### PATCH /sectors/:sector_id/status/:status

Altera o status de um setor entre `ACTIVE` e `INACTIVE`. Ao inativar, todas as categorias do setor também são inativadas.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `SectorController.toggleStatus`
- **Service:** `ToggleStatusService`
- **Schema:** `toggleStatusSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Valores                | Descrição   |
| ----------- | ------ | ----------- | ---------------------- | ----------- |
| `sector_id` | string | ✅          | UUID válido            | ID do setor |
| `status`    | string | ✅          | `ACTIVE` ou `INACTIVE` | Novo status |

#### Response — 200 OK

```json
{
	"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"name": "SUPORTE TI",
	"description": "Setor responsável pelo suporte técnico",
	"status": "INACTIVE",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T14:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                             | Causa                                    |
| ------ | ---------------------------------------------------- | ---------------------------------------- |
| `400`  | `"Validation failed"`                                | Parâmetros inválidos ou ausentes         |
| `401`  | `"Token not provided"` / `"Invalid token"`           | Token ausente ou inválido                |
| `403`  | `"Not authorized"`                                   | Usuário não é ADMIN                      |
| `404`  | `"Sector not found"`                                 | Setor não encontrado                     |
| `409`  | `"Sector is already in the desired status"`          | Status já é o solicitado                 |
| `409`  | `"Cannot change status of sector with open tickets"` | Há chamados OPEN ou IN_PROGRESS no setor |

---

## 📂 Categorias

---

### POST /categories

Cria uma nova categoria de chamados vinculada a um setor.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `CategoryController.create`
- **Service:** `CreateCategoryService`
- **Schema:** `createCategorySchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body

```json
{
	"name": "Hardware",
	"priority": "HIGH",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

| Campo       | Tipo   | Obrigatório | Validação                 | Descrição             |
| ----------- | ------ | ----------- | ------------------------- | --------------------- |
| `name`      | string | ✅          | Min. 1 caractere          | Nome da categoria     |
| `priority`  | string | ✅          | `LOW`, `MEDIUM` ou `HIGH` | Prioridade do chamado |
| `sector_id` | string | ✅          | Min. 1 caractere          | UUID do setor ativo   |

> **Nota:** O nome é normalizado para UPPER antes de salvar. `"hardware"` → `"HARDWARE"`

#### Response — 201 Created

```json
{
	"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"name": "HARDWARE",
	"priority": "HIGH",
	"status": "ACTIVE",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                   | Causa                                      |
| ------ | ------------------------------------------ | ------------------------------------------ |
| `400`  | `"Validation failed"`                      | Campos não atendem o schema                |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido                  |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN                        |
| `404`  | `"Sector not found or inactive"`           | Setor não encontrado ou inativo            |
| `409`  | `"Category already exists"`                | Categoria com esse nome já existe no setor |

---

### GET /categories

Lista categorias com filtro obrigatório por status e opcional por setor.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `CategoryController.list`
- **Service:** `ListCategoryService`
- **Schema:** `listCategorySchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parâmetro   | Tipo   | Obrigatório | Padrão | Descrição                             |
| ----------- | ------ | ----------- | ------ | ------------------------------------- |
| `status`    | string | ✅          | —      | `ACTIVE` ou `INACTIVE`                |
| `sector_id` | string | ❌          | —      | UUID do setor para filtrar (opcional) |

#### Exemplo de Requisição

```
GET /categories?status=ACTIVE&sector_id=c3d4e5f6-a7b8-9012-cdef-123456789012
```

#### Response — 200 OK

```json
[
	{
		"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
		"name": "HARDWARE",
		"priority": "HIGH",
		"status": "ACTIVE",
		"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
		"created_at": "2026-04-26T10:00:00.000Z",
		"updated_at": "2026-04-26T10:00:00.000Z",
		"Sector": {
			"id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
			"name": "SUPORTE TI",
			"description": "Setor responsável pelo suporte técnico",
			"status": "ACTIVE"
		}
	}
]
```

#### Erros

| Status | Mensagem                                   | Causa                        |
| ------ | ------------------------------------------ | ---------------------------- |
| `400`  | `"Validation failed"`                      | `status` inválido ou ausente |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido    |

---

### GET /categories/:category_id

Retorna os detalhes de uma categoria específica.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `CategoryController.detail`
- **Service:** `DetailCategoryService`
- **Schema:** `detailCategorySchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro     | Tipo   | Obrigatório | Descrição         |
| ------------- | ------ | ----------- | ----------------- |
| `category_id` | string | ✅          | UUID da categoria |

#### Response — 200 OK

```json
{
	"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"name": "HARDWARE",
	"priority": "HIGH",
	"status": "ACTIVE",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                   | Causa                       |
| ------ | ------------------------------------------ | --------------------------- |
| `400`  | `"Validation failed"`                      | `category_id` não fornecido |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido   |
| `404`  | `"Category not found"`                     | Categoria não encontrada    |

---

### PUT /categories/:category_id

Atualiza os dados de uma categoria existente.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `CategoryController.update`
- **Service:** `UpdateCategoryService`
- **Schema:** `updateCategorySchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro     | Tipo   | Obrigatório | Descrição         |
| ------------- | ------ | ----------- | ----------------- |
| `category_id` | string | ✅          | UUID da categoria |

#### Request Body

```json
{
	"name": "Software",
	"priority": "MEDIUM"
}
```

| Campo       | Tipo   | Obrigatório | Validação                       | Descrição               |
| ----------- | ------ | ----------- | ------------------------------- | ----------------------- |
| `name`      | string | ❌          | Min. 1 caractere (se fornecido) | Novo nome da categoria  |
| `priority`  | string | ❌          | `LOW`, `MEDIUM` ou `HIGH`       | Nova prioridade         |
| `sector_id` | string | ❌          | Min. 1 caractere (se fornecido) | Novo setor da categoria |

#### Response — 200 OK

```json
{
	"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"name": "SOFTWARE",
	"priority": "MEDIUM",
	"status": "ACTIVE",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T12:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                   | Causa                                     |
| ------ | ------------------------------------------ | ----------------------------------------- |
| `400`  | `"Validation failed"`                      | Campos não atendem o schema               |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido                 |
| `403`  | `"Not authorized"`                         | Usuário não é ADMIN                       |
| `404`  | `"Category not found"`                     | Categoria não encontrada no setor         |
| `409`  | `"Category with this name already exists"` | Nome já existe em outro registro do setor |

---

### DELETE /categories/:category_id

Remove uma categoria. Não permite exclusão se houver chamados vinculados.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `CategoryController.delete`
- **Service:** `DeleteCategoryService`
- **Schema:** `deleteCategorySchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro     | Tipo   | Obrigatório | Descrição         |
| ------------- | ------ | ----------- | ----------------- |
| `category_id` | string | ✅          | UUID da categoria |

#### Response — 200 OK

```json
{
	"message": "Category deleted successfully"
}
```

#### Erros

| Status | Mensagem                                           | Causa                                   |
| ------ | -------------------------------------------------- | --------------------------------------- |
| `400`  | `"Validation failed"`                              | `category_id` não fornecido             |
| `401`  | `"Token not provided"` / `"Invalid token"`         | Token ausente ou inválido               |
| `403`  | `"Not authorized"`                                 | Usuário não é ADMIN                     |
| `404`  | `"Category not found"`                             | Categoria não encontrada                |
| `409`  | `"Cannot delete category with associated tickets"` | Existem chamados vinculados à categoria |

---

### PATCH /categories/:category_id/status/:status

Altera o status de uma categoria entre `ACTIVE` e `INACTIVE`.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN
- **Controller:** `CategoryController.toggleStatus`
- **Service:** `ToggleStatusService`
- **Schema:** `toggleStatusSchema`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro     | Tipo   | Obrigatório | Valores                | Descrição       |
| ------------- | ------ | ----------- | ---------------------- | --------------- |
| `category_id` | string | ✅          | UUID válido            | ID da categoria |
| `status`      | string | ✅          | `ACTIVE` ou `INACTIVE` | Novo status     |

#### Response — 200 OK

```json
{
	"id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"name": "HARDWARE",
	"priority": "HIGH",
	"status": "INACTIVE",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T15:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                      | Causa                     |
| ------ | --------------------------------------------- | ------------------------- |
| `400`  | `"Validation failed"`                         | Parâmetros inválidos      |
| `401`  | `"Token not provided"` / `"Invalid token"`    | Token ausente ou inválido |
| `403`  | `"Not authorized"`                            | Usuário não é ADMIN       |
| `404`  | `"Category not found"`                        | Categoria não encontrada  |
| `409`  | `"Category is already in the desired status"` | Status já é o solicitado  |

---

## 🎫 Chamados

---

### POST /tickets

Cria um novo chamado. Aceita múltiplos arquivos anexados (imagens e documentos).

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `TicketController.create`
- **Service:** `CreateTicketService`
- **Schema:** `createTicketSchema`
- **Upload:** `multer.array("files")` — campo `files` no form-data (opcional)

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

#### Request Body (form-data)

| Campo         | Tipo   | Obrigatório | Validação           | Descrição                       |
| ------------- | ------ | ----------- | ------------------- | ------------------------------- |
| `title`       | string | ✅          | Min. 1 caractere    | Título do chamado               |
| `description` | string | ✅          | Min. 1 caractere    | Descrição detalhada do problema |
| `sector_id`   | string | ✅          | Min. 1 caractere    | UUID do setor responsável       |
| `category_id` | string | ✅          | Min. 1 caractere    | UUID da categoria do chamado    |
| `files`       | file[] | ❌          | Max 5MB por arquivo | Anexos: JPEG, PNG, PDF, DOCX    |

#### Response — 201 Created

```json
{
	"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
	"ticket_number": 42,
	"title": "Computador não liga",
	"description": "O computador da recepção não liga desde ontem",
	"resolution": null,
	"status": "OPEN",
	"user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"category_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"assigned_to": null,
	"started_at": null,
	"closed_at": null,
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T10:00:00.000Z"
}
```

> Quando arquivos são enviados, os anexos são salvos no banco e retornados junto ao chamado.

#### Erros

| Status | Mensagem                                   | Causa                       |
| ------ | ------------------------------------------ | --------------------------- |
| `400`  | `"Validation failed"`                      | Campos não atendem o schema |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido   |
| `404`  | `"User not found"`                         | Usuário do token não existe |
| `404`  | `"Category not found"`                     | Categoria não encontrada    |

---

### GET /tickets/me

Lista todos os chamados abertos pelo usuário autenticado.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER
- **Controller:** `TicketController.listByUser`
- **Service:** `ListTicketByUserService`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response — 200 OK

```json
[
	{
		"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
		"ticket_number": 42,
		"title": "Computador não liga",
		"description": "O computador da recepção não liga desde ontem",
		"status": "OPEN",
		"user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
		"category_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
		"created_at": "2026-04-26T10:00:00.000Z",
		"ticketAttachments": [],
		"Sector": { "id": "...", "name": "SUPORTE TI" },
		"Category": { "id": "...", "name": "HARDWARE", "priority": "HIGH" },
		"User": { "name": "João Silva", "email": "joao@empresa.com" },
		"AssignedUser": null
	}
]
```

> Ordenado por `ticket_number` em ordem crescente.

#### Erros

| Status | Mensagem                                   | Causa                     |
| ------ | ------------------------------------------ | ------------------------- |
| `401`  | `"Token not provided"` / `"Invalid token"` | Token ausente ou inválido |

---

### GET /tickets/:ticket_id

Retorna os detalhes de um chamado específico com seus anexos.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER (somente do setor do chamado ou quem abriu)
- **Controller:** `TicketController.detail`
- **Service:** `DetailTicketService`
- **Schema:** `detailTicketSchema`
- **Middleware extra:** `loadUserSector`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição       |
| ----------- | ------ | ----------- | --------------- |
| `ticket_id` | string | ✅          | UUID do chamado |

#### Response — 200 OK

```json
{
	"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
	"ticket_number": 42,
	"title": "Computador não liga",
	"description": "O computador da recepção não liga desde ontem",
	"resolution": null,
	"status": "IN_PROGRESS",
	"user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"category_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"assigned_to": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
	"started_at": "2026-04-26T11:00:00.000Z",
	"closed_at": null,
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T11:00:00.000Z",
	"ticketAttachments": [
		{
			"id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
			"url": "https://res.cloudinary.com/.../relatorio.pdf",
			"name": "relatorio",
			"mime_type": "application/pdf",
			"size": 204800,
			"public_id": "e5f6a7b8_relatorio-1745661600000",
			"ticket_id": "e5f6a7b8-c9d0-1234-efab-345678901234"
		}
	]
}
```

#### Erros

| Status | Mensagem                                                   | Causa                             |
| ------ | ---------------------------------------------------------- | --------------------------------- |
| `400`  | `"Validation failed"`                                      | `ticket_id` não fornecido         |
| `401`  | `"Token not provided"` / `"Invalid token"`                 | Token ausente ou inválido         |
| `403`  | `"User does not have a sector assigned"`                   | Usuário sem setor no token        |
| `403`  | `"User does not belong to the same sector as the ticket."` | Usuário não tem acesso ao chamado |
| `404`  | `"Ticket not found"`                                       | Chamado não encontrado            |

---

### GET /tickets

Lista chamados com paginação e filtros. A visibilidade depende do papel do usuário.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN (todos os chamados), USER (apenas do seu setor)
- **Controller:** `TicketController.list`
- **Service:** `ListTicketService`
- **Schema:** `listTicketSchema`
- **Middleware extra:** `loadUserSector`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parâmetro     | Tipo   | Obrigatório | Padrão | Descrição                                                    |
| ------------- | ------ | ----------- | ------ | ------------------------------------------------------------ |
| `page`        | number | ❌          | `1`    | Página da listagem (mínimo 1)                                |
| `limit`       | number | ❌          | `10`   | Itens por página (mínimo 1)                                  |
| `everySector` | string | ❌          | —      | `"true"` para ADMIN listar todos os setores                  |
| `sector_id`   | string | ❌          | —      | UUID do setor específico (ADMIN pode filtrar por setor)      |
| `status`      | string | ❌          | —      | `OPEN`, `IN_PROGRESS` ou `CLOSED` (CLOSED apenas para ADMIN) |

> **Padrão sem filtro de status:** retorna apenas chamados `OPEN` e `IN_PROGRESS`.

#### Exemplo de Requisição

```
GET /tickets?page=1&limit=10&status=OPEN
GET /tickets?page=2&limit=5&sector_id=uuid&everySector=true
```

#### Response — 200 OK

```json
{
	"data": [
		{
			"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
			"ticket_number": 42,
			"title": "Computador não liga",
			"status": "OPEN",
			"created_at": "2026-04-26T10:00:00.000Z",
			"ticketAttachments": [],
			"Sector": { "id": "...", "name": "SUPORTE TI" },
			"User": { "name": "João Silva", "email": "joao@empresa.com" },
			"AssignedUser": null
		}
	],
	"meta": {
		"total": 1,
		"page": 1,
		"limit": 10,
		"totalpages": 1
	}
}
```

#### Erros

| Status | Mensagem                                    | Causa                                   |
| ------ | ------------------------------------------- | --------------------------------------- |
| `400`  | `"Validation failed"`                       | Query params inválidos                  |
| `400`  | `"Page must be at least 1"`                 | Página menor que 1                      |
| `400`  | `"Limit must be at least 1"`                | Limite menor que 1                      |
| `401`  | `"Token not provided"` / `"Invalid token"`  | Token ausente ou inválido               |
| `403`  | `"User does not have a sector assigned"`    | Usuário sem setor no token              |
| `403`  | `"User without sector"`                     | USER sem setor tentando listar          |
| `403`  | `"Unauthorized to filter by CLOSED status"` | USER tentando filtrar por status CLOSED |

---

### PUT /tickets/assign/:ticket_id

Atribui um chamado ao usuário autenticado, iniciando o atendimento.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER (do mesmo setor do chamado)
- **Controller:** `TicketController.assign`
- **Service:** `AssignedTicketService`
- **Schema:** `assignTicketSchema`
- **Middleware extra:** `loadUserSector`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição       |
| ----------- | ------ | ----------- | --------------- |
| `ticket_id` | string | ✅          | UUID do chamado |

#### Response — 200 OK

```json
{
	"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
	"ticket_number": 42,
	"title": "Computador não liga",
	"status": "IN_PROGRESS",
	"assigned_to": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
	"started_at": "2026-04-26T11:00:00.000Z",
	"ticketAttachments": [],
	"AssignedUser": {
		"name": "Maria Técnica"
	}
}
```

#### Erros

| Status | Mensagem                                                         | Causa                             |
| ------ | ---------------------------------------------------------------- | --------------------------------- |
| `400`  | `"Validation failed"`                                            | `ticket_id` não fornecido         |
| `401`  | `"Token not provided"` / `"Invalid token"`                       | Token ausente ou inválido         |
| `403`  | `"User does not have a sector assigned"`                         | Usuário sem setor no token        |
| `403`  | `"User does not belong to the same sector as the ticket."`       | Usuário de outro setor            |
| `403`  | `"It cannot be attributed to the person who opened the ticket."` | Quem abriu não pode se atribuir   |
| `404`  | `"Ticket not found"`                                             | Chamado não encontrado            |
| `409`  | `"Ticket is already assigned to another user or status closed"`  | Chamado já atribuído ou encerrado |

---

### PUT /tickets/close/:ticket_id

Encerra um chamado com uma resolução obrigatória.

- **Autenticação:** ✅ Requerida
- **Permissão:** ADMIN, USER (apenas quem está atribuído ao chamado)
- **Controller:** `TicketController.close`
- **Service:** `CloseTicketService`
- **Schema:** `closeTicketSchema`
- **Middleware extra:** `loadUserSector`

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters

| Parâmetro   | Tipo   | Obrigatório | Descrição       |
| ----------- | ------ | ----------- | --------------- |
| `ticket_id` | string | ✅          | UUID do chamado |

#### Request Body

```json
{
	"resolution": "Troca da fonte de alimentação do computador. Problema resolvido."
}
```

| Campo        | Tipo   | Obrigatório | Validação        | Descrição                         |
| ------------ | ------ | ----------- | ---------------- | --------------------------------- |
| `resolution` | string | ✅          | Min. 1 caractere | Descrição da resolução do chamado |

#### Response — 200 OK

```json
{
	"id": "e5f6a7b8-c9d0-1234-efab-345678901234",
	"ticket_number": 42,
	"title": "Computador não liga",
	"description": "O computador da recepção não liga desde ontem",
	"resolution": "Troca da fonte de alimentação do computador. Problema resolvido.",
	"status": "CLOSED",
	"user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"sector_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
	"category_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
	"assigned_to": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
	"started_at": "2026-04-26T11:00:00.000Z",
	"closed_at": "2026-04-26T16:00:00.000Z",
	"created_at": "2026-04-26T10:00:00.000Z",
	"updated_at": "2026-04-26T16:00:00.000Z"
}
```

#### Erros

| Status | Mensagem                                                   | Causa                                    |
| ------ | ---------------------------------------------------------- | ---------------------------------------- |
| `400`  | `"Validation failed"`                                      | Campos não atendem o schema              |
| `401`  | `"Token not provided"` / `"Invalid token"`                 | Token ausente ou inválido                |
| `403`  | `"User does not have a sector assigned"`                   | Usuário sem setor no token               |
| `403`  | `"User does not belong to the same sector as the ticket."` | Usuário de outro setor                   |
| `403`  | `"You are not authorized to close this ticket"`            | Usuário não é o responsável pelo chamado |
| `404`  | `"Ticket not found"`                                       | Chamado não encontrado                   |
| `409`  | `"Ticket is already closed"`                               | Chamado já foi encerrado                 |

---

## 📊 Códigos de Status

| Código | Significado           | Quando ocorre                                   |
| ------ | --------------------- | ----------------------------------------------- |
| `200`  | OK                    | Operação de leitura ou atualização bem-sucedida |
| `201`  | Created               | Recurso criado com sucesso                      |
| `400`  | Bad Request           | Erro de validação (Zod) ou regra de negócio     |
| `401`  | Unauthorized          | Token ausente, inválido ou expirado             |
| `403`  | Forbidden             | Permissão insuficiente ou acesso negado         |
| `404`  | Not Found             | Recurso não encontrado no banco de dados        |
| `409`  | Conflict              | Conflito de dados (duplicata, estado inválido)  |
| `429`  | Too Many Requests     | Rate limit atingido (100 req/15min por IP)      |
| `500`  | Internal Server Error | Erro inesperado no servidor                     |
