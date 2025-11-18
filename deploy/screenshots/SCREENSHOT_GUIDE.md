# 📸 Screenshot iOS - Guida Rapida

## ⚠️ Xcode Non Installato

Per generare screenshot automaticamente serve Xcode. Hai 3 opzioni:

### Opzione 1: Installa Xcode (Consigliato)
```bash
# 1. Scarica Xcode da App Store (gratis, ~15GB)
open -a "App Store"
# Cerca "Xcode" e installa

# 2. Dopo installazione, configura command line tools
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# 3. Accetta licenza
sudo xcodebuild -license accept

# 4. Installa simulatori iOS
xcodebuild -downloadPlatform iOS

# 5. Genera screenshot
./deploy/screenshots/generate-ios.sh
```

### Opzione 2: Screenshot Manuali da TestFlight

Se hai l'iPhone fisico:

1. **Installa app da TestFlight**
   - Apri email invito TestFlight
   - Installa su iPhone
   
2. **Cattura screenshot native**
   - iPhone con notch: Tasto Volume Up + Tasto Power
   - iPhone con Home: Tasto Home + Tasto Power
   
3. **Screenshot richiesti**:
   - Home/Login
   - Selezione Bar
   - Dashboard Utente
   - Scansione QR
   - Feed Social
   
4. **Verifica dimensioni** (Settings > General > About)
   - Se hai iPhone 14/15 Pro Max: ✅ Perfetto (6.7")
   - Se hai altro modello: Potrebbe servire altro device

### Opzione 3: Screenshot da Desktop (Semplice!)

Uso tool online o software di design:

1. **Usa Mockup Generator Online**:
   - https://mockuphone.com
   - https://shots.so
   - https://previewed.app
   
2. **Carica UI screenshots da web/simulator**
   
3. **Genera mockup device per tutte le dimensioni**

### Opzione 4: Screenshot Web + Resize

Se hai versione web dell'app:

```bash
# 1. Avvia versione web
npx expo start --web

# 2. Apri browser con dimensioni device
# Chrome DevTools > Toggle Device Toolbar

# 3. Imposta dimensioni:
# - iPhone 14 Pro Max: 430 x 932 (viewport)
# - iPhone 11 Pro Max: 414 x 896
# - iPhone 8 Plus: 414 x 736

# 4. Screenshot con estensione browser
# GoFullPage (Chrome) o simili

# 5. Resize con tool:
convert input.png -resize 1290x2796! output.png
```

## 🎨 Template Screenshot Ready-Made

Ho preparato un template per velocizzare:

### Testi da includere negli screenshot:

**Screenshot 1 - Home/Login**
```
"Benvenuto in Stappa"
"Traccia i tuoi drink preferiti"
[Login form visible]
```

**Screenshot 2 - Select Bar**
```
"Trova bar vicini"
"12 locali nelle vicinanze"
[Map with pins]
```

**Screenshot 3 - Dashboard**
```
"Il tuo profilo"
"23 birre questo mese"
"#5 in classifica"
[Stats cards]
```

**Screenshot 4 - QR Scan**
```
"Scansiona QR code"
"Traccia automaticamente"
[Camera view with QR frame]
```

**Screenshot 5 - Social**
```
"Feed Social"
"Condividi con la community"
[Posts with images]
```

## 📐 Dimensioni Esatte Required

Apple richiede esattamente queste dimensioni:

| Device | Dimensione Screenshot | Pixel |
|--------|----------------------|-------|
| iPhone 6.7" | iPhone 14/15 Pro Max | 1290 × 2796 |
| iPhone 6.5" | iPhone 11 Pro Max | 1242 × 2688 |
| iPhone 5.5" | iPhone 8 Plus | 1242 × 2208 |

**IMPORTANTE**: 
- Formato PNG o JPEG
- No bordi trasparenti
- No status bar con dati finti
- Orientamento Portrait
- Risoluzione reale device (no upscale)

## 🚀 Quick Solution: Usa Figma

Se hai Figma (gratis):

1. **Crea nuovo file Figma**
2. **Frame presets**:
   - iPhone 14 Pro Max (1290 × 2796)
   - iPhone 11 Pro Max (1242 × 2688)  
   - iPhone 8 Plus (1242 × 2208)
3. **Design screenshots** o incolla da altre fonti
4. **Export** PNG a dimensioni esatte
5. **Upload** su App Store Connect

Template Figma community:
- "iOS App Screenshots Template"
- "App Store Screenshot Mockups"

## ✅ Verifica Screenshots

Prima di upload, check:
- [ ] Tutte le dimensioni presenti (3 device)
- [ ] Almeno 1 screenshot per device (max 10)
- [ ] Contenuto leggibile e chiaro
- [ ] No watermark o placeholder
- [ ] No crash/errori visibili
- [ ] Rappresentano veramente l'app

## 📤 Upload su App Store Connect

1. Vai a: https://appstoreconnect.apple.com/apps/6755406156
2. **App Store** tab
3. **Screenshots and App Preview** section
4. Click **+** per ogni dimensione device
5. Drag & drop screenshots (ordine = ordine visualizzazione)
6. **Save**

---

**Nota**: Anche senza Xcode puoi completare metadata e submit. Screenshot possono essere aggiunti dopo (serve almeno 1 per dimension, ma puoi aggiungere placeholders temporanei e aggiornarli).

**Quick hack per launch veloce**: 
- Usa screenshots web resize
- Submit con screenshots "good enough"
- Update con screenshots perfetti nella versione 1.0.1

Apple NON rifiuta per screenshot non perfetti, purché rappresentino l'app realmente.
