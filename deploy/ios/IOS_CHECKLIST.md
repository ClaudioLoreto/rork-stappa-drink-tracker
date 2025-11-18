# 📱 iOS App Store - Deployment Checklist

## Pre-Deployment

### Account Setup
- [x] Apple Developer Program attivo ($99/anno)
- [x] Account App Store Connect configurato
- [x] Team ID: **65HWTGRJ83**

### Identifiers & Certificates
- [x] Bundle ID registrato: `app.rork.stappa-drink-tracker`
- [x] Distribution Certificate generato
- [x] Provisioning Profile generato
- [x] Push Notifications capability (se necessario)

### App Store Connect
- [x] App creata (ID: **6755406156**)
- [x] Bundle ID collegato
- [ ] App Information compilata
- [ ] Pricing & Availability configurati

## Build & Upload

### Configurazione Locale
- [x] `eas.json` configurato correttamente
- [x] `app.json` con bundleIdentifier corretto
- [x] Version e buildNumber aggiornati
- [x] Icona app presente (1024x1024)

### Build Process
- [x] Build EAS completata con successo
  ```bash
  eas build --platform ios --profile production
  ```
- [x] Build artifact scaricato (.ipa)
- [x] TestFlight upload completato
  ```bash
  eas submit -p ios --latest
  ```

### TestFlight Testing
- [ ] Build visibile su TestFlight
- [ ] Internal testing completato
- [ ] Beta testing (opzionale)
- [ ] Crash reports verificati

## App Store Metadata

### App Information
- [ ] **App Name**: _________________ (30 caratteri max)
- [ ] **Subtitle**: _________________ (30 caratteri max)  
- [ ] **Primary Language**: Italian
- [ ] **Category**: Food & Drink
- [ ] **Secondary Category** (opzionale): Social Networking

### Description & Keywords
- [ ] **Promotional Text** (170 caratteri, aggiornabile senza review)
- [ ] **Description** (4000 caratteri max)
  ```
  [Da compilare con descrizione dell'app]
  ```
- [ ] **Keywords** (100 caratteri, separati da virgola)
  ```
  Suggeriti: stappa,drink,tracker,bar,pub,birra,beer,consumazioni,social,promo
  ```

### URLs
- [ ] **Support URL**: https://________________
- [ ] **Marketing URL** (opzionale): https://________________
- [ ] **Privacy Policy URL**: https://________________ (OBBLIGATORIO)

### Screenshots (OBBLIGATORI)

#### iPhone 6.7" (1290 × 2796 px)
- [ ] Screenshot 1: Home/Login
- [ ] Screenshot 2: Select Bar
- [ ] Screenshot 3: User Dashboard
- [ ] Screenshot 4: Merchant Dashboard
- [ ] Screenshot 5: Social Feed

#### iPhone 6.5" (1242 × 2688 px)
- [ ] Screenshot 1: Home/Login
- [ ] Screenshot 2: Select Bar
- [ ] Screenshot 3: User Dashboard
- [ ] Screenshot 4: Merchant Dashboard
- [ ] Screenshot 5: Social Feed

#### iPhone 5.5" (1242 × 2208 px)
- [ ] Screenshot 1: Home/Login
- [ ] Screenshot 2: Select Bar
- [ ] Screenshot 3: User Dashboard

### App Preview Video (opzionale)
- [ ] Video caricato (max 30 secondi)
- [ ] Poster frame selezionato

## Age Rating

- [ ] Questionario compilato
  - [ ] Violenza: Nessuna/Lieve
  - [ ] Contenuti sessuali: Nessuno
  - [ ] Nudità: Nessuna
  - [ ] Linguaggio offensivo: Nessuno/Lieve
  - [ ] Alcool/Tabacco: **Riferimenti frequenti** ⚠️
  - [ ] Droga: Nessuna
  - [ ] Temi horror: Nessuno
  - [ ] Gioco d'azzardo: Nessuno
  - [ ] Contest/Competizioni: Sì (promo/leaderboard)

**Rating Atteso**: 12+ o 17+ (per contenuti alcool)

## App Privacy

### Privacy Nutrition Label

Dati raccolti e motivo:

#### Dati account
- [x] Email (Account creation/login)
- [x] Nome utente (Account creation)
- [x] User ID (Analytics)

#### Posizione
- [x] Posizione precisa (Find nearby establishments)
- Linking: Linked to user
- Tracking: No

#### Contenuti utente
- [x] Foto (Social posts, profile picture)
- [x] Cronologia consumazioni (App functionality)
- Linking: Linked to user
- Tracking: No

#### Utilizzo dati
- [x] Product interaction (Analytics)
- [x] Advertising data (Promo system)
- Linking: Linked to user
- Tracking: No

### Privacy Policy
- [ ] URL privacy policy attivo e raggiungibile
- [ ] Policy aggiornata con pratiche attuali
- [ ] GDPR compliant (EU)
- [ ] CCPA compliant (California)

## App Review Information

### Contact Information
- [ ] **First Name**: _________________
- [ ] **Last Name**: _________________
- [ ] **Phone**: _________________
- [ ] **Email**: _________________

### Demo Account (se login obbligatorio)
- [ ] **Username/Email**: demo@stappa.app
- [ ] **Password**: _________________
- [ ] **Account attivo e funzionante**

### Notes for Reviewer
```
[Informazioni aggiuntive per il reviewer Apple]

Example:
- L'app richiede accesso alla fotocamera per scansionare QR code
- Posizione richiesta solo per trovare locali vicini
- Account demo fornito per testing
```

### Attachments
- [ ] Screenshot/video se feature non immediate
- [ ] Documento aggiuntivo se necessario

## Version & Build

- [ ] **Version Number**: 1.0.0 (user-facing)
- [ ] **Build Number**: 1 (deve incrementare ad ogni build)
- [ ] **Copyright**: © 2025 Rork / Claudio Loreto
- [ ] **Release Type**:
  - [ ] Manual release (controllo manuale)
  - [ ] Automatic release (appena approvata)
  - [ ] Scheduled release (data specifica)

## Export Compliance

- [x] App uses encryption: **NO**
  - Solo HTTPS (esente da dichiarazione)
- [x] `ITSAppUsesNonExemptEncryption` = `false` in Info.plist

## Pricing & Availability

- [ ] **Price**: Free
- [ ] **Availability**: All countries
- [ ] **Availability Date**: Immediate (or specific date)
- [ ] **In-App Purchases**: No

## Pre-Submission Checklist

### Technical
- [x] App compila senza errori
- [x] App funziona su dispositivi target
- [x] Nessun crash durante test
- [x] Performance accettabili
- [ ] Testata su iOS 17+ (versione minima supportata)

### Content
- [ ] Nessun contenuto offensivo
- [ ] Nessun contenuto copyrighted non autorizzato
- [ ] Screenshot accurati e aggiornati
- [ ] Description onesta (no false claims)

### Legal
- [ ] Privacy Policy presente e raggiungibile
- [ ] Terms of Service presenti
- [ ] Licenze third-party dichiarate (se necessario)
- [ ] Compliance con leggi locali

### Guidelines Apple
- [ ] Rispetta Human Interface Guidelines
- [ ] Nessuna referenza a Android/Google/altre piattaforme negli screenshot
- [ ] Nessun placeholder o "Lorem Ipsum"
- [ ] App è completa e funzionale (no beta/work-in-progress)

## Submit for Review

- [ ] Tutti i campi obbligatori compilati
- [ ] Build selezionata
- [ ] Screenshot caricate
- [ ] Privacy info complete
- [ ] **"Submit for Review"** premuto

## Post-Submission

### Monitoring
- [ ] Email di conferma ricevuta
- [ ] Status: "Waiting for Review"
- [ ] Verifica aggiornamenti status ogni giorno

### Timeline Attesa
- **In Review**: 1-3 giorni lavorativi (tipicamente 24-48h)
- **Processing**: 10-30 minuti (dopo approvazione)
- **Ready for Sale**: L'app è live!

### Possibili Outcome
- ✅ **Approved**: App live sullo store
- ⏸ **Waiting for Developer Reply**: Apple ha domande
- ❌ **Rejected**: Correggere issues e re-submit

## Post-Approval

- [ ] Verifica app live sullo store
- [ ] Test download e installazione
- [ ] Monitor recensioni e rating
- [ ] Rispondi a recensioni utenti
- [ ] Monitor crash reports su App Store Connect

## Update Future

Quando rilasci update:
1. Incrementa version number in app.json
2. Build nuova versione
3. Upload su TestFlight
4. Create new version su App Store Connect
5. Riusa screenshot se non cambiate
6. Compila "What's New" (descrizione update)
7. Submit for review

---

**Note**: 
- Primi submit richiedono più tempo (3-5 giorni possibili)
- Update successivi spesso più veloci (24-48h)
- Festività USA possono rallentare review
- In caso di rejection, correggere e re-submit velocemente

**Contatti Apple Developer Support**:
- Web: https://developer.apple.com/contact/
- Phone: Varia per paese
