# 🚀 Deployment Documentation - Stappa Drink Tracker

**Versione**: 1.0.0  
**Ultimo Aggiornamento**: 18 Novembre 2025  
**Cross-Platform**: Windows, macOS, Linux

---

## 📋 Indice

1. [Struttura Progetto](#-struttura-progetto)
2. [Guide Deployment](#-guide-deployment)
3. [Prerequisiti](#-prerequisiti)
4. [Quick Start](#-quick-start)
5. [Metadata e Assets](#-metadata-e-assets)
6. [Legal & Compliance](#-legal--compliance)
7. [Supporto](#-supporto)

---

## 📁 Struttura Progetto

```
deploy/
├── README.md                      # 📄 Questo file (overview generale)
├── guides/                        # 📚 Guide deployment
│   ├── DEPLOY_BACKEND.md         # Backend su Railway/Render/Heroku
│   ├── PUBLISH_GUIDE.md          # Guida pubblicazione iOS
│   ├── READY_FOR_PRODUCTION.md   # Checklist produzione
│   └── SESSION_CONTINUITY.md     # Documentazione sessioni
├── ios/                           # 🍎 iOS App Store
│   ├── APP_STORE_CONNECT_GUIDE.md
│   ├── IOS_CHECKLIST.md
│   ├── app-store-metadata.json
│   └── screenshots/
├── android/                       # 🤖 Android Google Play
│   ├── GOOGLE_PLAY_GUIDE.md
│   ├── ANDROID_CHECKLIST.md
│   ├── play-store-metadata.json
│   └── screenshots/
├── shared/                        # 🔄 Risorse condivise
│   └── (legal docs, assets comuni)
├── assets/                        # 📷 Assets vari
│   └── legal-page.html
└── screenshots/                   # 📸 Script generazione screenshot

Altri file root:
├── LEGAL_COMPLIANCE.md           # Compliance legale completa
├── FINAL_SUBMISSION_CHECKLIST.md # Checklist finale
└── DEPLOY_LEGAL_DOCS.md          # Deploy documenti legali
```

---

## 📚 Guide Deployment

### 🔧 Backend
- **[DEPLOY_BACKEND.md](guides/DEPLOY_BACKEND.md)** - Deploy backend su Railway/Render/Heroku
  - Variabili d'ambiente richieste
  - Setup database PostgreSQL
  - Comandi deployment
  - Testing API

### 🍎 iOS App Store
- **[APP_STORE_CONNECT_GUIDE.md](ios/APP_STORE_CONNECT_GUIDE.md)** - Guida completa App Store Connect
- **[IOS_CHECKLIST.md](ios/IOS_CHECKLIST.md)** - Checklist step-by-step iOS
- **[PUBLISH_GUIDE.md](guides/PUBLISH_GUIDE.md)** - Processo pubblicazione iOS

**Requisiti iOS**:
- ✅ Mac con macOS (per build submission, non per build EAS)
- ✅ Apple Developer account ($99/anno)
- ✅ Xcode installato (per testing locale opzionale)
- ✅ EAS CLI installato

### 🤖 Android Google Play
- **[GOOGLE_PLAY_GUIDE.md](android/GOOGLE_PLAY_GUIDE.md)** - Guida completa Google Play Store
- **[ANDROID_CHECKLIST.md](android/ANDROID_CHECKLIST.md)** - Checklist step-by-step Android

**Requisiti Android**:
- ✅ **Cross-platform** (Windows, Mac, Linux)
- ✅ Google Play Console account ($25 una tantum)
- ✅ EAS CLI installato
- ❌ Android Studio **NON richiesto** (build su server Expo)

### 📱 General
- **[READY_FOR_PRODUCTION.md](guides/READY_FOR_PRODUCTION.md)** - App pronta per produzione
- **[SESSION_CONTINUITY.md](guides/SESSION_CONTINUITY.md)** - Documentazione continuità sessioni

---

## ✅ Prerequisiti

### 1. Backend Deployed ✅

**Requisiti**:
- ✅ Database PostgreSQL configurato
- ✅ Backend deployato su Railway/Render/Heroku
- ✅ API URL pubblico e funzionante (HTTPS obbligatorio)
- ✅ Variabili d'ambiente configurate
- ✅ Database popolato con utente ROOT

**Verifica**:
```bash
curl https://TUO_BACKEND_URL.com/api/establishments
# Deve rispondere con JSON
```

**Guide**:
- [DEPLOY_BACKEND.md](guides/DEPLOY_BACKEND.md)

---

### 2. App Configuration ✅

**File da configurare**: `services/api-config.ts`

```typescript
// ⚠️ CAMBIARE per produzione
export const USE_MOCK_API = false; // da true a false

// ⚠️ INSERIRE URL backend
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://TUO_BACKEND_URL.com'; // CAMBIA QUI!
```

**Checklist**:
- [ ] `USE_MOCK_API = false`
- [ ] `API_BASE_URL` configurato con URL produzione
- [ ] App testata con backend reale
- [ ] Login, QR scanning, validazioni funzionanti

---

### 3. Legal Documents 📄

**Requisiti app stores**:
- ✅ Privacy Policy online e pubblica
- ✅ Terms of Service online e pubblici
- ✅ Cookie Policy online e pubblica

**URL richiesti**:
- `https://rork.com/privacy` (o TUO dominio)
- `https://rork.com/terms`
- `https://rork.com/cookies`

**Guide**:
- [DEPLOY_LEGAL_DOCS.md](DEPLOY_LEGAL_DOCS.md)
- [LEGAL_COMPLIANCE.md](LEGAL_COMPLIANCE.md)

---

### 4. Assets Ready 🎨

#### Icone App

| Piattaforma | File | Dimensione | Status |
|------------|------|-----------|--------|
| iOS | `assets/images/icon.png` | 1024x1024 | ✅ Pronto |
| Android | `assets/images/adaptive-icon.png` | 512x512 | ✅ Pronto |
| Web | `assets/images/favicon.png` | 512x512 | ✅ Pronto |

#### Screenshot

**iOS (richiesti)**:
- iPhone 6.7" (1290 x 2796 px) - minimo 3
- iPhone 6.5" (1242 x 2688 px) - minimo 3
- iPhone 5.5" (1242 x 2208 px) - minimo 3
- iPad Pro 12.9" (2048 x 2732 px) - minimo 3

**Android (richiesti)**:
- Telefono (1080 x 1920 px) - minimo 2, consigliati 6-8
- Tablet 7" (1200 x 1920 px) - opzionale
- Tablet 10" (1536 x 2048 px) - opzionale

**Feature Graphic Android (richiesto)**:
- Dimensione: 1024 x 500 px
- ❌ TODO: Creare
- Suggerimenti: Logo Stappa + testo "Traccia Drink, Sblocca Sconti"

**Script generazione**:
```bash
# iOS screenshots
cd deploy/ios/screenshots
./generate-ios-screenshots.sh

# Android screenshots  
cd deploy/android/screenshots
./generate-android-screenshots.sh
```

---

### 5. Developer Accounts 💳

| Piattaforma | Account | Costo | Status |
|------------|---------|-------|--------|
| **iOS** | Apple Developer | $99/anno | ✅ Attivo |
| **Android** | Google Play Console | $25 una tantum | ❌ TODO |
| **Expo** | Expo Account | Gratuito | ✅ Attivo |

**Link**:
- Apple: https://developer.apple.com
- Google Play: https://play.google.com/console
- Expo: https://expo.dev

---

## 🚀 Quick Start

### iOS Deployment (solo Mac per submission)

```bash
# 1. Installa EAS CLI (una volta)
npm install -g eas-cli

# 2. Login Expo
eas login

# 3. Build iOS Production (sui server Expo, ~20-30 min)
cd /path/to/rork-stappa-drink-tracker
eas build --platform ios --profile production

# 4. Submit ad App Store (quando build completa)
eas submit --platform ios --latest
```

**Guide dettagliate**:
- [ios/APP_STORE_CONNECT_GUIDE.md](ios/APP_STORE_CONNECT_GUIDE.md)
- [guides/PUBLISH_GUIDE.md](guides/PUBLISH_GUIDE.md)

---

### Android Deployment (cross-platform: Windows/Mac/Linux)

```bash
# 1. Installa EAS CLI (una volta)
npm install -g eas-cli

# 2. Login Expo  
eas login

# 3. Build Android Production (sui server Expo, ~20-30 min)
cd /path/to/rork-stappa-drink-tracker
eas build --platform android --profile production

# 4. Download .aab da Expo dashboard
# Vai su https://expo.dev → Projects → Builds

# 5. Upload .aab su Google Play Console
# Vai su https://play.google.com/console
# → La tua app → Versioni → Produzione → Crea versione
```

**Guide dettagliate**:
- [android/GOOGLE_PLAY_GUIDE.md](android/GOOGLE_PLAY_GUIDE.md)
- [android/ANDROID_CHECKLIST.md](android/ANDROID_CHECKLIST.md)

---

## 📄 Metadata e Assets

### Metadata Files

Entrambi gli store richiedono metadata in formato JSON per aggiornamenti facili:

| File | Descrizione | Status |
|------|------------|--------|
| `ios/app-store-metadata.json` | Metadata App Store Connect | ✅ Completo |
| `android/play-store-metadata.json` | Metadata Google Play | ✅ Completo |

**Contenuto**:
- Descrizioni app (corta e completa)
- Keywords/tags
- Informazioni versione
- URL privacy policy
- Dichiarazioni raccolta dati
- Account demo per review

### App Identifiers

| Piattaforma | Identifier | Value |
|------------|-----------|-------|
| **iOS** | Bundle ID | `app.rork.stappa-drink-tracker` |
| **Android** | Package Name | `app.rork.stappa-drink-tracker` |
| **Expo** | Project ID | `c0a486cf-b2c2-4bd0-a508-a40c8e0aed06` |
| **App Store** | App ID | `6755406156` |
| **Apple Team** | Team ID | `65HWTGRJ83` |

---

## 🔒 Legal & Compliance

**Documenti da rivedere**:
- [LEGAL_COMPLIANCE.md](LEGAL_COMPLIANCE.md) - Compliance legale completa
  - Considerazioni trademark
  - Regolamenti privacy (GDPR, CCPA)
  - Policy app stores
  - Requisiti età rating
  - Implementazioni richieste

### Privacy & Data Collection

**Dati raccolti**:
- ✅ Nome utente, email (account)
- ✅ Posizione approssimativa (mappa bar)
- ✅ Foto (post social, volontarie)
- ✅ Attività app (drink scansionati, progressi)

**NON condivisi con terze parti**

**Sicurezza**:
- ✅ HTTPS (dati crittografati in transito)
- ✅ Account eliminabile dall'utente
- ✅ Conforme GDPR/CCPA

### Age Rating

| Piattaforma | Rating | Motivo |
|------------|--------|--------|
| **iOS** | 17+ | Riferimenti frequenti ad alcol |
| **Android** | 18+ / PEGI 18 | Riferimenti ad alcol |

**Requisiti**:
- ✅ Disclaimer "Bevi responsabilmente"
- ✅ No promozione eccessiva di alcol
- ✅ No contenuti offensivi

### Copyright & Trademark

**Copyright**: © 2025 Rork - Claudio Loreto

**⚠️ TODO**:
- [ ] Verificare conflitti trademark "Stappa"
- [ ] Considerare registrazione trademark
- [ ] Verificare licenze dipendenze third-party

---

## 🧪 Testing Prima della Pubblicazione

### Test Accounts

**User Demo**:
- Username: `demo`
- Password: `Demo1234@`
- Email: `demo@stappa.app`

**Merchant Demo**:
- Username: `merchant_demo`
- Password: `Merchant1234@`
- Email: `merchant@stappa.app`

### Funzionalità da Testare

✅ **Core Features**:
1. Login / Registrazione
2. Scansione QR code (camera permission)
3. Mappa bar locali (location permission)
4. Tracciamento drink
5. Sistema promozioni
6. Feed social (post, like, commenti)
7. Dashboard merchant

✅ **Permissions**:
- Camera (QR scanning)
- Location (mappa bar)
- Photo library (post social)
- Notifications (opzionale)

---

## 🔧 Comandi Utili

### EAS CLI

```bash
# Login/Logout
eas login
eas logout

# Build
eas build --platform ios
eas build --platform android
eas build --platform all

# Build con cache pulita
eas build --platform ios --clear-cache

# Lista build
eas build:list

# Submit
eas submit --platform ios --latest
eas submit --platform android --latest

# Lista submissions
eas submit:list

# Credenziali
eas credentials
```

### Development

```bash
# Start development server
npx expo start

# Clear cache
npx expo start --clear
rm -rf node_modules .expo && npm install

# Lint
npm run lint

# Test on device
npx expo start --ios
npx expo start --android
```

---

## 📊 Versioning

### Incrementare Versioni

**iOS**: `app.json`
```json
{
  "expo": {
    "version": "1.0.1",  // Versione visibile utente
    "ios": {
      "buildNumber": "2"  // Incrementa ad ogni build
    }
  }
}
```

**Android**: `app.json`
```json
{
  "expo": {
    "version": "1.0.1",  // Versione visibile utente
    "android": {
      "versionCode": 2  // Incrementa ad ogni build
    }
  }
}
```

---

## 🆘 Supporto

### Problemi Comuni

**Build fallito su EAS**:
- Controlla logs su https://expo.dev
- Prova con `--clear-cache`
- Verifica `eas.json` e `app.json`

**App non si connette al backend**:
- Verifica `API_BASE_URL` in `services/api-config.ts`
- Assicurati `USE_MOCK_API = false`
- Testa backend con `curl`

**Submission rifiutata**:
- Leggi motivo nella email rejection
- Controlla checklist iOS/Android
- Verifica privacy policy URL sia pubblico

### Link Utili

**Documentation**:
- [Expo Docs](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

**Dashboards**:
- [Expo Dashboard](https://expo.dev)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Railway](https://railway.app) (backend)

**Support**:
- Expo: https://expo.dev/support
- Apple: https://developer.apple.com/contact/
- Google: https://support.google.com/googleplay/android-developer

---

## 📝 Checklist Finale

Prima di pubblicare:

### Backend
- [ ] Backend deployato e funzionante
- [ ] Database configurato
- [ ] API URL testato
- [ ] HTTPS abilitato

### App
- [ ] `USE_MOCK_API = false`
- [ ] API URL configurato
- [ ] App testata con backend reale
- [ ] Tutte le funzionalità verificate

### Legal
- [ ] Privacy Policy online
- [ ] Terms of Service online
- [ ] Cookie Policy online
- [ ] Age rating verificato

### Assets
- [ ] Icone app pronte
- [ ] Screenshot creati (tutte le dimensioni)
- [ ] Feature Graphic Android (solo Android)
- [ ] Video promo (opzionale)

### Accounts
- [ ] Apple Developer attivo (iOS)
- [ ] Google Play Console creato (Android)
- [ ] Expo account configurato
- [ ] EAS CLI installato

### Build
- [ ] Build completato con successo
- [ ] Download .ipa/.aab effettuato
- [ ] Versione incrementata correttamente
- [ ] Note di versione scritte

### Submission
- [ ] Metadata compilati
- [ ] Screenshot caricati
- [ ] Account demo forniti
- [ ] Privacy policy URL inserito
- [ ] Inviato per review

---

**🎉 Buona fortuna con la pubblicazione! 🚀**

Per domande o problemi, consulta le guide specifiche nelle cartelle `ios/` e `android/`.
