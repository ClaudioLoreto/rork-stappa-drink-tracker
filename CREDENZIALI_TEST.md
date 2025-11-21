# STAPPA - Credenziali di Test

> Ultimo aggiornamento: 13 novembre 2025
> Questo file è l'unica fonte ufficiale per utenti e password di test.

## Stato del database (ambiente locale)

- Utenti presenti: 8 (1 ROOT, 2 senior merchants, 2 merchants, 3 utenti finali)
- Locali attivi: 4 (Bar Centrale, Pub Irish, Caffe Vittoria, Lounge Bar 360)
- Promo attive: 4 (piu una bozza su Pub Irish)
- Tutti gli account hanno status = ACTIVE

---

## ROOT Admin (creato dal seed)

| Campo    | Valore |
| -------- | ------ |
| Username | `root` |
| Password | `Root123!` |
| Email    | `root@stappa.com` |
| Ruolo    | `ROOT` |
| Nome     | Super Admin |
| Citta    | Milano (MI) |

Il seed e gli script `reset-db` e `prisma db seed` gestiscono solo questo account.

---

## Senior Merchants

1. Filippo Rossi – Bar Centrale (ID: 4e757d3a-386e-40fb-957b-8089949a3f46)
   - Username: `filippo`
   - Password: `Filippo123!`
   - Email: `filippo@saitatapo.com`
   - Ruolo: `SENIOR_MERCHANT`
   - Permessi: social manager, post social, gestione stock

2. Anna Bianchi – Pub Irish (ID: 03f6533e-b989-458c-9449-b820f9dca3b7)
   - Username: `anna`
   - Password: `Anna123!`
   - Email: `anna@pubIrish.com`
   - Ruolo: `SENIOR_MERCHANT`
   - Permessi: social manager, post social

---

## Merchants

1. Mario Verdi – Caffe Vittoria (ID: a0d8b1bd-a904-4506-b04c-e895aeec1067)
   - Username: `mario`
   - Password: `Mario123!`
   - Email: `mario@barcentrale.com`
   - Ruolo: `MERCHANT`

2. Sara Blu – Lounge Bar 360 (ID: 1eaf1e5e-9c77-450e-92a1-4c1a9f51ef5d)
   - Username: `sara`
   - Password: `Sara123!`
   - Email: `sara@loungebar.com`
   - Ruolo: `MERCHANT`

---

## Utenti finali

1. Claudio Bianchi
   - Username: `claudio`
   - Password: `User123!`
   - Email: `claudio@example.com`
   - Ruolo: `USER`

2. Laura Neri
   - Username: `laura`
   - Password: `User123!`
   - Email: `laura@test.com`
   - Ruolo: `USER`

3. Mario Rossi (nuovo)
   - Username: `mario_rossi`
   - Password: `Test123`
   - Email: `mario.rossi@test.com`
   - Ruolo: `USER`
   - Note: non assegnato a un locale

---

## Locali

| Nome            | Citta   | Provincia | Regione   | Senior |
| --------------- | ------- | --------- | --------- | ------ |
| Bar Centrale    | Milano  | MI        | Lombardia | Filippo |
| Pub Irish       | Milano  | MI        | Lombardia | Anna |
| Caffe Vittoria  | Roma    | RM        | Lazio     | (nessuno) |
| Lounge Bar 360  | Firenze | FI        | Toscana   | (nessuno) |

---

## Promo

| Locale           | Tickets | Ticket cost | Premio | Stato |
| ---------------- | ------- | ----------- | ------ | ----- |
| Bar Centrale     | 10      | 5 EUR       | 5 EUR  | Attiva |
| Caffe Vittoria   | 8       | 4 EUR       | 4 EUR  | Attiva |
| Lounge Bar 360   | 15      | 7 EUR       | 12 EUR | Attiva |
| Pub Irish        | 12      | 6 EUR       | 10 EUR | Inattiva |
| Pub Irish (bozza)| 10      | 10 EUR      | 10 EUR | Attiva |

Le promo possono cambiare durante i test. Controlla sempre `/api/promos`.

---

## Procedure utili

- Reset completo: `node backend/reset-db.js`
  - Cancella tutte le tabelle
  - Ricrea solo l'utente `root`
  - Reinserisci gli altri account usando questo file come riferimento
- Seed Prisma: `npx prisma db seed`
  - Garantisce la presenza dell'utente ROOT

---

## Checklist dopo reset o deploy

- [ ] L'utente `root` accede con `Root123!`
- [ ] Gli utenti sopra sono presenti e attivi
- [ ] Gli establishment coincidono con la tabella Locali
- [ ] Le promo corrispondono alla tabella Promo

Aggiorna sempre questo file quando aggiungi o modifichi dati di test.
