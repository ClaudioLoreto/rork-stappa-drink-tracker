# 🚀 Deploy Backend - Requisiti e Configurazione

Questo documento contiene **TUTTI i dati necessari** per deployare il backend su un server di produzione.

---

## 📋 Dati Richiesti dal Server

### 1. **Variabili d'Ambiente** (OBBLIGATORIE)

Questi valori devono essere configurati sul server di produzione:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Esempio Railway:
# DATABASE_URL="postgresql://postgres:XyZ123abc@containers-us-west.railway.app:5432/railway"

# Esempio Render:
# DATABASE_URL="postgresql://stappa_user:secure_password@dpg-xyz123.oregon-postgres.render.com/stappa_db"


# ============================================
# AUTENTICAZIONE
# ============================================
JWT_SECRET="tua_chiave_segreta_minimo_32_caratteri_random_secure"

# IMPORTANTE: Genera una stringa random sicura
# Usa questo comando per generarla:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


# ============================================
# SERVER
# ============================================
NODE_ENV=production
PORT=3000


# ============================================
# UPLOAD FILES (Opzionale)
# ============================================
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

---

## 🗄️ Database PostgreSQL

### Requisiti Database:

- **Versione**: PostgreSQL 14 o superiore
- **Estensioni**: Nessuna estensione speciale richiesta
- **Storage minimo**: 1GB (sufficiente per 10,000+ utenti)
- **Connessioni simultanee**: 20+ (default va bene)

### Tabelle Create Automaticamente:

Il backend usa **Prisma ORM** che crea automaticamente le tabelle. NON serve creare manualmente le tabelle.

Le tabelle create sono:
- `User` - Utenti dell'app
- `Establishment` - Bar/Locali
- `Promo` - Promozioni
- `UserProgress` - Progressi utenti
- `QRCode` - QR codes generati
- `Validation` - Storico validazioni
- `MerchantRequest` - Richieste merchant
- `BugReport` - Bug reports
- `Post`, `Story`, `Comment`, `ChatMessage` - Social features
- `Review` - Recensioni
- `Article`, `StockEntry`, `StockPhoto` - Inventory management

---

## 🔧 Comandi da Eseguire sul Server

### 1. Installare Dipendenze

```bash
cd backend
npm install --production
```

### 2. Generare Prisma Client

```bash
npx prisma generate
```

### 3. Applicare Schema al Database

```bash
npx prisma db push
```

### 4. (Opzionale) Popolare con Dati di Test

```bash
npm run db:seed
```

### 5. Avviare il Server

```bash
npm start
```

---

## 🌐 Provider Consigliati

### Opzione 1: **Railway** (CONSIGLIATO - Più Facile)

**Vantaggi:**
- ✅ PostgreSQL incluso gratuitamente
- ✅ Deploy automatico da GitHub
- ✅ SSL/HTTPS automatico
- ✅ 5$ di credito gratis al mese
- ✅ Scaling automatico

**Setup Railway:**

1. Vai su https://railway.app
2. Signup con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Seleziona: `ClaudioLoreto/rork-stappa-drink-tracker`
5. Railway rileva automaticamente il backend
6. Aggiungi PostgreSQL: "New" → "Database" → "Add PostgreSQL"
7. Railway crea automaticamente `DATABASE_URL`
8. Aggiungi le altre variabili d'ambiente:
   ```
   JWT_SECRET=<genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   NODE_ENV=production
   ```
9. Deploy automatico! 🎉

**URL finale:** `https://stappa-backend-production.up.railway.app`

---

### Opzione 2: **Render**

**Vantaggi:**
- ✅ Free tier disponibile
- ✅ PostgreSQL incluso (free tier limitato)
- ✅ SSL/HTTPS automatico
- ✅ Deploy automatico da GitHub

**Setup Render:**

1. Vai su https://render.com
2. Signup con GitHub
3. "New" → "Web Service"
4. Connetti repo: `ClaudioLoreto/rork-stappa-drink-tracker`
5. Configura:
   - **Name**: stappa-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start`
6. "New" → "PostgreSQL" → Crea database
7. Copia `DATABASE_URL` (Internal Database URL)
8. Aggiungi variabili d'ambiente nel Web Service:
   ```
   DATABASE_URL=<copia da PostgreSQL>
   JWT_SECRET=<genera stringa random>
   NODE_ENV=production
   ```
9. Deploy! 🎉

**URL finale:** `https://stappa-backend.onrender.com`

**⚠️ Nota Free Tier Render:**
- Il servizio si "addormenta" dopo 15 minuti di inattività
- Primo request dopo il sonno richiede ~30 secondi
- Considera upgrade a $7/mese per produzione seria

---

### Opzione 3: **Heroku**

**Vantaggi:**
- ✅ Popolare e stabile
- ✅ PostgreSQL addon disponibile
- ✅ CLI potente

**Svantaggi:**
- ❌ Non più free tier
- ❌ Minimo $5/mese per dyno + $5/mese per database

**Setup Heroku:**

```bash
# Installa Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Crea app
cd backend
heroku create stappa-backend

# Aggiungi PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configura variabili
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npx prisma db push

# (Opzionale) Seed database
heroku run npm run db:seed
```

**URL finale:** `https://stappa-backend.herokuapp.com`

---

## 📱 Configurare l'App per Usare il Server

### 1. Modifica `services/api-config.ts`

```typescript
// Cambia USE_MOCK_API da true a false
export const USE_MOCK_API = false;

// Imposta l'URL del tuo server
const isDevelopment = typeof window !== 'undefined' && (window as any).__DEV__;
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://TUO_URL_QUI.com'; // ⚠️ CAMBIA QUESTO!
```

**Esempi URL:**
- Railway: `https://stappa-backend-production.up.railway.app`
- Render: `https://stappa-backend.onrender.com`
- Heroku: `https://stappa-backend.herokuapp.com`

### 2. Modifica `services/api.ts`

Aggiungi all'inizio del file:

```typescript
import { USE_MOCK_API } from './api-config';
import { httpApi } from './api-http';

// Switch automatico tra MOCK e HTTP
export const api = USE_MOCK_API ? mockApi : httpApi;
```

---

## ✅ Checklist Deploy

Prima di pubblicare l'app, verifica:

- [ ] **Database creato** e accessibile
- [ ] **Variabili d'ambiente configurate** (DATABASE_URL, JWT_SECRET, NODE_ENV)
- [ ] **Backend deployato** e funzionante
- [ ] **Prisma schema applicato** (`npx prisma db push`)
- [ ] **Database popolato** con dati iniziali (almeno 1 ROOT user)
- [ ] **URL backend testato** (vai su `https://TUO_URL/api/establishments` - deve rispondere)
- [ ] **api-config.ts aggiornato** con URL produzione
- [ ] **USE_MOCK_API = false** in api-config.ts
- [ ] **App testata** con backend reale prima del build iOS

---

## 🧪 Testare il Backend

### Test 1: Health Check

```bash
curl https://TUO_URL_QUI.com/api/establishments
```

Deve rispondere con un array JSON (anche vuoto va bene).

### Test 2: Login

```bash
curl -X POST https://TUO_URL_QUI.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"Root1234@"}'
```

Deve rispondere con:
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "username": "root",
    "role": "ROOT"
  }
}
```

### Test 3: Accesso Protetto

```bash
# Usa il token ottenuto dal login
curl https://TUO_URL_QUI.com/api/users \
  -H "Authorization: Bearer TUO_TOKEN_QUI"
```

Deve rispondere con la lista utenti.

---

## 🐛 Troubleshooting

### Errore: "Can't reach database server"

**Causa**: DATABASE_URL errato o database non raggiungibile

**Soluzione**:
1. Verifica DATABASE_URL nel dashboard del provider
2. Controlla che il database sia avviato
3. Verifica le credenziali

### Errore: "Prisma Client not generated"

**Soluzione**:
```bash
npx prisma generate
```

### Errore: "Port already in use"

**Soluzione**:
Cambia PORT nelle variabili d'ambiente (Railway/Render gestiscono automaticamente)

### App non si connette al backend

**Verifica**:
1. URL in `api-config.ts` è corretto?
2. `USE_MOCK_API = false`?
3. Backend è online? (testa con curl)
4. HTTPS abilitato? (obbligatorio per app iOS)

---

## 📞 Supporto

Se hai problemi con il deploy:

1. Controlla i **logs del server** (Railway/Render hanno dashboard)
2. Verifica **variabili d'ambiente**
3. Testa **endpoints manualmente** con curl
4. Controlla che **Prisma schema sia applicato**

---

## 🎯 Riepilogo Rapido

### Cosa serve per deployare:

1. **Account su Railway/Render/Heroku**
2. **Database PostgreSQL** (creato automaticamente)
3. **Variabili d'ambiente**: DATABASE_URL, JWT_SECRET, NODE_ENV=production
4. **Deploy backend** (automatico da GitHub)
5. **Run migrations**: `npx prisma db push`
6. **Seed database**: `npm run db:seed` (opzionale)
7. **Testare** con curl
8. **Aggiornare api-config.ts** nell'app
9. **Build iOS** con EAS

**Tempo stimato:** 20-30 minuti per il primo deploy.

---

## 📄 File da Modificare nell'App

### 1. `services/api-config.ts`
```typescript
export const USE_MOCK_API = false; // ⚠️ CAMBIARE!
export const API_BASE_URL = '...'; // ⚠️ INSERIRE URL!
```

### 2. `services/api.ts` (inizio file)
```typescript
import { USE_MOCK_API } from './api-config';
import { httpApi } from './api-http';

// Switcha automaticamente
export const api = USE_MOCK_API ? mockApi : httpApi;
```

---

✅ **Tutto pronto!** Scegli il provider, deploya il backend, e torna qui per continuare con il build iOS! 🚀
