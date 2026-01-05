# 🍺 GUIDA SISTEMA MUG - Stappa App

## Indice
1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Fasi del Mug](#fasi-del-mug)
4. [Logica Promo](#logica-promo)
5. [Animazioni](#animazioni)
6. [File SVG](#file-svg)
7. [Componenti](#componenti)
8. [API e Props](#api-e-props)
9. [Formule Matematiche](#formule-matematiche)
10. [Debug e Troubleshooting](#debug-e-troubleshooting)
11. [Estensioni Future](#estensioni-future)

---

## Panoramica

Il sistema Mug è l'indicatore visuale principale del progresso dell'utente verso il completamento di una promo in un locale (stabilimento). 

**Concetto chiave**: Un boccale di birra che si riempie progressivamente quando l'utente valida QR code (shots).

### Principi fondamentali:
- **Un mug per venue**: Ogni locale ha la sua promo con il suo mug
- **Configurazione dinamica**: Il numero di tacchette dipende dalla promo
- **3 fasi distinte**: Vuoto → Riempimento → Pieno con overflow

---

## Architettura

```
components/
├── BeerMug.tsx        # Componente React principale
├── BeerMugPaths.ts    # Path SVG per le 3 fasi
└── [vecchi file eliminati]

C:\Users\Clore\Desktop\mug\    # File SVG sorgente
├── MUG EMPTY.txt      # Fase 1: Mug vuoto
├── MUG .txt           # Fase 2: Mug in riempimento  
├── MUG FULL.txt       # Fase 3: Mug pieno con schiuma
└── TASK.txt           # Documentazione requisiti
```

### Script di estrazione:
- `extract_all_mugs.py`: Estrae i path da tutti i file SVG e genera `BeerMugPaths.ts`

---

## Fasi del Mug

### Fase 1 - MUG VUOTO (Empty)
- **Quando**: `currentShots === 0`
- **Visualizzazione**: Solo vetro del boccale, nessun liquido
- **File SVG**: `MUG EMPTY.txt`
- **Elementi visibili**: Glass (vetro), Notches (tacchette rosse)

### Fase 2 - MUG IN RIEMPIMENTO (Filling)
- **Quando**: `0 < currentShots < maxShots`
- **Visualizzazione**: Liquido arancione che sale progressivamente
- **File SVG**: `MUG .txt`
- **Elementi visibili**: Glass, Notches, Liquid (animato)

### Fase 3 - MUG PIENO CON OVERFLOW (Full)
- **Quando**: `currentShots >= maxShots`
- **Visualizzazione**: Mug pieno con schiuma che trabocca
- **File SVG**: `MUG FULL.txt`
- **Elementi visibili**: Glass, Notches, Liquid, Foam (schiuma animata)

---

## Logica Promo

### Definizione Promo
Ogni locale ha una promo attiva che definisce:
- **Max shots**: Numero massimo di QR code da validare (1-10)
- **Premio**: Drink gratis al completamento

### Formula Tacchette Rosse
```
numeroTacchette = maxShots - 2
```

| Max Shots | Tacchette |
|-----------|-----------|
| 10        | 8         |
| 7         | 5         |
| 5         | 3         |
| 3         | 1         |
| 2         | 0         |
| 1         | 0         |

### Progressione Shots

Per ogni shot validato:
1. **Shots 1 → (maxShots-2)**: Liquido sale fino alla tacchetta corrispondente
2. **Shot penultimo (maxShots-1)**: Liquido raggiunge il BORDO del mug (oltre l'ultima tacchetta)
3. **Shot ultimo (maxShots)**: Passa alla FASE 3 con schiuma overflow

### Casi Speciali

#### Promo = 1 shot
- Solo 2 SVG: Empty → Full
- Nessuna fase intermedia
- Nessuna tacchetta

#### Promo = 2 shots
- 3 SVG ma 0 tacchette
- Shot 1: intermedio (liquido a metà)
- Shot 2: overflow

---

## Animazioni

### 1. Oscillazione Mug (Pendolo)
```typescript
// Movimento: sinistra → centro → destra → centro (loop infinito)
duration: 8000ms totali
rotation: ±2 gradi
easing: Easing.inOut(Easing.sin)
```

**Comportamento**:
- Movimento continuo e fluido
- Nessun reset brusco (no effetto GIF)
- Simula oscillazione di un pendolo/campana

### 2. Riempimento Liquido
```typescript
duration: 1500ms
easing: Easing.out(Easing.cubic)
```

**Comportamento**:
- Il liquido sale dal basso verso l'alto
- Animazione morbida con decelerazione finale
- Si attiva quando cambia `currentShots`

### 3. Animazione Bolle
```typescript
duration: 3000ms (loop)
movement: translateY -50px
```

**Comportamento**:
- Bolle si muovono verso l'alto dentro il liquido
- Movimento continuo durante Fase 2 e 3
- Effetto "vivo" nel liquido

### 4. Animazione Schiuma (Fase 3)
```typescript
duration: 1200ms
delay: 500ms  
easing: Easing.out(Easing.bounce)
```

**Comportamento**:
- Schiuma appare con effetto bounce
- Solo in Fase 3 (overflow)
- Effetto "traboccamento" dalla cima

---

## File SVG

### Struttura SVG
Ogni file SVG contiene path con attributi:
- `fill`: Colore del path
- `data-section`: Categoria (schiuma_beige, liquido_arancione, tacchette_rosse)
- `opacity`: Trasparenza

### Categorie Path
| Categoria | Colori tipici | data-section |
|-----------|---------------|--------------|
| Glass (vetro) | #FDFDFD, #C6D8D7, #CADCDA | - |
| Liquid (liquido) | #E58B06, #E38905, #EA9607 | liquido_arancione |
| Foam (schiuma) | #F7EFC1, #EDD9A4, #F7F2CC | schiuma_beige |
| Notches (tacchette) | #951D08 | tacchette_rosse |

### ViewBox
```
viewBox="0 0 1696 2528"
```

---

## Componenti

### BeerMug.tsx

```typescript
interface BeerMugProps {
  currentShots: number;   // Shots attuali (0 = vuoto)
  maxShots: number;       // Max shots della promo (1-10)
  size?: number;          // Larghezza in pixel (default: 300)
  animated?: boolean;     // Abilita animazioni (default: true)
  onComplete?: () => void; // Callback quando mug è pieno
}
```

### BeerMugPaths.ts

```typescript
interface MugPath {
  d: string;      // Path SVG
  fill: string;   // Colore
  opacity?: number;
}

interface MugPhase {
  glass: MugPath[];   // Path vetro
  liquid: MugPath[];  // Path liquido
  foam: MugPath[];    // Path schiuma
  notch: MugPath[];   // Path tacchette
}

// Export
PHASE_EMPTY: MugPhase     // Fase 1
PHASE_FILLING: MugPhase   // Fase 2
PHASE_FULL: MugPhase      // Fase 3
MUG_VIEWBOX: string       // "0 0 1696 2528"
```

---

## API e Props

### Utilizzo Base

```tsx
import BeerMug from '@/components/BeerMug';

<BeerMug
  currentShots={3}
  maxShots={10}
  size={300}
  onComplete={() => alert('Drink gratis!')}
/>
```

### Con Context della Promo

```tsx
const { progress, activePromo } = useBar();

<BeerMug
  currentShots={progress}
  maxShots={activePromo?.ticketsRequired || 10}
  size={260}
  animated={true}
  onComplete={handleFreeDrink}
/>
```

---

## Formule Matematiche

### Calcolo Tacchette
```typescript
function getNotchCount(maxShots: number): number {
  return Math.max(0, maxShots - 2);
}
```

### Calcolo Percentuale Riempimento
```typescript
function getLiquidFillPercentage(currentShots: number, maxShots: number): number {
  if (currentShots <= 0) return 0;
  if (currentShots >= maxShots) return 1;
  
  const notchCount = maxShots - 2;
  
  // Penultimo shot = quasi al bordo (95%)
  if (currentShots === maxShots - 1) return 0.95;
  
  // Shot normali: proporzionale alle tacchette
  const fillPerNotch = 0.85 / notchCount;
  return Math.min(currentShots * fillPerNotch, 0.85);
}
```

### Selezione Tacchette Dinamica
```typescript
function selectNotchPaths(notchPaths: MugPath[], maxShots: number): MugPath[] {
  const count = getNotchCount(maxShots);
  if (count <= 0) return [];
  
  // Distribuisce uniformemente le tacchette
  const step = notchPaths.length / count;
  return Array.from({ length: count }, (_, i) => 
    notchPaths[Math.floor(i * step)]
  );
}
```

---

## Debug e Troubleshooting

### Il mug non si vede
1. Verifica che `BeerMugPaths.ts` sia stato generato correttamente
2. Controlla la console per errori di import
3. Verifica che il size sia > 0

### Le animazioni non funzionano
1. Controlla che `animated={true}` sia passato
2. Su Android/iOS simulatore le animazioni potrebbero essere lente
3. Verifica che `useNativeDriver` sia supportato per le animazioni

### Le tacchette non corrispondono
1. Verifica che `maxShots` sia passato correttamente
2. Controlla la formula: tacchette = maxShots - 2
3. Promo con 1-2 shots NON hanno tacchette

### Il liquido non si riempie
1. Controlla che `currentShots` cambi effettivamente
2. Verifica che la fase sia "filling" o "full"
3. L'animazione richiede `useNativeDriver: false` per height

### Come rigenerare i path SVG
```powershell
cd C:\Users\Clore\Sviluppo\Stappa
.\.venv\Scripts\python.exe extract_all_mugs.py
```

---

## Estensioni Future

### 1. SVG Dinamici per Promo
Generare varianti SVG con numero corretto di tacchette per ogni promo.

### 2. Temi Colore
Supportare diversi colori per il liquido (birra chiara, scura, cocktail).

### 3. Suoni
Aggiungere effetti sonori per:
- Riempimento liquido
- Bolle
- Overflow schiuma

### 4. Particelle/Effetti
- Gocce che scendono dalla schiuma
- Bolle più realistiche con fisica
- Riflessi sul vetro animati

### 5. Gesture
- Tap per versare manualmente
- Shake per agitare il mug

---

## File Eliminati (Vecchia Logica)

I seguenti file sono stati eliminati durante la pulizia:
- `BeerMug.backup.tsx`
- `BeerMug.new.tsx`
- `BeerMug.old.tsx`
- `BeerMugNew.tsx`

---

## Changelog

### v2.0.0 (Rewrite Completo)
- ✅ Eliminata vecchia logica
- ✅ Nuovo sistema 3 fasi (Empty, Filling, Full)
- ✅ Tacchette dinamiche basate su promo
- ✅ Animazione oscillazione pendolo
- ✅ Animazione riempimento liquido
- ✅ Animazione bolle
- ✅ Animazione schiuma overflow
- ✅ Estratti path da nuovi file SVG

---

## Contatti

Per domande sul sistema mug, consultare:
- `TASK.txt` in `C:\Users\Clore\Desktop\mug\`
- Questo documento (`GUIDA_MUG.md`)
- Codice sorgente in `components/BeerMug.tsx`
