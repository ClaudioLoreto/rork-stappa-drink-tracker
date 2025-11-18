# 🚀 Deployment Guide - Stappa Drink Tracker

Questa cartella contiene tutti i file, script e documentazione necessari per pubblicare l'app su **iOS App Store** e **Google Play Store**.

## 📁 Struttura

```
deploy/
├── README.md                    # Questa guida
├── DEPLOYMENT_CHECKLIST.md      # Checklist completa per deployment
├── ios/                         # File specifici iOS
│   ├── app-store-metadata.json  # Metadati App Store
│   ├── privacy-nutrition.json   # Privacy Nutrition Label
│   └── screenshots/             # Screenshot per App Store
├── android/                     # File specifici Android
│   ├── play-store-metadata.json # Metadati Google Play
│   ├── privacy-policy.json      # Privacy policy Android
│   └── screenshots/             # Screenshot per Play Store
├── assets/                      # Asset grafici condivisi
│   ├── icon.png                 # Icona app 1024x1024
│   ├── splash.png               # Splash screen
│   └── feature-graphic.png      # Feature graphic Play Store
└── screenshots/                 # Script per generare screenshot
    ├── generate-ios.sh
    └── generate-android.sh
```

## 🍎 iOS App Store

### Status Attuale
- ✅ Bundle ID registrato: `app.rork.stappa-drink-tracker`
- ✅ App creata su App Store Connect (ID: 6755406156)
- ✅ Build caricata su TestFlight (v1.0.0)
- ⏳ Metadata da completare
- ⏳ Screenshot da caricare
- ⏳ Submit per review

### Comandi Rapidi

```bash
# Build production iOS
eas build --platform ios --profile production

# Submit ad App Store
eas submit -p ios --latest

# Genera screenshot iOS
./deploy/screenshots/generate-ios.sh
```

### Link Utili
- App Store Connect: https://appstoreconnect.apple.com/apps/6755406156
- TestFlight: https://appstoreconnect.apple.com/apps/6755406156/testflight/ios
- Certificates: https://developer.apple.com/account/resources/certificates/list

## 🤖 Google Play Store

### Status Attuale
- ⏳ Account sviluppatore da configurare
- ⏳ App da creare su Play Console
- ⏳ Build da generare
- ⏳ Metadata da completare

### Comandi Rapidi

```bash
# Build production Android
eas build --platform android --profile production

# Submit a Play Store
eas submit -p android --latest

# Genera screenshot Android
./deploy/screenshots/generate-android.sh
```

## 🔄 Workflow Completo

### 1. Preparazione
```bash
# Verifica configurazione
npm run lint
npx expo-doctor

# Test locale
npx expo start
```

### 2. Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Entrambi
eas build --platform all --profile production
```

### 3. Test
```bash
# Installa su TestFlight (iOS) o Internal Testing (Android)
# Testa su dispositivi reali
```

### 4. Metadata & Screenshots
```bash
# Genera screenshot
./deploy/screenshots/generate-ios.sh
./deploy/screenshots/generate-android.sh

# Compila metadata su portali
# - App Store Connect
# - Google Play Console
```

### 5. Submit
```bash
# iOS
eas submit -p ios --latest

# Android
eas submit -p android --latest
```

## 📋 Requisiti Metadata

### iOS App Store
- [ ] App Name (30 caratteri max)
- [ ] Subtitle (30 caratteri max)
- [ ] Description
- [ ] Keywords (100 caratteri max, separati da virgola)
- [ ] Support URL
- [ ] Marketing URL (opzionale)
- [ ] Privacy Policy URL
- [ ] Screenshots (6.7", 6.5", 5.5")
- [ ] App Preview Video (opzionale)
- [ ] Age Rating
- [ ] App Category

### Google Play Store
- [ ] App Name (50 caratteri max)
- [ ] Short Description (80 caratteri max)
- [ ] Full Description (4000 caratteri max)
- [ ] Screenshots (almeno 2, max 8)
- [ ] Feature Graphic (1024x500)
- [ ] App Icon (512x512)
- [ ] Content Rating
- [ ] App Category
- [ ] Privacy Policy URL

## 🔐 Privacy & Compliance

### Dati Raccolti
- Email utente (autenticazione)
- Nome e cognome
- Posizione geografica (per trovare locali)
- Foto (QR code scan, social posts)
- Cronologia consumazioni

### Compliance
- ✅ GDPR (EU)
- ✅ CCPA (California)
- ✅ Privacy Policy presente
- ✅ Terms of Service presenti
- ✅ Cookie Policy presente

### Link Documenti
- Privacy Policy: `/docs/PRIVACY_POLICY.md`
- Terms of Service: `/docs/TERMS_OF_SERVICE.md`
- Cookie Policy: `/docs/COOKIE_POLICY.md`

## 🛠 Troubleshooting

### Build Fallisce
```bash
# Pulisci cache EAS
eas build --platform ios --profile production --clear-cache

# Verifica credenziali
eas credentials

# Rigenera certificati
eas credentials -p ios
```

### Submission Fallisce
- Verifica che tutti i metadata siano compilati
- Controlla che le screenshot siano nelle dimensioni corrette
- Assicurati che Privacy Policy URL sia accessibile
- Verifica compliance con linee guida Apple/Google

## 📞 Supporto

### Contatti Apple
- Apple Developer Support: https://developer.apple.com/contact/
- App Review: https://developer.apple.com/contact/app-store/

### Contatti Google
- Play Console Help: https://support.google.com/googleplay/android-developer/

### Documentazione
- Expo EAS: https://docs.expo.dev/eas/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Store Guidelines: https://play.google.com/about/developer-content-policy/

## 🎯 Timeline Tipica

| Fase | iOS | Android |
|------|-----|---------|
| Build | 15-20 min | 20-30 min |
| Upload | 5-10 min | 5-10 min |
| Processing | 10-30 min | 1-2 ore |
| Review | 1-3 giorni | 1-7 giorni |

## ✅ Go-Live Checklist

- [ ] Build completata con successo
- [ ] Test su TestFlight/Internal Testing OK
- [ ] Tutti i metadata compilati
- [ ] Screenshot caricati (tutte le dimensioni)
- [ ] Privacy Policy URL attivo e raggiungibile
- [ ] Age Rating/Content Rating completato
- [ ] Submitted for Review

---

**Ultimo aggiornamento**: 18 Novembre 2025  
**Versione corrente**: 1.0.0  
**Team ID Apple**: 65HWTGRJ83  
**Bundle ID**: app.rork.stappa-drink-tracker  
**Package Name Android**: app.rork.stappa-drink-tracker
