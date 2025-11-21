# Script SQL per Database Stappa

Gli script presenti in questa cartella sono pensati per operazioni manuali e non contengono più credenziali hardcoded. Prima di eseguirli consulta `CREDENZIALI_TEST.md` per conoscere utenti, password e stabilimenti disponibili.

## Utilizzo

### 1. Connessione al database

```bash
psql -U postgres -d stappa_db
```

Oppure con variabili d'ambiente:

```bash
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT
```

### 2. Creare un utente di test

Lo script è parametrico: passa i valori tramite `-v`.

```bash
psql -U postgres -d stappa_db   -v username='user_test'   -v email='user.test@example.com'   -v password='Password123'   -v firstName='User'   -v lastName='Test'   -f backend/scripts/create-test-user.sql
```

Le password da utilizzare sono elencate in `CREDENZIALI_TEST.md`.

### 3. Creare una promo di test

```bash
psql -U postgres -d stappa_db -f backend/scripts/create-test-promo.sql
```

### 4. Verifica dati

```sql
SELECT id, name, address FROM establishments;
SELECT username, email, role, status FROM users;
SELECT e.name AS bar, p."ticketCost", p."ticketsRequired", p."rewardValue", p."isActive"
FROM promos p
JOIN establishments e ON p."establishmentId" = e.id;
```

## Troubleshooting

- Se il frontend mostra errori di payload o `Unexpected token`, crea l'utente direttamente via script parametrico.
- Per generare nuovi hash Bcrypt da usare come parametro puoi eseguire `node -e "require('bcryptjs').hash('Password123', 10).then(console.log);"`.
- Dopo ogni modifica ricontrolla `CREDENZIALI_TEST.md` per mantenere allineata la documentazione.
