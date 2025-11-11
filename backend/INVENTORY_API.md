# 📦 Inventory Management with AI - API Documentation

## Overview

Sistema completo di gestione inventario con riconoscimento AI delle bottiglie tramite foto.

### Permessi:
- **ROOT**: Accesso completo
- **SENIOR_MERCHANT**: Gestione completa inventario del proprio locale
- **MERCHANT con `canManageStock: true`**: Può gestire inventario ma non eliminare articoli

---

## Articles API (Anagrafica Articoli)

### Get Articles
```http
GET /api/articles/establishment/:establishmentId?category=BEER&search=heineken&lowStock=true
```
**Query params:**
- `category`: BEER, WINE, SPIRITS, COCKTAIL, SOFT_DRINK, FOOD, OTHER
- `search`: Cerca in nome e brand
- `lowStock`: true per mostrare solo articoli sotto soglia minima

**Response:**
```json
{
  "articles": [
    {
      "id": "...",
      "name": "Heineken 33cl",
      "category": "BEER",
      "brand": "Heineken",
      "size": "33cl",
      "currentStock": 24,
      "minStock": 10,
      "imageUrl": "/uploads/...",
      "_count": {
        "stockEntries": 15
      }
    }
  ]
}
```

### Get Single Article
```http
GET /api/articles/:id
```

**Response:** Include storico movimenti ultimi 20

### Create Article
```http
POST /api/articles
```
**Headers:** Authorization required (SENIOR_MERCHANT, MERCHANT with canManageStock, or ROOT)

**Body:**
```json
{
  "establishmentId": "...",
  "name": "Heineken 33cl",
  "category": "BEER",
  "brand": "Heineken",
  "size": "33cl",
  "description": "Birra lager olandese",
  "barcode": "8712000042127",
  "imageUrl": "https://...",
  "initialStock": 50,
  "minStock": 10
}
```

### Update Article
```http
PUT /api/articles/:id
```
**Body:** Stessi campi di create (tutti opzionali)

### Delete Article
```http
DELETE /api/articles/:id
```
**Headers:** Solo SENIOR_MERCHANT o ROOT

---

## Stock Management API

### Get Stock Overview
```http
GET /api/stock/establishment/:establishmentId?lowStock=true&category=BEER
```

**Response:**
```json
{
  "articles": [
    {
      "id": "...",
      "name": "Heineken 33cl",
      "category": "BEER",
      "brand": "Heineken",
      "currentStock": 5,
      "minStock": 10,
      "imageUrl": "..."
    }
  ]
}
```

### Update Stock (Add/Remove)
```http
POST /api/stock/update/:articleId
```
**Body:**
```json
{
  "quantity": 20,
  "type": "manual",
  "notes": "Rifornimento settimanale"
}
```
**Note:** quantity può essere positivo (aggiunta) o negativo (rimozione)

### Set Stock (Absolute Value)
```http
POST /api/stock/set/:articleId
```
**Body:**
```json
{
  "newStock": 50,
  "notes": "Inventario fisico"
}
```

### Get Stock History
```http
GET /api/stock/history/:establishmentId?articleId=...&limit=50
```

**Response:**
```json
{
  "entries": [
    {
      "id": "...",
      "quantity": 20,
      "type": "photo_ai",
      "notes": "Added via AI photo recognition",
      "createdAt": "2025-11-11T10:30:00Z",
      "article": {
        "id": "...",
        "name": "Heineken 33cl"
      },
      "user": {
        "id": "...",
        "username": "mario_rossi",
        "role": "SENIOR_MERCHANT"
      },
      "stockPhoto": {
        "id": "...",
        "imageUrl": "/uploads/stock/..."
      }
    }
  ]
}
```

---

## AI Photo Recognition API

### 1. Upload Photo
```http
POST /api/stock-photos/upload
```
**Headers:** Authorization required + Content-Type: multipart/form-data

**Body:**
```
photo: [file]
establishmentId: "..."
```

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "stockPhoto": {
    "id": "...",
    "imageUrl": "/uploads/stock/stock-1234567890.jpg",
    "status": "PENDING"
  }
}
```

### 2. Analyze Photo with AI
```http
POST /api/stock-photos/analyze/:photoId
```

**Response:**
```json
{
  "message": "Photo analyzed successfully",
  "recognitions": [
    {
      "id": "...",
      "detectedName": "Heineken Beer Bottle",
      "detectedBrand": "Heineken",
      "confidence": 0.92,
      "quantity": 3,
      "status": "PENDING",
      "article": {
        "id": "...",
        "name": "Heineken 33cl",
        "brand": "Heineken",
        "imageUrl": "..."
      },
      "boundingBox": {
        "x": 100,
        "y": 150,
        "width": 80,
        "height": 200
      }
    },
    {
      "id": "...",
      "detectedName": "Wine Bottle Red",
      "detectedBrand": "Unknown",
      "confidence": 0.65,
      "quantity": 2,
      "status": "PENDING",
      "article": null,
      "boundingBox": { }
    }
  ],
  "totalDetected": 5,
  "needsReview": 1
}
```

### 3. Get Stock Photo Details
```http
GET /api/stock-photos/:photoId
```

**Response:** Include tutte le recognitions

### 4. Confirm/Correct Single Recognition
```http
PATCH /api/stock-photos/recognition/:recognitionId
```

**Body:**
```json
{
  "articleId": "...",
  "quantity": 3,
  "status": "CONFIRMED",
  "notes": "Corrected article match"
}
```

### 5. Confirm All and Update Stock
```http
POST /api/stock-photos/confirm/:photoId
```

**Body:**
```json
{
  "recognitions": [
    {
      "recognitionId": "...",
      "articleId": "...",
      "quantity": 3
    },
    {
      "recognitionId": "...",
      "articleId": "...",
      "quantity": 5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Stock updated successfully from AI recognitions",
  "updated": 2,
  "results": [
    {
      "articleId": "...",
      "quantity": 3,
      "stockEntry": { }
    }
  ]
}
```

---

## Flow Completo AI Recognition

### Scenario 1: Bottiglia Riconosciuta

```
1. Merchant fa foto
   POST /api/stock-photos/upload

2. Analisi AI
   POST /api/stock-photos/analyze/:photoId
   → AI riconosce "Heineken" con confidence 0.92
   → Match automatico con articolo esistente

3. Merchant conferma
   "Ho evidenziato 3 bottiglie Heineken. Confermo?"
   → YES

4. Update stock
   POST /api/stock-photos/confirm/:photoId
   → Stock aggiornato automaticamente
```

### Scenario 2: Bottiglia Nuova (Non in Anagrafica)

```
1. Merchant fa foto
2. Analisi AI
   → AI rileva "Corona Extra" confidence 0.88
   → NESSUN match in anagrafica (article: null)

3. Merchant vede
   "Ho rilevato un articolo nuovo: Corona Extra"
   "Vuoi aggiungerlo all'anagrafica?"
   → YES → Create article
   
4. Merchant associa
   PATCH /api/stock-photos/recognition/:recognitionId
   { "articleId": "newly-created-id", "quantity": 5 }

5. Conferma finale
   POST /api/stock-photos/confirm/:photoId
```

### Scenario 3: Correzione Quantità

```
1-2. Upload + Analyze

3. AI dice: "5 bottiglie Heineken"
   Merchant vede solo 3 in realtà

4. Corregge
   PATCH /api/stock-photos/recognition/:recognitionId
   { "quantity": 3 }

5. Conferma
   POST /api/stock-photos/confirm/:photoId
```

---

## Enums

### ArticleCategory
```
BEER
WINE
SPIRITS
COCKTAIL
SOFT_DRINK
FOOD
OTHER
```

### RecognitionStatus
```
PENDING      - In attesa conferma merchant
CONFIRMED    - Merchant ha confermato
REJECTED     - Merchant ha rifiutato
MODIFIED     - Merchant ha modificato
```

### Stock Entry Types
```
manual       - Modifica manuale
photo_ai     - Aggiunto via foto AI
sale         - Vendita
waste        - Scarto/rottura
```

---

## User Permissions

### Flag `canManageStock`
```typescript
// Senior merchant può abilitare merchant per gestione stock
PUT /api/users/:merchantId
{
  "canManageStock": true
}
```

**Chi può gestire inventario:**
- ROOT: sempre
- SENIOR_MERCHANT: sempre (solo del proprio locale)
- MERCHANT: solo se `canManageStock === true`

---

## Database Tables

### Article
- Anagrafica articoli
- Un articolo per establishment
- Include currentStock, minStock
- Opzionale: barcode, imageUrl, visualFeatures (per AI)

### StockEntry
- Traccia ogni movimento di stock
- Quantity positivo = aggiunta, negativo = rimozione
- Collegato a User (chi ha fatto) e opzionalmente StockPhoto

### StockPhoto
- Foto caricate per analisi AI
- Status: PENDING → CONFIRMED/REJECTED
- Include totalItemsDetected

### ArticleRecognition
- Singola bottiglie rilevata in foto
- Può essere associata a Article esistente o null
- Include confidence, quantity, boundingBox
- Merchant può correggere con correctedArticleId e correctedQuantity

---

## AI Integration Notes

Attualmente il sistema usa dati mock. Per produzione, integrare:

### OpenAI GPT-4 Vision
```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Identify all bottles in this image. For each bottle, provide: brand, product name, quantity, confidence (0-1)" },
      { type: "image_url", image_url: { url: imageUrl } }
    ]
  }],
  max_tokens: 1000
});
```

### Google Cloud Vision API
```javascript
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const [result] = await client.objectLocalization(imageUrl);
const objects = result.localizedObjectAnnotations;
```

### AWS Rekognition
```javascript
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

const params = {
  Image: { S3Object: { Bucket: 'stappa', Key: 'stock-photo.jpg' } },
  MaxLabels: 20
};
const data = await rekognition.detectLabels(params).promise();
```

---

## Testing

```bash
# Test upload foto
curl -X POST http://localhost:3000/api/stock-photos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@bottle.jpg" \
  -F "establishmentId=..."

# Test analisi AI
curl -X POST http://localhost:3000/api/stock-photos/analyze/PHOTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test conferma
curl -X POST http://localhost:3000/api/stock-photos/confirm/PHOTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recognitions":[{"recognitionId":"...","articleId":"...","quantity":5}]}'
```

---

## Frontend Flow (da implementare)

1. **Schermata Articoli** (`/merchant/articles`)
   - Lista articoli con filtri
   - CRUD articoli
   - Badge "Sotto scorta" per lowStock

2. **Schermata Stock** (`/merchant/stock`)
   - Overview inventario
   - Modifica manuale quantità
   - Accesso a "Scan con AI"

3. **Camera AI** (`/merchant/stock/scan`)
   - Camera live o scelta foto
   - Upload automatico
   - Analisi AI in background
   - Mostra recognitions

4. **Review Recognitions** (`/merchant/stock/review/:photoId`)
   - Lista articoli rilevati
   - Per ogni riconoscimento:
     - "✅ Heineken 33cl - 3 pezzi" (già associato)
     - "❓ Articolo nuovo: Corona - 5 pezzi" (non associato)
   - Bottoni: Conferma / Correggi / Elimina
   - Conferma finale → Update stock
