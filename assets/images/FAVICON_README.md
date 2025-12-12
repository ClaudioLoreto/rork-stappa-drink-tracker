# Stappa Favicon

## File Creati

- **`stappa-favicon.svg`** - Icona vettoriale Stappa (boccale di birra arancione su sfondo arancione)

## Come Convertire SVG in PNG (favicon.png)

Hai diverse opzioni per convertire l'SVG in PNG:

### Opzione 1: Online (Più Semplice)
1. Vai su https://cloudconvert.com/svg-to-png
2. Carica `stappa-favicon.svg`
3. Imposta dimensioni: **48x48 pixel** o **512x512 pixel** (per alta qualità)
4. Scarica il PNG
5. Rinomina in `favicon.png`
6. Sostituisci il file in `assets/images/favicon.png`

### Opzione 2: Con ImageMagick (da terminale)
```bash
# Installa ImageMagick se non ce l'hai
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Converti SVG in PNG
cd assets/images
magick convert stappa-favicon.svg -resize 48x48 favicon.png
```

### Opzione 3: Con Inkscape
1. Apri `stappa-favicon.svg` con Inkscape (https://inkscape.org/)
2. File > Export PNG Image
3. Imposta Width/Height: 48px o 512px
4. Esporta come `favicon.png`

### Opzione 4: Con Figma/Adobe XD
1. Importa l'SVG in Figma o Adobe XD
2. Esporta come PNG 48x48px
3. Salva come `favicon.png`

## Icone Aggiuntive (Opzionale)

Per un'esperienza completa, potresti voler aggiornare anche:

- **`icon.png`** (1024x1024) - Icona app per iOS/Android
- **`adaptive-icon.png`** (1024x1024) - Icona adattiva Android
Puoi usare lo stesso design del boccale di birra, scalato opportunamente.

## Design del Favicon

Il favicon Stappa include:
- 🍺 **Boccale di birra bianco** con schiuma
- 🟠 **Sfondo arancione** (colore brand #FF6B35)
- 💧 **Bollicine** per effetto dinamico
- 🎨 **Angoli arrotondati** per stile moderno

## Test del Favicon

Dopo aver sostituito il file:
1. Riavvia il server Expo: `Ctrl+C` poi `npx expo start --web`
2. Apri http://localhost:8082
3. Controlla la tab del browser - dovresti vedere il nuovo favicon!

## Nota per Produzione

Il favicon viene cachato aggressivamente dai browser. Per vedere le modifiche:
- Chrome/Edge: Apri DevTools > Application > Clear storage
- Firefox: Ctrl+Shift+Delete > Cache
- Safari: Develop > Empty Caches

O apri in modalità incognito per vedere subito il nuovo favicon.
