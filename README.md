# Daily Diet API

API REST para controle de dieta diária, permitindo que usuários registrem suas refeições e acompanhem seu progresso alimentar.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Fastify** - Framework web de alta performance
- **Prisma** - ORM para Node.js e TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas e tipos
- **bcryptjs** - Criptografia de senhas
- **AWS SES** - Envio de emails de verificação

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

### Em desenvolvimento
- Visualizar refeição específica
- Editar refeição
- Deletar refeição
- Métricas de progresso da dieta

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Conta AWS com SES configurado (para emails)

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd "Criando API REST com Node.js"
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/daily_diet"
PORT=3002
API_KEY=sua-chave-secreta

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
EMAIL_FROM=seu-email@verificado.com
```

4. Execute as migrations do Prisma:
```bash
npx prisma migrate dev
```

5. Gere o Prisma Client:
```bash
npx prisma generate
```

6. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3002`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em produção

## Documentação da API

A documentação interativa está disponível em:
- Swagger UI: `http://localhost:3002/docs`

### Endpoints Principais

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

## Estrutura do Projeto

```
src/
├── hooks/          # Hooks personalizados (validação API key)
├── middleware/     # Middlewares (autenticação)
├── routes/         # Rotas da API
│   ├── users.ts    # Rotas de usuários
│   ├── meals.ts    # Rotas de refeições
│   └── health.ts   # Health check
├── schemas/        # Schemas de validação Zod
├── utils/          # Funções utilitárias
│   ├── generateCode.ts  # Gera código de verificação
│   └── sendEmail.ts     # Envio de emails
├── server.ts       # Configuração do servidor
prisma/
├── schema.prisma   # Schema do banco de dados
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

## Segurança

- Senhas criptografadas com bcrypt
- Autenticação via cookies httpOnly
- Validação de dados com Zod
- Proteção de rotas com middleware
- Código de verificação com expiração (15 minutos)

## Autor

Nicolas

## Licença

ISC
