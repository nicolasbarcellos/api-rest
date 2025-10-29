# Daily Diet API

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Fastify](https://img.shields.io/badge/Fastify-5.6-black)
![License](https://img.shields.io/badge/License-ISC-yellow)

API REST para controle de dieta diária, permitindo que usuários registrem suas refeições e acompanhem seu progresso alimentar.

## Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Documentação da API](#documentação-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelos de Dados](#modelos-de-dados)
- [Deploy em Produção](#deploy-em-produção)
- [Segurança](#segurança)
- [Melhorias Futuras](#melhorias-futuras)

## Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Fastify** - Framework web de alta performance
- **Prisma** - ORM para Node.js e TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização do banco de dados
- **Zod** - Validação de schemas e tipos
- **bcryptjs** - Criptografia de senhas
- **AWS SES** - Envio de emails de verificação
- **Swagger/OpenAPI** - Documentação interativa da API

## Funcionalidades

### Autenticação e Usuários
- Criar conta de usuário com verificação por email
- Sistema de código de verificação (6 dígitos)
- Reenvio de código de verificação
- Login com sessão via cookies
- Proteção de rotas com autenticação

### Refeições
- Listar todas as refeições do usuário autenticado
- Criar nova refeição com informações:
  - Nome
  - Descrição (opcional)
  - Data e hora
  - Se está dentro ou fora da dieta
- Visualizar refeição específica
- Editar refeição existente
- Deletar refeição

### Métricas
- Total de refeições registradas
- Total de refeições dentro da dieta
- Total de refeições fora da dieta
- Melhor sequência de refeições dentro da dieta

## Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose (recomendado para PostgreSQL)
- Conta AWS com SES configurado (para emails de verificação)

## Instalação

### 1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd "Criando API REST com Node.js"
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Configure o banco de dados com Docker:
```bash
docker-compose up -d
```

Isso iniciará um container PostgreSQL em `localhost:5432`

### 4. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://postgres:docker@localhost:5432/apidb"
PORT=3002
ADMIN_API_KEY=sua-chave-secreta

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_SES_FROM_EMAIL=seu-email@verificado.com
```

### 5. Execute as migrations do Prisma:
```bash
npx prisma migrate deploy
```

### 6. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3002`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript e gera Prisma Client
- `npm start` - Inicia o servidor em produção (JavaScript compilado)
- `npm run start:prod` - Executa migrations e inicia em produção

## Documentação da API

A documentação interativa está disponível em:
- Swagger UI: `http://localhost:3002/docs`

### Endpoints Principais

#### Health Check

**GET /health**
- Verifica status da API
- Público (sem autenticação)
- Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-29T10:00:00.000Z",
  "uptime": "2 hours, 30 minutes"
}
```

#### Usuários

**POST /users**
- Cria novo usuário
- Body: `{ name, email, password }`
- Envia código de verificação por email

**POST /users/verify**
- Verifica email com código de 6 dígitos
- Body: `{ email, code }`
- Retorna sessão (cookie)

**POST /users/session**
- Login de usuário
- Body: `{ email, password }`
- Retorna sessão (cookie)

**POST /users/resend-code**
- Reenvia código de verificação
- Body: `{ email }`

**GET /users**
- Lista todos os usuários (admin)
- Requer: API Key no header

#### Refeições

**GET /meals**
- Lista todas as refeições do usuário
- Requer: Autenticação (cookie)

**POST /meals**
- Cria nova refeição
- Requer: Autenticação (cookie)
- Body:
```json
{
  "name": "Café da manhã",
  "description": "Pão integral com ovos",
  "date": "2025-10-26T08:00:00.000Z",
  "isOnDiet": true
}
```

**GET /meals/:id**
- Visualiza uma refeição específica
- Requer: Autenticação (cookie)

**PUT /meals/:id**
- Edita uma refeição existente
- Requer: Autenticação (cookie)
- Body (todos os campos são opcionais):
```json
{
  "name": "Almoço",
  "description": "Frango grelhado com salada",
  "date": "2025-10-26T12:00:00.000Z",
  "isOnDiet": true
}
```

**DELETE /meals/:id**
- Deleta uma refeição
- Requer: Autenticação (cookie)

#### Métricas

**GET /metrics**
- Retorna estatísticas das refeições do usuário
- Requer: Autenticação (cookie)
- Response:
```json
{
  "metrics": {
    "totalMeals": 10,
    "mealsOnDiet": 7,
    "mealsOffDiet": 3,
    "bestStreak": 5
  }
}
```

## Estrutura do Projeto

```
src/
├── hooks/          # Hooks personalizados (validação API key)
├── middleware/     # Middlewares (autenticação)
├── plugins/        # Plugins do Fastify (CORS, Swagger)
├── routes/         # Rotas da API
│   ├── users.ts    # Rotas de usuários
│   ├── meals.ts    # Rotas de refeições (CRUD completo)
│   ├── metrics.ts  # Rotas de métricas
│   └── health.ts   # Health check
├── schemas/        # Schemas de validação Zod
├── types/          # Tipos TypeScript customizados
├── utils/          # Funções utilitárias
│   ├── generateCode.ts  # Gera código de verificação
│   ├── sendEmail.ts     # Envio de emails (AWS SES)
│   └── formatUpTime.ts  # Formata uptime do servidor
└── server.ts       # Configuração do servidor
prisma/
├── schema.prisma   # Schema do banco de dados
└── migrations/     # Migrations do banco
docker-compose.yml  # Container PostgreSQL
```

## Modelos de Dados

### User
```prisma
model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  password         String
  emailVerified    Boolean   @default(false)
  verificationCode String?
  codeExpiresAt    DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  meals            Meal[]
}
```

### Meal
```prisma
model Meal {
  id          String   @id @default(cuid())
  name        String
  description String?
  date        DateTime
  isOnDiet    Boolean
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}
```

## Deploy em Produção

### Railway (Recomendado)

1. **Faça push do código para GitHub**

2. **Crie conta no Railway**: https://railway.app/

3. **Crie novo projeto**:
   - Deploy from GitHub repo
   - Selecione seu repositório

4. **Adicione PostgreSQL**:
   - New → Database → PostgreSQL

5. **Configure variáveis de ambiente no Backend**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ADMIN_API_KEY=sua-chave
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=sua-key
   AWS_SECRET_ACCESS_KEY=sua-secret
   AWS_SES_FROM_EMAIL=seu-email
   ```

6. **Configure Build e Start Commands**:
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`

7. **Gere domínio público**:
   - Settings → Generate Domain
   - Sua API estará disponível em: `https://seu-projeto.up.railway.app`

### Outras opções
- **Render**: Deploy gratuito com limitações
- **Fly.io**: Boa performance, requer Dockerfile
- **AWS/GCP**: Para projetos de grande escala

## Segurança

- Senhas criptografadas com bcrypt (salt rounds: 10)
- Autenticação via cookies httpOnly com sameSite
- Validação de dados com Zod em todas as rotas
- Proteção de rotas com middleware de autenticação
- Código de verificação com expiração (15 minutos)
- CORS configurável por variável de ambiente
- Proteção contra injeção SQL via Prisma ORM

## Melhorias Futuras

- [ ] Implementar logout explícito
- [ ] Adicionar refresh token
- [ ] Implementar recuperação de senha
- [ ] Adicionar paginação nas listagens
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar filtros avançados (por data, tipo de refeição)
- [ ] Adicionar upload de fotos das refeições
- [ ] Implementar notificações por email

## Autor

**Nicolas**

Desenvolvido como parte do desafio Rocketseat Node.js

## Licença

ISC
