# 🍺 Stappa Drink Tracker

**Traccia drink, sblocca sconti, scopri bar!**  
Un'app React Native cross-platform per tracciare consumazioni e partecipare a promozioni esclusive nei bar.

[![Platform - iOS & Android](https://img.shields.io/badge/Platform-iOS%20%26%20Android-blue)]()
[![Framework - React Native + Expo](https://img.shields.io/badge/Framework-React%20Native%20+%20Expo-purple)]()
[![Backend - Node.js + PostgreSQL](https://img.shields.io/badge/Backend-Node.js%20+%20PostgreSQL-green)]()

---

## 📱 Cos'è Stappa?

**Stappa Drink Tracker** è un'app mobile nativa che rivoluziona il modo di vivere la vita notturna:

🍻 **Traccia i tuoi drink** - Scansiona QR code nei bar  
🎯 **Sblocca promozioni** - Accumula progressi e ottieni sconti  
📍 **Scopri locali** - Trova bar vicino a te con la mappa  
🏆 **Social & Community** - Condividi foto, storie e momenti  
💼 **Dashboard Merchant** - Gestisci il tuo bar, promo e stock

---

## 🚀 Quick Start

### Installazione

\`\`\`bash
# Clona il repository
git clone https://github.com/ClaudioLoreto/rork-stappa-drink-tracker.git
cd rork-stappa-drink-tracker

# Installa dipendenze
npm install

# Avvia development server
npx expo start
\`\`\`

### Esegui su dispositivo

\`\`\`bash
# iOS (richiede Mac con Xcode)
npx expo start --ios

# Android (richiede Android Studio o emulatore)
npx expo start --android

# Web (per test rapidi)
npx expo start --web
\`\`\`

---

## 📂 Struttura Progetto

\`\`\`
rork-stappa-drink-tracker/
├── 📱 app/                    # Screens (Expo Router)
├── 🔧 backend/                # API Server Express + Prisma
├── 🎨 components/             # Componenti riutilizzabili
├── 🌐 services/               # API Services
├── 🎯 contexts/               # React Contexts
├── 🚀 deploy/                 # 📦 DEPLOYMENT
│   ├── guides/               # Guide generali
│   ├── ios/                  # 🍎 iOS App Store
│   ├── android/              # 🤖 Android Google Play
│   └── shared/               # Risorse condivise
├── 📄 docs/                   # Documentazione progetto
└── 🎨 assets/                 # Assets statici
\`\`\`

**📚 Guide Deployment Complete**:
- [deploy/README.md](deploy/README.md) - Overview deployment
- [deploy/ios/APP_STORE_CONNECT_GUIDE.md](deploy/ios/APP_STORE_CONNECT_GUIDE.md) - iOS
- [deploy/android/GOOGLE_PLAY_GUIDE.md](deploy/android/GOOGLE_PLAY_GUIDE.md) - Android
- [deploy/guides/DEPLOY_BACKEND.md](deploy/guides/DEPLOY_BACKEND.md) - Backend

---

## 🛠️ Stack Tecnologico

### Frontend
- **React Native** 0.81.5 + **Expo** ~54.0.22
- **TypeScript** + **Expo Router**
- **React Query** (data fetching)
- **Zustand** (state management)

### Backend
- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT Authentication**

### Deployment
- **EAS Build** (iOS & Android builds)
- **Railway** (backend hosting)
- **App Store Connect** + **Google Play Console**

---

## 🎯 Features Principali

### 👥 Per Utenti
✅ QR Scanning | ✅ Mappa Bar | ✅ Promozioni | ✅ Social Feed | ✅ Dashboard | ✅ Multilingua

### 💼 Per Merchant
✅ Dashboard Merchant | ✅ Gestione Promozioni | ✅ QR Generator | ✅ Analytics | ✅ Stock Management

### 🔐 Per Admin
✅ Admin Dashboard | ✅ User Management | ✅ Establishment Management | ✅ Bug Reports

---

## 🚀 Deployment

### iOS App Store

\`\`\`bash
eas build --platform ios --profile production
eas submit --platform ios --latest
\`\`\`

**Guide**: [deploy/ios/](deploy/ios/)

### Android Google Play

\`\`\`bash
eas build --platform android --profile production
eas submit --platform android --latest
\`\`\`

**Guide**: [deploy/android/](deploy/android/)

### Backend API

**Railway** (consigliato): Connetti GitHub repo → Auto-deploy

**Guide**: [deploy/guides/DEPLOY_BACKEND.md](deploy/guides/DEPLOY_BACKEND.md)

---

## 🌍 Cross-Platform Development

### ✅ Windows Development
- Sviluppo frontend completo
- Build tramite EAS (non serve Mac!)
- Backend deployment

### ✅ macOS Development
- Tutto Windows +
- Build iOS locale
- Testing simulatore iOS

---

## 📦 Identifiers

| Chiave | Valore |
|--------|--------|
| **Bundle ID (iOS)** | `app.rork.stappa-drink-tracker` |
| **Package Name (Android)** | `app.rork.stappadrinktracker` |
| **Expo Project ID** | `c0a486cf-b2c2-4bd0-a508-a40c8e0aed06` |
| **App Store ID** | `6755406156` |
| **Apple Team ID** | `65HWTGRJ83` |

---

## 🧪 Test Accounts
**User**: demo / Demo1234@ / demo@stappa.app  
**Merchant**: merchant_demo / Merchant1234@ / merchant@stappa.app  
**Admin**: root / Root1234@ / root@rork.com

---

## �� Legal & Compliance

- ✅ Privacy Policy: [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)
- ✅ Terms of Service: [docs/TERMS_OF_SERVICE.md](docs/TERMS_OF_SERVICE.md)
- ✅ GDPR/CCPA compliant
- ✅ Age Rating: 17+ (iOS) / 18+ (Android)

**Copyright**: © 2025 Rork - Claudio Loreto

---

## 🐛 Known Issues

- **NativeWind**: Temporaneamente disabilitato (usando StyleSheet)
- **Path Aliases**: ✅ Risolto con babel-plugin-module-resolver

Dettagli: [deploy/guides/SESSION_CONTINUITY.md](deploy/guides/SESSION_CONTINUITY.md#-known-issues--workarounds)

---

## 📞 Support

**Issues**: [GitHub Issues](https://github.com/ClaudioLoreto/rork-stappa-drink-tracker/issues)  
**Email**: cloreto71@gmail.com  
**Developer**: Claudio Loreto

### Useful Links
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

---

**Made with ❤️ by Claudio Loreto**  
**Powered by React Native + Expo** 🚀
