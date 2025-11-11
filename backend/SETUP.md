# 🚀 Guida Rapida - Setup Backend Stappa

## ⚠️ IMPORTANTE: Segui questi passaggi in ordine!

---

## Passo 1️⃣: Installa PostgreSQL

### Su Windows:

1. **Scarica PostgreSQL**:
   - Vai su: https://www.postgresql.org/download/windows/
   - Scarica l'installer (raccomandato versione 15 o 16)

2. **Installa PostgreSQL**:
   - Esegui l'installer
   - **IMPORTANTE**: Durante l'installazione ti chiederà una password per l'utente `postgres`
   - **Memorizza questa password!** (es: `postgres` o `admin123`)
   - Porta di default: `5432` (lascia così)
   - Installa anche **pgAdmin 4** e **Stack Builder** (inclusi)

3. **Verifica installazione**:
   - Cerca "pgAdmin 4" nel menu Start
   - Apri pgAdmin 4
   - Ti chiederà la password che hai impostato
   - Se si apre correttamente, PostgreSQL è installato! ✅

---

## Passo 2️⃣: Crea il Database

### Opzione A: Usando pgAdmin 4 (GUI - più facile)

1. Apri **pgAdmin 4**
2. Nel pannello sinistro, espandi:
   - Servers
   - PostgreSQL 15 (o la tua versione)
   - Inserisci la password di postgres
3. Click destro su **"Databases"** → **Create** → **Database...**
4. Nel form:
   - **Database**: `stappa_db`
   - **Owner**: `postgres`
5. Click **Save**
6. Dovresti vedere `stappa_db` nella lista dei database ✅

### Opzione B: Usando SQL Shell (psql)

1. Cerca "SQL Shell (psql)" nel menu Start
2. Apri SQL Shell
3. Premi INVIO per tutte le domande (usa i default)
4. Inserisci la password di postgres quando richiesto
5. Esegui questo comando:

```sql
CREATE DATABASE stappa_db;
```

6. Verifica che sia stato creato:

```sql
\l
```

Dovresti vedere `stappa_db` nella lista! ✅

---

## Passo 3️⃣: Configura il Backend

1. **Apri il file `.env`** nella cartella `backend/`:
   ```
   backend/.env
   ```

2. **Modifica la riga `DATABASE_URL`** con la TUA password di PostgreSQL:

   ```env
   # Esempio - sostituisci "postgres" con la TUA password!
   DATABASE_URL="postgresql://postgres:TUA_PASSWORD_QUI@localhost:5432/stappa_db?schema=public"
   
   # Se la tua password è "admin123", scrivi:
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/stappa_db?schema=public"
   ```

3. **Salva il file** `.env`

---

## Passo 4️⃣: Crea le Tabelle nel Database

Apri il terminale nella cartella `backend/` e esegui:

```bash
npm run db:push
```

**Output atteso**:
```
🚀 Your database is now in sync with your Prisma schema. Done in XXms

✔ Generated Prisma Client
```

Se vedi questo, le tabelle sono state create! ✅

---

## Passo 5️⃣: Popola il Database con Dati di Test

```bash
npm run db:seed
```

**Output atteso**:
```
🌱 Starting database seed...

Creating ROOT admin...
✅ ROOT admin created: root

Creating establishments...
✅ Created: Bar Centrale (Milano)
✅ Created: Pub Irish (Milano)
...

✅ Database seed completed successfully!
```

Questo creerà:
- ✅ 1 admin ROOT (username: `root`, password: `Root1234@`)
- ✅ 5 bar di test
- ✅ 3 senior merchants
- ✅ 2 merchants base
- ✅ 3 utenti normali
- ✅ 3 promo attive
- ✅ Dati di esempio

---

## Passo 6️⃣: Avvia il Server Backend

```bash
npm run dev
```

**Output atteso**:
```
┌─────────────────────────────────────────┐
│  🍺 Stappa Backend API                  │
│  Server running on port 3000            │
│  Environment: development               │
│  Database: PostgreSQL                   │
└─────────────────────────────────────────┘
```

Il backend è ora attivo su: **http://localhost:3000** ✅

---

## Passo 7️⃣: Verifica che Funzioni

### Test 1: Health Check

Apri il browser e vai su:
```
http://localhost:3000/health
```

Dovresti vedere:
```json
{
  "status": "OK",
  "message": "Stappa Backend API is running",
  "timestamp": "2025-11-11T..."
}
```

### Test 2: Login con ROOT

Apri un nuovo terminale e testa il login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"root\",\"password\":\"Root1234@\"}"
```

Dovresti ricevere un token JWT! ✅

---

## Passo 8️⃣: Esplora il Database

### Opzione 1: Prisma Studio (Consigliato) 🌟

```bash
npm run db:studio
```

Si aprirà il browser su **http://localhost:5555**

Qui puoi:
- Vedere tutte le tabelle
- Modificare i dati
- Filtrare e cercare
- Creare nuovi record

Molto più facile di SQL! 👍

### Opzione 2: pgAdmin 4

1. Apri pgAdmin 4
2. Naviga: Servers → PostgreSQL → Databases → stappa_db → Schemas → public → Tables
3. Click destro su una tabella → View/Edit Data → All Rows
4. Puoi vedere tutti i dati!

### Opzione 3: TablePlus (Opzionale)

Se preferisci un tool moderno:
1. Scarica TablePlus: https://tableplus.com/
2. Crea connessione PostgreSQL:
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: (la tua password)
   - Database: `stappa_db`
3. Connetti!

---

## 🎉 Fatto! Il Backend è Pronto!

### Credenziali per Testare:

**ROOT Admin**:
- Username: `root`
- Password: `Root1234@`

**Senior Merchant**:
- Username: `mario_rossi`
- Password: `Senior1234@`

**Merchant**:
- Username: `carlo_neri`
- Password: `Merchant1234@`

**User**:
- Username: `giovanni_test`
- Password: `User1234@`

---

## 🔧 Comandi Utili

```bash
# Avvia server
npm run dev

# Vedi database con interfaccia web
npm run db:studio

# Resetta database (ATTENZIONE: cancella tutti i dati!)
npm run db:push -- --force-reset

# Rigenera seed (dopo reset)
npm run db:seed
```

---

## ❓ Problemi Comuni

### "Can't reach database server"
- Verifica che PostgreSQL sia avviato
- Controlla la password in `.env`
- Prova a riavviare PostgreSQL:
  - Cerca "Services" in Windows
  - Trova "postgresql-x64-15" (o la tua versione)
  - Click destro → Restart

### "Database stappa_db does not exist"
- Crea il database con pgAdmin o psql (vedi Passo 2)

### "Port 3000 already in use"
- Cambia porta in `.env`: `PORT=3001`
- Oppure termina il processo sulla porta 3000

---

## 📚 Prossimi Passi

Dopo aver avviato il backend:

1. ✅ Testa le API con curl o Postman
2. ✅ Esplora il database con Prisma Studio
3. ✅ Modifica il frontend per usare il backend reale
4. ✅ Testa l'app completa!

---

**Hai bisogno di aiuto?**
- Controlla `backend/README.md` per documentazione completa
- Guarda i logs del server per errori
- Usa Prisma Studio per vedere i dati

**Buon lavoro! 🍺**
