# Stappa Backend Setup Guide

## Overview

The Stappa backend is a REST API built with Node.js, Express, TypeScript, and PostgreSQL. It handles authentication, user management, establishment management, and QR code validation.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── src/
│   ├── Controllers/          # HTTP request handlers
│   │   ├── AuthController.ts
│   │   ├── EstablishmentController.ts
│   │   ├── UserController.ts
│   │   ├── QRController.ts
│   │   └── ProgressController.ts
│   ├── Services/             # Business logic layer
│   │   ├── AuthService.ts
│   │   ├── EstablishmentService.ts
│   │   ├── UserService.ts
│   │   ├── QRService.ts
│   │   └── ProgressService.ts
│   ├── Repositories/         # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── EstablishmentRepository.ts
│   │   ├── ProgressRepository.ts
│   │   └── ValidationRepository.ts
│   ├── Dtos/                 # Data Transfer Objects
│   │   ├── AuthDto.ts
│   │   ├── EstablishmentDto.ts
│   │   ├── UserDto.ts
│   │   └── QRDto.ts
│   ├── Middleware/           # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── roleMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── Utils/                # Utility functions
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── validation.ts
│   ├── routes.ts             # API routes
│   └── server.ts             # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Database seeding script
├── .env.example              # Environment variables template
├── package.json
└── tsconfig.json
```

## Installation Steps

### 1. Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### 2. Create Backend Directory

```bash
mkdir backend
cd backend
```

### 3. Initialize Node.js Project

```bash
npm init -y
```

### 4. Install Dependencies

```bash
# Core dependencies
npm install express cors dotenv bcryptjs jsonwebtoken
npm install @prisma/client

# Development dependencies
npm install -D typescript @types/node @types/express @types/cors
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon prisma
```

### 5. Setup TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 6. Setup Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stappa"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:8081,http://localhost:19006"
```

### 7. Initialize Prisma

```bash
npx prisma init
```

### 8. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

## Database Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ROOT
  MERCHANT
  USER
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  role         UserRole @default(USER)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  establishments EstablishmentUser[]
  progress       UserProgress[]
  validations    DrinkValidation[]
  auditLogs      AuditLog[]

  @@map("users")
}

model Establishment {
  id        String   @id @default(uuid())
  name      String
  address   String
  status    UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users       EstablishmentUser[]
  progress    UserProgress[]
  validations DrinkValidation[]

  @@map("establishments")
}

model EstablishmentUser {
  id              String   @id @default(uuid())
  establishmentId String
  userId          String
  role            UserRole
  createdAt       DateTime @default(now())

  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([establishmentId, userId])
  @@map("establishment_users")
}

model UserProgress {
  id              String   @id @default(uuid())
  userId          String
  establishmentId String
  drinksCount     Int      @default(0)
  updatedAt       DateTime @updatedAt

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)

  @@unique([userId, establishmentId])
  @@map("user_progress")
}

enum ValidationType {
  VALIDATION
  BONUS
}

model DrinkValidation {
  id              String         @id @default(uuid())
  userId          String
  establishmentId String
  type            ValidationType
  qrToken         String         @unique
  expiresAt       DateTime
  validatedAt     DateTime?
  createdAt       DateTime       @default(now())

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)

  @@map("drink_validations")
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String
  action    String
  meta      Json?
  createdAt DateTime @default(now())

  actor User @relation(fields: [actorId], references: [id], onDelete: Cascade)

  @@map("audit_logs")
}
```

## Database Seeding

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create root admin user
  const passwordHash = await bcrypt.hash('root1234@', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'root' },
    update: {},
    create: {
      username: 'root',
      email: 'root@stappa.com',
      passwordHash,
      role: 'ROOT',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created:', admin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Running the Backend

### 1. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 2. Seed Database

```bash
npm run prisma:seed
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Admin (ROOT only)
- `POST /api/establishments` - Create establishment
- `GET /api/establishments` - List all establishments
- `POST /api/establishments/:id/assign-merchant` - Assign merchant to establishment
- `GET /api/users` - List all users
- `GET /api/users/search?q=query` - Search users

### Merchant
- `POST /api/qr/validate` - Validate QR code

### User
- `POST /api/qr/generate` - Generate QR code (validation or bonus)
- `GET /api/progress` - Get user progress

## Default Credentials

**Admin Account:**
- Username: `root`
- Password: `root1234@`

## Security Notes

1. Change `JWT_SECRET` in production
2. Use strong passwords
3. Enable HTTPS in production
4. Configure CORS properly
5. Implement rate limiting
6. Add request validation
7. Use environment-specific configs

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Migration Errors
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Prisma Client Issues
```bash
npx prisma generate
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
