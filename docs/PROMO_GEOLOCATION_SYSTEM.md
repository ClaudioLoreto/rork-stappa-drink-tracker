# Sistema Geolocalizzazione e Promo Obbligatorie

## 📋 Overview

Il sistema implementa un **carousel promozionale geolocalizzato** che mostra solo bar vicini all'utente con **promo attive obbligatorie**. Ogni merchant DEVE avere una promo attiva per poter distribuire ticket.

---

## 🎯 Funzionalità Principali

### 1. **Geolocalizzazione Utente**
- Priorità di vicinanza:
  1. **Città** (stessa città dell'utente) - 📍
  2. **Provincia** (stessa provincia) - 🗺️
  3. **Regione** (stessa regione) - 🌍
  4. **Altro** (resto d'Italia)

### 2. **Validazione Promo Attiva**
- Ogni promo ha:
  - `startDate`: Data inizio validità
  - `endDate`: Data fine validità
  - `isActive`: Flag attivo/disattivo
- La promo è valida SOLO se:
  - `isActive === true`
  - `startDate <= oggi <= endDate`

### 3. **Promo Obbligatoria**
- **Merchant NON può distribuire ticket senza promo attiva**
- Click su bar senza promo → Alert con messaggio esplicativo
- Bar senza promo vengono mostrati ma disabilitati (opacità 60%, badge warning)

### 4. **Carousel Promozionale**
- Mostra SOLO bar con promo valida
- Ordinati per vicinanza all'utente
- Badge contatore promo disponibili
- Subtitle "📍 Vicino a te"
- Click apre pagina social del bar

---

## 🗂️ Modifiche ai Types

### `User` Interface
```typescript
export interface User {
  id: string;
  // ... altri campi
  city?: string;       // NUOVO: Città utente
  province?: string;   // NUOVO: Provincia utente
  region?: string;     // NUOVO: Regione utente
  // ...
}
```

### `Establishment` Interface
```typescript
export interface Establishment {
  id: string;
  name: string;
  address: string;
  city?: string;        // NUOVO: Città esercizio
  province?: string;    // NUOVO: Provincia esercizio
  region?: string;      // NUOVO: Regione esercizio
  latitude?: number;    // NUOVO: Latitudine (futuro)
  longitude?: number;   // NUOVO: Longitudine (futuro)
  // ...
}
```

### `Promo` Interface
```typescript
export interface Promo {
  id: string;
  establishmentId: string;
  ticketCost: number;
  ticketsRequired: number;
  rewardValue: number;
  description?: string;
  startDate: string;    // NUOVO: Data inizio validità
  endDate: string;      // NUOVO: Data fine validità
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}
```

---

## 💻 Implementazione Codice

### File: `app/select-bar.tsx`

#### 1. **Funzione Validazione Promo**
```typescript
const isPromoValid = (promo: Promo): boolean => {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  return promo.isActive && now >= start && now <= end;
};
```

#### 2. **Calcolo Priorità Vicinanza**
```typescript
const getProximityScore = (establishment: Establishment): number => {
  if (!user) return 4;
  
  if (establishment.city && user.city && 
      establishment.city.toLowerCase() === user.city.toLowerCase()) {
    return 1; // Stessa città - massima priorità
  }
  if (establishment.province && user.province && 
      establishment.province.toLowerCase() === user.province.toLowerCase()) {
    return 2; // Stessa provincia
  }
  if (establishment.region && user.region && 
      establishment.region.toLowerCase() === user.region.toLowerCase()) {
    return 3; // Stessa regione
  }
  return 4; // Altro
};
```

#### 3. **Ordinamento Establishments**
```typescript
const sortedEstablishments = useMemo(() => {
  const filtered = establishments.filter((est) =>
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (est.city && est.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return filtered.sort((a, b) => {
    // 1. Prima ordina per presenza promo
    const aHasPromo = promos[a.id] !== null ? 1 : 0;
    const bHasPromo = promos[b.id] !== null ? 1 : 0;
    if (aHasPromo !== bHasPromo) {
      return bHasPromo - aHasPromo; // Con promo prima
    }
    
    // 2. Poi ordina per vicinanza
    const aProximity = getProximityScore(a);
    const bProximity = getProximityScore(b);
    if (aProximity !== bProximity) {
      return aProximity - bProximity; // Più vicini prima
    }
    
    // 3. Infine alfabetico
    return a.name.localeCompare(b.name);
  });
}, [establishments, promos, searchQuery, user]);
```

#### 4. **Filtro Carousel (Solo Bar Vicini con Promo)**
```typescript
const establishmentsWithPromos = useMemo(() => {
  return sortedEstablishments.filter((est) => {
    const promo = promos[est.id];
    return promo && isPromoValid(promo);
  });
}, [sortedEstablishments, promos]);
```

#### 5. **Blocco Selezione Bar Senza Promo**
```typescript
const handleSelectBar = async (establishment: Establishment) => {
  const promo = promos[establishment.id];
  if (!promo || !isPromoValid(promo)) {
    Alert.alert(
      t('errors.noActivePromo'),
      t('errors.merchantMustHavePromo'),
      [{ text: 'OK' }]
    );
    return; // BLOCCO: non permette selezione
  }
  
  await selectBar(establishment);
  router.replace('/user');
};
```

---

## 🎨 UI Components

### Carousel Promozionale
```tsx
{establishmentsWithPromos.length > 0 && (
  <View style={styles.carouselContainer}>
    <View style={styles.carouselHeader}>
      <View style={styles.carouselTitleRow}>
        <Text style={styles.carouselTitle}>🎉 Promo Attive</Text>
        <Text style={styles.carouselSubtitle}>📍 Vicino a te</Text>
      </View>
      <View style={styles.promoBadge}>
        <Text style={styles.promoBadgeText}>
          {establishmentsWithPromos.length}
        </Text>
      </View>
    </View>
    <ScrollView horizontal snapToInterval={240}>
      {/* Cards promo con icona vicinanza */}
    </ScrollView>
  </View>
)}
```

### Card Bar con Badge Status
```tsx
<Card style={hasPromo ? styles.barCard : {...styles.barCard, ...styles.barCardDisabled}}>
  <View style={styles.barInfo}>
    <MapPin color={hasPromo ? Colors.orange : Colors.text.secondary} />
    <View style={styles.barDetails}>
      <View style={styles.barHeader}>
        <Text style={hasPromo ? styles.barName : {...styles.barName, ...styles.barNameDisabled}}>
          {est.name}
        </Text>
        {hasPromo && (
          <View style={styles.activePromoBadge}>
            <Text style={styles.activePromoText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.barAddress}>{est.address}</Text>
      {locationBadge && <Text style={styles.locationBadge}>{locationBadge}</Text>}
      {!hasPromo && (
        <Text style={styles.noPromoWarning}>⚠️ Promo non disponibile</Text>
      )}
    </View>
  </View>
</Card>
```

---

## 🌍 Traduzioni

### Italiano (`constants/translations.ts`)
```typescript
location: {
  nearYou: 'Vicino a te',
  sameCity: 'Stessa città',
  sameProvince: 'Stessa provincia',
  sameRegion: 'Stessa regione',
},
errors: {
  noActivePromo: 'Nessuna promo attiva',
  noActivePromoShort: 'Promo non disponibile',
  merchantMustHavePromo: 'Questo bar non ha promo attive al momento. I bar devono avere una promo attiva per poter distribuire ticket.',
},
```

### Inglese
```typescript
location: {
  nearYou: 'Near you',
  sameCity: 'Same city',
  sameProvince: 'Same province',
  sameRegion: 'Same region',
},
errors: {
  noActivePromo: 'No active promo',
  noActivePromoShort: 'Promo unavailable',
  merchantMustHavePromo: 'This bar doesn\'t have active promos at the moment. Bars must have an active promo to distribute tickets.',
},
```

---

## 📡 API Requirements

### Backend Endpoint Updates Needed

#### 1. **GET `/api/establishments`**
Response deve includere:
```json
{
  "id": "est-123",
  "name": "Bar Centrale",
  "address": "Via Roma 1",
  "city": "Milano",          // NUOVO
  "province": "MI",          // NUOVO
  "region": "Lombardia",     // NUOVO
  "latitude": 45.4642,       // NUOVO (opzionale)
  "longitude": 9.1900        // NUOVO (opzionale)
}
```

#### 2. **GET `/api/promos/active/:establishmentId`**
Response deve includere:
```json
{
  "id": "promo-456",
  "establishmentId": "est-123",
  "ticketsRequired": 5,
  "rewardValue": 10,
  "description": "Promo natalizia!",
  "startDate": "2025-12-01T00:00:00Z",  // NUOVO
  "endDate": "2025-12-31T23:59:59Z",    // NUOVO
  "isActive": true
}
```

#### 3. **GET `/api/auth/me`** (User profile)
Response deve includere:
```json
{
  "id": "user-789",
  "username": "mario_rossi",
  "email": "mario@example.com",
  "city": "Milano",          // NUOVO
  "province": "MI",          // NUOVO
  "region": "Lombardia"      // NUOVO
}
```

#### 4. **POST `/api/user/progress` (Validazione Drink)**
**DEVE verificare promo attiva BACKEND-SIDE**:
```typescript
// Pseudocode backend validation
if (!promo || !promo.isActive) {
  throw new Error('Merchant must have active promo');
}

const now = new Date();
const start = new Date(promo.startDate);
const end = new Date(promo.endDate);

if (now < start || now > end) {
  throw new Error('Promo not in valid date range');
}

// Procedi con validazione drink
```

---

## 🔐 Security Notes

### ⚠️ IMPORTANTE: Validazione Backend

**NON fare affidamento SOLO sulla validazione frontend!**

Il backend DEVE:
1. ✅ Verificare `promo.isActive === true`
2. ✅ Verificare `startDate <= now <= endDate`
3. ✅ Bloccare validazione drink se promo non valida
4. ✅ Bloccare distribuzione ticket se promo scaduta

**Motivo**: Un utente malevolo potrebbe:
- Modificare il client per bypassare i controlli frontend
- Inviare richieste API dirette senza passare dall'UI
- Manipolare le date locali del dispositivo

---

## 🚀 Testing Checklist

### Test Funzionali

- [ ] **Carousel mostra solo bar con promo valida**
  - Crea 3 bar: 1 con promo attiva, 1 con promo scaduta, 1 senza promo
  - Verifica che carousel mostri SOLO il primo bar

- [ ] **Ordinamento per vicinanza funziona**
  - User con `city: "Milano"`
  - Bar A: `city: "Milano"` (score 1)
  - Bar B: `province: "MI"` (score 2)
  - Bar C: `region: "Lombardia"` (score 3)
  - Verifica ordine: A → B → C

- [ ] **Click su bar senza promo mostra alert**
  - Click su bar con `hasPromo: false`
  - Verifica Alert con messaggio `merchantMustHavePromo`
  - Verifica che NON apra pagina `/user`

- [ ] **Badge vicinanza corretto**
  - User stessa città bar → "📍 Stessa città"
  - User stessa provincia → "🗺️ Stessa provincia"
  - User stessa regione → "🌍 Stessa regione"

- [ ] **Validazione date promo**
  - Promo con `endDate` nel passato → NON mostrata
  - Promo con `startDate` nel futuro → NON mostrata
  - Promo con date valide → Mostrata

### Test Backend
- [ ] POST validazione drink senza promo attiva → **403 Forbidden**
- [ ] POST validazione drink con promo scaduta → **403 Forbidden**
- [ ] POST validazione drink con promo valida → **200 OK**

---

## 📊 Metrics da Monitorare

1. **Conversione Carousel**
   - Click su card promo / Visualizzazioni carousel
   - Target: > 30%

2. **Distribuzione Geografica**
   - % bar mostrati per score vicinanza (1/2/3/4)
   - Identificare aree con pochi bar

3. **Promo Validity Rate**
   - % bar con promo attiva vs totale bar
   - Alert se < 50% (molti merchant senza promo)

4. **Rejection Rate**
   - Tentativi selezione bar senza promo
   - Educare merchant a mantenere promo attive

---

## 🔮 Future Enhancements

### Fase 2: Geolocalizzazione GPS
- Usare `latitude` e `longitude` per calcolo distanza preciso
- Algoritmo haversine per distanza in km
- Filtro "Mostra solo bar entro X km"

### Fase 3: Push Notifications
- Notifica quando nuovo bar con promo apre vicino
- "📍 Nuovo bar Stappa a 500m da te!"

### Fase 4: Mappa Interattiva
- Visualizzazione mappa con pin bar
- Click pin → dettagli promo
- Routing verso bar selezionato

---

## 📝 Changelog

### v1.0.0 (2025-11-11)
- ✅ Implementato sistema geolocalizzazione base (città/provincia/regione)
- ✅ Validazione promo con startDate/endDate
- ✅ Carousel filtrato per bar vicini con promo
- ✅ Blocco selezione bar senza promo attiva
- ✅ UI badges vicinanza e status promo
- ✅ Traduzioni IT/EN complete
- ✅ Types aggiornati con campi geolocalizzazione

---

## 📞 Support

Per domande o problemi sul sistema promo:
- **Backend Issues**: Verificare validazione API endpoints
- **Frontend Issues**: Controllare logs console React Native
- **Data Issues**: Verificare che DB abbia campi `city`, `province`, `region`, `startDate`, `endDate` popolati
