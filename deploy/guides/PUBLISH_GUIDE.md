# Guida Pubblicazione App Store

## 🗂️ Workspace Pubblicazione (Solo Mac)

Tutte le operazioni di build e submit iOS vengono gestite in una **cartella separata** dal progetto principale:

```
~/StappaPublish/   ← Cartella LOCALE (non sincronizzata con Git/Windows)
```

**Perché separata?**
- I file di build iOS (.ipa, .xcarchive) non devono essere sincronizzati su Windows
- Git ignora automaticamente questi artefatti
- Backup automatici dei build precedenti con timestamp

**Vantaggi:**
- ✅ Il progetto principale rimane pulito e multi-piattaforma
- ✅ Windows non vede file iOS inutili
- ✅ Script automatizzati per build e submit
- ✅ Rotazione backup automatica

---

## ✅ Configurazione Completata

Ho preparato tutto il necessario per pubblicare l'app:

- ✅ `eas.json` creato con configurazioni build
- ✅ `app.json` aggiornato con buildNumber e versionCode
- ✅ Assets immagini verificati (icon, splash, favicon)
- ✅ Bundle ID configurato: `app.rork.stappa-drink-tracker`
- ✅ Package Name configurato (Android): `app.rork.stappadrinktracker`

## 📱 Prossimi Passi

### 1. Installare Strumenti Necessari

```bash
# Installa Xcode dall'App Store (richiesto, ~15GB)
# https://apps.apple.com/it/app/xcode/id497799835

# Installa Node.js (richiesto per EAS CLI)
# https://nodejs.org/ - Scarica LTS

# Installa EAS CLI globalmente
npm install -g eas-cli

# Verifica installazione
eas --version
```

### 2. Configurare Account Apple Developer

1. Vai su https://developer.apple.com/programs/
2. Registrati per l'Apple Developer Program (99$/anno)
3. Attendi l'approvazione (di solito 24-48 ore)
4. Una volta approvato, accedi a https://appstoreconnect.apple.com/

### 3. Creare l'App su App Store Connect

1. Accedi a https://appstoreconnect.apple.com/
2. Vai su "Le mie app" → "+" → "Nuova app"
3. Compila:
   - **Piattaforma**: iOS
   - **Nome**: Stappa Drink Tracker
   - **Lingua principale**: Italiano
   - **Bundle ID**: app.rork.stappa-drink-tracker
   - **Package Name**: app.rork.stappadrinktracker
   - **SKU**: stappa-drink-tracker-001 (puoi scegliere tu)

### 4. Usare gli Script di Pubblicazione

**Tutti i comandi vanno eseguiti dalla cartella `~/StappaPublish/scripts/`**

#### 4.1 Login EAS (prima volta)

```bash
eas login
```

#### 4.2 Build iOS Production

```bash
cd ~/StappaPublish/scripts
./build.sh
```

Lo script:
1. Fa backup del build precedente (se esiste)
2. Avvia build production sui server Expo (15-30 min)
3. Scarica il file .ipa in `~/StappaPublish/current/`

**Nota:** Il build avviene sui server Expo, non serve un Mac potente!

#### 4.3 Submit ad App Store

```bash
cd ~/StappaPublish/scripts
./submit.sh
```

**Oppure manualmente:**
1. Apri l'app "Transporter" (di Apple)
2. Trascina il file .ipa da `~/StappaPublish/current/`
3. Attendi il caricamento

---

### 5. Build Manuale (Avanzato)

Se preferisci non usare gli script:

```bash
cd /Users/claudioloreto/Development/Projects/rork-stappa-drink-tracker

# Configura progetto (prima volta)
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Submit
eas submit --platform ios --latest
```

---

## 📦 Gestione Backup

I build precedenti vengono salvati automaticamente in:
```
~/StappaPublish/backup/YYYYMMDD_HHMMSS/
```

**Pulizia backup vecchi:**

```bash
# Elimina backup più vecchi di 30 giorni
find ~/StappaPublish/backup -type d -mtime +30 -exec rm -rf {} +
```

**Spazio occupato:**
```bash
# Vedi quanto spazio occupano i backup
du -sh ~/StappaPublish/backup/*
```

---

## 📱 Preparare Metadata App Store

Dovrai preparare per App Store Connect:

**Screenshot richiesti:**
- iPhone 6.7" (iPhone 15 Pro Max): 1290 x 2796 px
- iPhone 6.5" (iPhone 11 Pro Max): 1242 x 2688 px  
- iPhone 5.5" (iPhone 8 Plus): 1242 x 2208 px
- iPad Pro 12.9": 2048 x 2732 px

**Informazioni necessarie:**
- Descrizione app (max 4000 caratteri)
- Parole chiave (max 100 caratteri, separati da virgola)
- URL supporto: https://rork.com/support
- URL privacy policy: https://rork.com/privacy
- Categoria primaria: Food & Drink
- Categoria secondaria: Lifestyle
- Età minima: 17+ (contiene riferimenti ad alcol)

**Screenshot da preparare:**
- Almeno 3 screenshot per dimensione richiesta
- Mostra le funzionalità principali dell'app

### 7. Review e Pubblicazione

1. Carica tutti i metadata su App Store Connect
2. Collega il build all'app
3. Compila le informazioni per la review:
   - Note per la review
   - Credenziali di test (se necessario)
   - Demo video (opzionale)
4. Invia per la review
5. Attendi 24-72 ore per la review Apple
6. Una volta approvato, pubblica!

## 🔧 Comandi Utili

```bash
# Login/logout EAS
eas login
eas logout

# Vedere lo stato dei build
eas build:list

# Vedere lo stato delle submission
eas submit:list

# Build locale (richiede Xcode, molto più lento)
eas build --platform ios --local

# Preview build (per testing interno)
eas build --platform ios --profile preview

# Controllare credenziali Apple
eas credentials
```

---

## ⚙️ Cosa Manca per Pubblicare

**OBBLIGATORI:**
- [ ] **Node.js installato** (per EAS CLI)
- [ ] **EAS CLI installato**: `npm install -g eas-cli`
- [ ] **Xcode completo** dall'App Store (~15GB, gratuito)
- [ ] **Apple Developer Account attivo** (99$/anno, pagato)
- [ ] **App creata su App Store Connect**

**CONSIGLIATI:**
- [ ] Backend in produzione e funzionante
- [ ] URL API configurato per produzione
- [ ] Screenshot preparati (vedi sezione metadata)
- [ ] Testo descrizione e parole chiave pronti

---

## 📝 Note Tecniche

- **buildNumber** e **versionCode** verranno incrementati automaticamente
- Il primo build può richiedere 15-30 minuti
- Build successivi: 10-15 minuti
- Apple review può richiedere 24-72 ore
- Gli artefatti di build (.ipa, .xcarchive) **NON** vengono sincronizzati su Git
- La cartella `~/StappaPublish` è **locale al Mac**

---

## ⚠️ Requisiti Backend

Prima di pubblicare, assicurati che:
- [ ] Il backend sia deployato e funzionante
- [ ] L'URL API in `services/api.ts` punti alla produzione
- [ ] Il database sia configurato e con i dati necessari
- [ ] Le API chiavi siano configurate (se necessario)
- [ ] HTTPS sia configurato correttamente

---

## 🆘 Problemi Comuni

**"Unable to find iOS simulator"**: Installa Xcode completo, non solo Command Line Tools

**"No valid code signing identity found"**: EAS gestisce automaticamente i certificati, assicurati di essere loggato con `eas login`

**"Build failed"**: Controlla i log su https://expo.dev nella sezione builds

**"This Bundle ID is not available"**: Cambia il bundleIdentifier in app.json

**"Command not found: eas"**: Installa EAS CLI con `npm install -g eas-cli`

**Script non eseguibile**: Rendi eseguibili con `chmod +x ~/StappaPublish/scripts/*.sh`

---

## 📧 Contatti

Per problemi o domande, verifica la documentazione Expo:
- https://docs.expo.dev/build/introduction/
- https://docs.expo.dev/submit/introduction/
- https://docs.expo.dev/eas/
