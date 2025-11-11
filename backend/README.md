# 🍺 Stappa Backend API

Backend REST API per l'applicazione Stappa - Sistema di tracciamento consumazioni con QR code e loyalty program.

## 🚀 Stack Tecnologico

- **Node.js** + **Express** - Web framework
- **PostgreSQL** - Database relazionale
- **Prisma ORM** - Database toolkit
- **JWT** - Autenticazione
- **bcryptjs** - Password hashing
- **Multer** - File upload

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- [Node.js](https://nodejs.org/) (v18 o superiore)
- [PostgreSQL](https://www.postgresql.org/) (v14 o superiore)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Installazione PostgreSQL su Windows

1. Scarica PostgreSQL da: https://www.postgresql.org/download/windows/
2. Installa con le impostazioni di default
3. Durante l'installazione, ricorda la password per l'utente `postgres`
4. Dopo l'installazione, crea il database:

```bash
# Apri pgAdmin o SQL Shell (psql)
CREATE DATABASE stappa_db;
```

### Tool per Gestire il Database

**Consigliati per Windows:**
- **TablePlus**: https://tableplus.com/ (Gratuito per uso personale)
- **DBeaver**: https://dbeaver.io/ (Gratuito e open source)
- **SQL Server Management Studio**: Supporta PostgreSQL tramite ODBC
- **pgAdmin 4**: Incluso con PostgreSQL

---

## 🛠️ Setup Progetto

### 1. Installazione Dipendenze

```bash
cd backend
npm install
```

### 2. Configurazione Database

Modifica il file `.env` con le tue credenziali PostgreSQL:

```env
# Se hai installato PostgreSQL con password diversa:
DATABASE_URL="postgresql://postgres:TUA_PASSWORD@localhost:5432/stappa_db?schema=public"

# Esempio:
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/stappa_db?schema=public"
```

### 3. Genera Prisma Client e Crea Tabelle

```bash
# Genera il Prisma Client
npm run db:generate

# Crea le tabelle nel database
npm run db:push
```

### 4. Popola il Database con Dati di Test

```bash
npm run db:seed
```

Questo creerà:
- ✅ 1 utente ROOT admin
- ✅ 5 establishments di test
- ✅ 3 senior merchants
- ✅ 2 merchants base
- ✅ 3 utenti regolari
- ✅ 3 promo attive
- ✅ Dati di esempio (progress, validations)

### 5. Avvia il Server

```bash
# Modalità development (con auto-reload)
npm run dev

# Modalità production
npm start
```

Il server sarà disponibile su: **http://localhost:3000**

---

## 🗄️ Esplorare il Database

### Opzione 1: Prisma Studio (Consigliato)

```bash
npm run db:studio
```

Apre un'interfaccia web su http://localhost:5555 dove puoi:
- Visualizzare tutte le tabelle
- Modificare i dati
- Filtrare e cercare
- Creare nuovi record

### Opzione 2: TablePlus

1. Scarica e installa TablePlus
2. Crea nuova connessione PostgreSQL
3. Inserisci:
   - **Host**: localhost
   - **Port**: 5432
   - **User**: postgres
   - **Password**: (la tua password)
   - **Database**: stappa_db
4. Connetti!

### Opzione 3: DBeaver

1. Scarica e installa DBeaver
2. New Database Connection → PostgreSQL
3. Inserisci le credenziali
4. Test Connection → Finish

---

## 📚 Struttura Database

### Tabelle Principali

| Tabella | Descrizione |
|---------|-------------|
| `User` | Utenti (USER, MERCHANT, SENIOR_MERCHANT, ROOT) |
| `Establishment` | Bar/Locali |
| `Promo` | Promozioni attive per establishment |
| `UserProgress` | Progressione drink per utente/establishment |
| `QRCode` | QR codes generati (validation/bonus) |
| `Validation` | Storico validazioni |
| `MerchantRequest` | Richieste per diventare merchant |
| `BugReport` | Segnalazioni bug utenti |

### Relazioni

```
User ──┬──> Establishment (merchantId)
       ├──> UserProgress
       ├──> Validation
       ├──> QRCode
       ├──> MerchantRequest
       └──> BugReport

Establishment ──┬──> User (merchants)
                ├──> Promo
                ├──> UserProgress
                └──> Validation
```

---

## 🔐 Credenziali di Test

Dopo il seed, puoi usare questi account:

### ROOT Admin
- **Username**: `root`
- **Password**: `Root1234@`
- **Accesso**: Dashboard admin completa

### Senior Merchant
- **Username**: `mario_rossi`
- **Password**: `Senior1234@`
- **Establishment**: Bar Centrale
- **Accesso**: Gestione promo, team, social

### Merchant Base
- **Username**: `carlo_neri`
- **Password**: `Merchant1234@`
- **Establishment**: Bar Centrale
- **Accesso**: Solo scan QR (limitato)

### User
- **Username**: `giovanni_test`
- **Password**: `User1234@`
- **Accesso**: Dashboard utente, generazione QR

---

## 🌐 API Endpoints

### Authentication

```http
POST   /api/auth/register       # Registrazione nuovo utente
POST   /api/auth/login          # Login
GET    /api/auth/me             # Profilo utente corrente
```

### Users

```http
GET    /api/users                      # Lista tutti gli utenti (ROOT)
GET    /api/users/:userId              # Dettagli utente
PATCH  /api/users/:userId/profile      # Aggiorna profilo
POST   /api/users/:userId/favorites    # Toggle preferito
GET    /api/users/:userId/favorites    # Lista preferiti
```

### Establishments

```http
GET    /api/establishments                      # Lista establishments
GET    /api/establishments/:id                  # Dettagli establishment
POST   /api/establishments                      # Crea establishment (ROOT)
POST   /api/establishments/:id/assign-merchant  # Assegna merchant (ROOT)
PATCH  /api/establishments/:id                  # Aggiorna establishment (ROOT)
DELETE /api/establishments/:id                  # Elimina establishment (ROOT)
```

### Promos

```http
POST   /api/promos                              # Crea promo (SENIOR)
GET    /api/promos/active/:establishmentId     # Promo attiva
GET    /api/promos/establishment/:id           # Tutte le promo
PATCH  /api/promos/:id                          # Aggiorna promo (SENIOR)
DELETE /api/promos/:id                          # Elimina promo (SENIOR)
```

### QR Codes

```http
POST   /api/qr/generate/validation    # Genera QR validazione
POST   /api/qr/generate/bonus         # Genera QR bonus
POST   /api/qr/scan                   # Scansiona QR (MERCHANT)
GET    /api/qr/progress               # Ottieni progressione
```

### Validations

```http
GET    /api/validations                            # Tutte le validazioni (ROOT)
GET    /api/validations/user/:userId               # Validazioni utente
GET    /api/validations/establishment/:id          # Validazioni establishment (MERCHANT)
```

### Merchant Requests

```http
POST   /api/merchant-requests                  # Crea richiesta
GET    /api/merchant-requests                  # Lista richieste (ROOT)
GET    /api/merchant-requests/my-requests     # Mie richieste
POST   /api/merchant-requests/:id/approve     # Approva (ROOT)
POST   /api/merchant-requests/:id/reject      # Rifiuta (ROOT)
```

### Bug Reports

```http
POST   /api/bug-reports              # Crea bug report (con upload)
GET    /api/bug-reports              # Lista bug reports (ROOT)
GET    /api/bug-reports/my-reports  # Miei bug reports
PATCH  /api/bug-reports/:id          # Aggiorna stato (ROOT)
DELETE /api/bug-reports/:id          # Elimina (ROOT)
```

---

## 🧪 Testare le API

### Opzione 1: cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"Root1234@"}'

# Ottieni establishments (con token)
curl -X GET http://localhost:3000/api/establishments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Opzione 2: Thunder Client (VS Code Extension)

1. Installa l'estensione "Thunder Client"
2. Crea una nuova request
3. Imposta URL e headers
4. Invia!

### Opzione 3: Postman

1. Scarica Postman
2. Importa la collection (se disponibile)
3. Testa gli endpoints

---

## 🔧 Script Disponibili

```bash
npm run dev          # Avvia server in modalità development
npm start            # Avvia server in modalità production
npm run db:generate  # Genera Prisma Client
npm run db:push      # Applica schema al database
npm run db:migrate   # Crea migration
npm run db:seed      # Popola database con dati di test
npm run db:studio    # Apri Prisma Studio
```

---

## 📝 Variabili d'Ambiente

File `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/stappa_db?schema=public"

# JWT Secret (CAMBIARE IN PRODUZIONE!)
JWT_SECRET="stappa_super_secret_key_change_in_production_2025"

# Server
PORT=3000
NODE_ENV=development

# Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

---

## 🚀 Deploy in Produzione

### 1. Preparazione

```bash
# Installa solo dependencies di produzione
npm install --production

# Genera Prisma Client
npm run db:generate
```

### 2. Database Produzione

Usa un servizio managed:
- **Railway**: https://railway.app/ (Facile, con PostgreSQL incluso)
- **Render**: https://render.com/ (Free tier disponibile)
- **Heroku**: https://www.heroku.com/ (Con addon PostgreSQL)
- **AWS RDS**: https://aws.amazon.com/rds/

### 3. Variabili d'Ambiente Produzione

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="random_secure_string_min_32_chars"
NODE_ENV=production
PORT=3000
```

### 4. Run Migrations

```bash
npx prisma migrate deploy
```

### 5. Avvia Server

```bash
npm start
```

---

## 🐛 Troubleshooting

### Errore: "Can't connect to PostgreSQL"

**Soluzione**:
1. Verifica che PostgreSQL sia avviato
2. Controlla username/password in `.env`
3. Verifica che il database `stappa_db` esista
4. Prova a connetterti con pgAdmin

### Errore: "Prisma Client not generated"

**Soluzione**:
```bash
npm run db:generate
```

### Errore: "Port 3000 already in use"

**Soluzione**:
1. Cambia `PORT=3001` in `.env`
2. Oppure termina il processo sulla porta 3000

### Errore: "JWT malformed"

**Soluzione**:
- Verifica di aver fatto login e ottenuto il token
- Controlla che l'header Authorization sia: `Bearer YOUR_TOKEN`

---

## 📞 Supporto

Per problemi o domande:
1. Controlla la documentazione
2. Verifica i logs del server
3. Ispeziona il database con Prisma Studio

---

## 📄 Licenza

MIT License - Claudio Loreto © 2025

---

## 🎉 Next Steps

Dopo aver avviato il backend:

1. ✅ Testa le API con Thunder Client/Postman
2. ✅ Esplora il database con Prisma Studio
3. ✅ Modifica `services/api.ts` nel frontend per puntare a `http://localhost:3000`
4. ✅ Avvia l'app React Native e testa l'integrazione
5. ✅ Deploy in produzione quando pronto!

**Buon coding! 🍺**
