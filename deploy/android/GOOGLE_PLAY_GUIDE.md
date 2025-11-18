# 📱 Guida Pubblicazione Google Play Store

## 🗂️ Workspace Pubblicazione (Cross-Platform)

Tutte le operazioni di build Android possono essere eseguite sia da **Mac che da Windows**.

**Vantaggi Android:**
- ✅ Build EAS funziona su qualsiasi sistema operativo
- ✅ Non serve Android Studio installato localmente
- ✅ Build sui server Expo
- ✅ Compatibile con Windows, Mac, Linux

---

## ✅ Configurazione Completata

Ho preparato tutto il necessario per pubblicare l'app:

- ✅ `eas.json` creato con configurazioni build
- ✅ `app.json` aggiornato con versionCode e package
- ✅ Assets immagini verificati (icon, adaptive-icon)
- ✅ Package configurato: `app.rork.stappa-drink-tracker`
- ✅ Permissions Android dichiarate

---

## 📱 Prossimi Passi

### 1. Installare Strumenti Necessari

```bash
# Installa Node.js (richiesto per EAS CLI)
# Windows: https://nodejs.org/ - Scarica LTS
# Mac: brew install node

# Installa EAS CLI globalmente
npm install -g eas-cli

# Verifica installazione
eas --version
```

**⚠️ IMPORTANTE**: Android Studio **NON è necessario** per build tramite EAS!

---

### 2. Creare Account Google Play Console

1. Vai su https://play.google.com/console/
2. Registrati come sviluppatore Android
3. Paga la quota una tantum di **$25 USD**
4. Attendi l'approvazione (di solito poche ore)
5. Una volta approvato, accedi alla Console

---

### 3. Creare l'App su Google Play Console

1. Accedi a https://play.google.com/console/
2. Click "Crea app"
3. Compila:
   - **Nome app**: Stappa Drink Tracker
   - **Lingua predefinita**: Italiano
   - **App o gioco**: App
   - **Gratuita o a pagamento**: Gratuita
4. Accetta le dichiarazioni
5. Click "Crea app"

Annota:
- **ID applicazione**: `app.rork.stappa-drink-tracker`

---

### 4. Build Android Production

**Da qualsiasi sistema operativo (Windows/Mac/Linux):**

```bash
# Vai nella cartella del progetto
cd /path/to/rork-stappa-drink-tracker

# Login EAS (prima volta)
eas login

# Build Android Production
eas build --platform android --profile production
```

Il build:
1. Viene eseguito sui server Expo (15-30 min)
2. Non richiede Android Studio locale
3. Genera un file `.aab` (Android App Bundle)
4. Include firma digitale automatica

**Download Build:**

Quando il build è completato:
- Ricevi email da Expo
- URL per scaricare `.aab` nella dashboard: https://expo.dev

---

### 5. Preparare Metadata per Play Store

#### 5.1 Descrizione App

**Titolo corto** (max 50 caratteri):
```
Stappa - Traccia Drink e Promozioni
```

**Descrizione breve** (max 80 caratteri):
```
Scopri promozioni esclusive nei bar, traccia drink e sblocca sconti!
```

**Descrizione completa** (max 4000 caratteri):
```
🍺 Stappa - Il modo più divertente per scoprire bar e promozioni!

Stappa è l'app che rivoluziona il modo di vivere la vita notturna! Scansiona QR code nei tuoi bar preferiti, traccia i tuoi drink, accumula progressi e sblocca promozioni esclusive.

✨ FUNZIONALITÀ PRINCIPALI:

🍻 Tracciamento Drink
• Scansiona QR code forniti dai bar
• Tieni traccia di ogni drink consumato
• Visualizza lo storico completo

🎯 Sistema Promozioni
• Sblocca sconti dopo X drink consumati
• Ricevi notifiche per promozioni attive
• Raccogli badge e achievement

📍 Scoperta Locale
• Trova bar vicino a te con la mappa
• Filtra per tipo di locale e promozioni
• Salva i tuoi preferiti

🏆 Social & Community
• Pubblica foto dei tuoi drink
• Condividi esperienze con gli amici
• Partecipa a sfide e classifiche

👤 Dashboard Personalizzata
• Statistiche dettagliate
• Storico completo validazioni
• Progressi verso promozioni

💼 Per Merchant
• Dashboard dedicata per gestori di bar
• Crea e gestisci promozioni
• Analizza statistiche clienti
• Sistema di gestione stock e articoli

🔒 Privacy & Sicurezza
• I tuoi dati sono protetti
• Conforme GDPR e normative europee
• Nessuna condivisione con terze parti

🌍 Disponibile in Italiano e Inglese

📱 PERFETTA PER:
• Amanti della vita notturna
• Studenti universitari
• Gruppi di amici
• Appassionati di cocktail
• Chi cerca le migliori promozioni

⚠️ NOTA: App riservata a maggiorenni. Bevi responsabilmente.

Scarica Stappa oggi e inizia a scoprire il meglio della tua città! 🎉
```

#### 5.2 Categorie e Tags

**Categoria**: Cibo e bevande  
**Tags**: bar, drink, promozioni, sconti, nightlife, qr code, social

---

### 6. Screenshot Play Store

**Dimensioni richieste:**

1. **Telefono** (obbligatorio):
   - Minimo 2 screenshot
   - Dimensioni: 1080 x 1920 px (16:9) o 1080 x 2340 px (19.5:9)
   
2. **Tablet 7"** (opzionale):
   - Dimensioni: 1200 x 1920 px
   
3. **Tablet 10"** (opzionale):
   - Dimensioni: 1536 x 2048 px

**Screenshot da creare:**
1. Home screen / Splash
2. Login / Registrazione
3. Dashboard utente
4. Scansione QR code
5. Mappa bar locali
6. Dettaglio promozione
7. Storico drink
8. Social feed

**Script automatico:**
```bash
cd deploy/android/screenshots
./generate-screenshots.sh
```

---

### 7. Grafica Play Store

#### 7.1 Icona App (già presente)
- File: `assets/images/icon.png`
- Dimensione: 512 x 512 px
- Formato: PNG 32-bit
- ✅ Già configurata

#### 7.2 Feature Graphic (da creare)
- Dimensione: **1024 x 500 px**
- Formato: PNG o JPG
- Mostrata nella Home del Play Store

**Suggerimento contenuto:**
- Logo Stappa
- Testo: "Traccia Drink, Sblocca Sconti"
- Immagine di bicchiere stilizzato
- Colori brand: Giallo (#FFD700) e Blu scuro

#### 7.3 Video Promo (opzionale)
- URL YouTube
- Durata: 30-120 secondi
- Mostra funzionalità principali

---

### 8. Completare "Sicurezza Dati"

Google richiede trasparenza su raccolta dati:

**Dati raccolti:**
- ✅ Nome utente
- ✅ Email
- ✅ Posizione approssimativa (per mappa bar)
- ✅ Foto (volontarie, per post social)
- ✅ Dati di utilizzo (drink scansionati, progressi)

**Finalità:**
- Funzionalità app
- Personalizzazione esperienza
- Comunicazioni promozionali

**Condivisione:**
- ❌ NON condivisi con terze parti

**Sicurezza:**
- ✅ Dati crittografati in transito (HTTPS)
- ✅ Possibilità di eliminare account

---

### 9. Età e Classificazione Contenuti

**Età target**: 18+

**Questionario contenuti:**
- Riferimenti ad alcol: **SÌ**
- Contenuti generati dagli utenti: **SÌ** (post social)
- Contenuti violenti: NO
- Contenuti sessuali: NO
- Linguaggio offensivo: NO (moderato)
- Gioco d'azzardo: NO

**Classificazione PEGI**: PEGI 18 (Europa)  
**Classificazione IARC**: Adulti

---

### 10. Upload Build e Pubblicazione

1. **Upload AAB**:
   - Accedi a Play Console
   - Vai su "Versioni" → "Produzione"
   - Click "Crea nuova versione"
   - Carica il file `.aab` scaricato da Expo

2. **Note di versione** (italiano):
   ```
   🎉 Versione iniziale di Stappa!
   
   ✨ Funzionalità:
   • Scansione QR code nei bar
   • Tracciamento drink
   • Sistema promozioni e sconti
   • Mappa bar locali
   • Feed social
   • Dashboard personalizzata
   
   Divertiti e bevi responsabilmente! 🍻
   ```

3. **Test interno** (opzionale):
   - Aggiungi tester via email
   - Testa l'app prima della produzione
   - Raccogli feedback

4. **Invio per revisione**:
   - Compila tutti i campi obbligatori
   - Controlla Privacy Policy URL (richiesto!)
   - Click "Invia per revisione"

5. **Revisione Google**:
   - Può richiedere **poche ore fino a 7 giorni**
   - Molto più veloce di Apple (di solito 1-3 giorni)
   - Ricevi notifica via email

6. **Pubblicazione**:
   - Una volta approvato, pubblica con un click
   - App disponibile su Play Store in poche ore

---

## 🔄 Aggiornamenti Futuri

### Incrementare versionCode

Prima di ogni nuovo build:

```json
// app.json
{
  "expo": {
    "android": {
      "versionCode": 2  // Incrementa di 1
    },
    "version": "1.0.1"  // Opzionale: cambia versione visibile
  }
}
```

### Build e Upload Nuovo Aggiornamento

```bash
# Build nuovo
eas build --platform android --profile production

# Scarica .aab da Expo

# Upload su Play Console
# → Versioni → Produzione → Crea nuova versione
```

---

## 📝 Checklist Pubblicazione

### Pre-Build
- [ ] Backend deployato e funzionante
- [ ] API URL configurato per produzione in `api-config.ts`
- [ ] `USE_MOCK_API = false`
- [ ] App testata su dispositivo Android reale
- [ ] Versione e versionCode impostati in `app.json`

### Play Console Setup
- [ ] Account Google Play creato e pagato ($25)
- [ ] App creata su Play Console
- [ ] Nome app impostato
- [ ] Categoria selezionata (Cibo e bevande)
- [ ] Età target impostata (18+)

### Contenuti
- [ ] Descrizione breve e completa scritte
- [ ] Screenshot preparati (minimo 2, consigliati 6-8)
- [ ] Feature Graphic creata (1024x500)
- [ ] Icona app verificata (512x512)
- [ ] Video promo (opzionale)

### Legal & Privacy
- [ ] Privacy Policy pubblicata online
- [ ] Privacy Policy URL inserito in Play Console
- [ ] Sicurezza Dati completata
- [ ] Classificazione contenuti completata
- [ ] Termini di servizio pronti

### Build & Upload
- [ ] EAS CLI installato
- [ ] `eas login` effettuato
- [ ] Build Android completato
- [ ] File .aab scaricato
- [ ] .aab caricato su Play Console
- [ ] Note di versione scritte

### Final Review
- [ ] Tutti i campi obbligatori compilati
- [ ] Screenshot caricati
- [ ] Privacy policy verificata
- [ ] Inviato per revisione Google

---

## 🆘 Problemi Comuni

### "Package name already in use"
**Soluzione**: Cambia `package` in `app.json`:
```json
"android": {
  "package": "app.rork.stappadrinktracker"
}
```

### "Build failed on Expo servers"
**Soluzione**:
1. Controlla logs su https://expo.dev
2. Verifica `eas.json` sia corretto
3. Prova con `--clear-cache`

### "Upload AAB fallito"
**Soluzione**:
1. Verifica dimensione file < 150MB
2. Usa Chrome invece di altri browser
3. Prova app "Play Console" da Android

### "Privacy Policy URL non raggiungibile"
**Soluzione**:
1. Privacy Policy DEVE essere online e pubblica
2. Usa GitHub Pages, Netlify o sito web
3. URL deve essere HTTPS

### "Contenuti rifiutati per alcol"
**Soluzione**:
1. Assicurati età target sia 18+
2. Aggiungi disclaimer "Bevi responsabilmente"
3. Non mostrare eccessivo consumo di alcol negli screenshot

---

## 🔧 Comandi Utili

```bash
# Login/logout EAS
eas login
eas logout

# Vedere lo stato dei build
eas build:list

# Vedere lo stato delle submission
eas submit:list

# Build locale (richiede Android Studio, sconsigliato)
eas build --platform android --local

# Preview build (per testing interno)
eas build --platform android --profile preview

# Build development (per testing con Expo Go)
eas build --platform android --profile development
```

---

## 🌍 Pubblicazione Multi-Paese

Google Play supporta **130+ paesi**.

**Mercati principali:**
- 🇮🇹 Italia
- 🇬🇧 Regno Unito
- 🇺🇸 Stati Uniti
- 🇩🇪 Germania
- 🇫🇷 Francia
- 🇪🇸 Spagna

**Localizzazione:**
- Traduci descrizione in inglese (minimo)
- Screenshot in lingua locale (opzionale)
- Play Store gestisce automaticamente le lingue

---

## 💰 Monetizzazione (Futuro)

Se vuoi aggiungere acquisti in-app:

1. **In-App Purchases**:
   - Aggiungi prodotti in Play Console
   - Integra Google Play Billing
   - Configura prezzi per mercato

2. **Abbonamenti**:
   - Piano Premium con più funzionalità
   - Prova gratuita (es. 7 giorni)
   - Prezzi differenziati per paese

3. **Pubblicità** (non consigliato per questa app):
   - AdMob integration
   - Può influenzare rating negativamente

---

## 📊 Analytics e Metriche

Play Console fornisce:
- Download e installazioni
- Rating e recensioni
- Crash reports
- Statistiche utilizzo
- Feedback utenti

**Consigliati da integrare:**
- Google Analytics for Firebase
- Sentry per crash reporting
- Mixpanel per eventi utente

---

## ⚙️ Configurazione Avanzata

### App Signing da Google

Google gestisce automaticamente la firma:
- ✅ Upload key generata da EAS
- ✅ Google firma con propria key
- ✅ Più sicuro contro perdita chiavi

### Play Store Listing Experiments

Testa diverse versioni:
- Icona app
- Screenshot
- Descrizione
- Feature graphic

Google mostra versione con più conversioni.

---

## 📱 Testing Prima della Pubblicazione

### 1. Internal Testing
- Aggiungi fino a 100 tester
- Non richiede revisione Google
- Rilasci istantanei

### 2. Closed Testing
- Fino a 2000 tester via URL
- Liste email specifiche
- Feedback organizzato

### 3. Open Testing
- Disponibile pubblicamente
- Link per unirsi
- Beta testing pubblico

**Consiglio**: Inizia con Internal Testing!

---

## 📧 Supporto

**Google Play Console Support**:
- https://support.google.com/googleplay/android-developer

**Expo Support**:
- https://expo.dev/support
- https://docs.expo.dev

---

## ✅ Riepilogo Rapido

1. **Account**: Play Console + $25
2. **Build**: `eas build --platform android --profile production`
3. **Download**: .aab da Expo dashboard
4. **Upload**: Play Console → Versioni → Produzione
5. **Metadata**: Descrizione, screenshot, feature graphic
6. **Privacy**: Sicurezza dati, classificazione contenuti
7. **Submit**: Invio per revisione (1-7 giorni)
8. **Pubblica**: Click pubblica quando approvato

**Tempo stimato primo deploy**: 2-3 ore (escludendo revisione Google)

---

🚀 **Pronto per pubblicare su Google Play!**
