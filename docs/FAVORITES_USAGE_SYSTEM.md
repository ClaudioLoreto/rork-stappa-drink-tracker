# Sistema Preferiti e Frequenza Utilizzo

## 📋 Overview

Il sistema implementa un **ordinamento intelligente** dei bar basato su:
1. **Preferiti** (⭐ cuoricino) - Sempre in cima
2. **Frequenza utilizzo** (🍺 volte visitate) - Bar usati più spesso
3. **Promo attive** (✓ badge verde) - Bar con offerte valide
4. **Vicinanza geografica** (📍🗺️🌍) - Dal più vicino al più lontano
5. **Ordine alfabetico** - A parità di priorità

---

## 🎯 Funzionalità Principali

### 1. **Sistema Preferiti con Cuoricino** ❤️
- Pulsante cuoricino accanto ad ogni bar
- Click → Toggle preferito (pieno/vuoto)
- Cuoricino pieno = rosso (#FF6B6B)
- Cuoricino vuoto = grigio (Colors.text.secondary)
- Badge stella ⭐ mostrato accanto al nome bar preferito

### 2. **Tracciamento Frequenza Utilizzo** 🍺
- Conta quante volte l'utente ha usato ogni bar
- Badge "🍺 X volte" sotto l'indirizzo
- Basato su storico validazioni drink

### 3. **Carousel Geolocalizzato** 🎡
- Mostra **TUTTI i bar con promo attiva**
- Ordinati **SOLO per vicinanza**: città → provincia → regione → altro
- Non influenzato da preferiti/frequenza (carousel geografico puro)

### 4. **Lista Bar Intelligente** 📊
Ordine di priorità:
```
1. ⭐ PREFERITI (sempre primi, indipendentemente da tutto)
2. 🍺 USATI FREQUENTEMENTE (più usati → meno usati)
3. ✓ CON PROMO ATTIVA (con promo → senza promo)
4. 📍 VICINI (città → provincia → regione → altro)
5. 🔤 ALFABETICO (A-Z se parità)
```

---

## 🗂️ Modifiche Implementate

### Types (`types/index.ts`)

#### User Interface
```typescript
export interface User {
  id: string;
  // ... altri campi
  favoriteEstablishments?: string[]; // NUOVO: Array di ID bar preferiti
  city?: string;
  province?: string;
  region?: string;
  // ...
}
```

### API (`services/api.ts`)

#### Nuove API Preferiti
```typescript
users: {
  // ... API esistenti

  // NUOVO: Toggle preferito (aggiungi/rimuovi)
  toggleFavorite: async (
    token: string, 
    userId: string, 
    establishmentId: string
  ): Promise<{ isFavorite: boolean; favorites: string[] }> => {
    // Aggiunge o rimuove bar dai preferiti
    // Ritorna stato attuale + lista aggiornata
  },

  // NUOVO: Ottieni lista preferiti
  getFavorites: async (
    token: string, 
    userId: string
  ): Promise<string[]> => {
    // Ritorna array di ID bar preferiti
  },
}
```

#### Fix Promo Type
```typescript
// Aggiunto startDate/endDate alla creazione promo
const newPromo: Promo = {
  id: `${mockPromos.length + 1}`,
  establishmentId,
  ...data,
  startDate: new Date().toISOString(),        // NUOVO
  endDate: endDate.toISOString(),             // NUOVO
  expiresAt: expiresAt.toISOString(),
  createdAt: new Date().toISOString(),
  isActive: true,
};
```

---

## 💻 Implementazione Frontend

### File: `app/select-bar.tsx`

#### 1. **State Management**
```typescript
const [favorites, setFavorites] = useState<string[]>([]);
const [usageFrequency, setUsageFrequency] = useState<Record<string, number>>({});
```

#### 2. **Load Preferiti**
```typescript
const loadFavorites = async () => {
  if (!token || !user) return;
  try {
    const favs = await api.users.getFavorites(token, user.id);
    setFavorites(favs);
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
};
```

#### 3. **Load Frequenza Utilizzo**
```typescript
const loadUsageFrequency = async () => {
  if (!token || !user) return;
  try {
    const validations = await api.validations.listUser(token, user.id);
    const frequency: Record<string, number> = {};
    validations.forEach((v: any) => {
      frequency[v.establishmentId] = (frequency[v.establishmentId] || 0) + 1;
    });
    setUsageFrequency(frequency);
  } catch (error) {
    console.error('Failed to load usage frequency:', error);
  }
};
```

#### 4. **Toggle Preferito**
```typescript
const toggleFavorite = async (establishmentId: string) => {
  if (!token || !user) return;
  try {
    const result = await api.users.toggleFavorite(token, user.id, establishmentId);
    setFavorites(result.favorites);
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    Alert.alert(t('common.error'), 'Impossibile aggiornare i preferiti');
  }
};
```

#### 5. **Ordinamento Intelligente Lista Bar**
```typescript
const sortedEstablishments = useMemo(() => {
  const filtered = establishments.filter((est) =>
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (est.city && est.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return filtered.sort((a, b) => {
    // 1. PRIORITÀ MASSIMA: Preferiti
    const aIsFav = favorites.includes(a.id) ? 1 : 0;
    const bIsFav = favorites.includes(b.id) ? 1 : 0;
    if (aIsFav !== bIsFav) {
      return bIsFav - aIsFav; // Preferiti sempre primi
    }

    // 2. SECONDA PRIORITÀ: Frequenza utilizzo
    const aUsage = usageFrequency[a.id] || 0;
    const bUsage = usageFrequency[b.id] || 0;
    if (aUsage !== bUsage) {
      return bUsage - aUsage; // Più usati prima
    }

    // 3. TERZA PRIORITÀ: Promo attiva
    const aHasPromo = promos[a.id] !== null ? 1 : 0;
    const bHasPromo = promos[b.id] !== null ? 1 : 0;
    if (aHasPromo !== bHasPromo) {
      return bHasPromo - aHasPromo;
    }
    
    // 4. QUARTA PRIORITÀ: Vicinanza
    const aProximity = getProximityScore(a);
    const bProximity = getProximityScore(b);
    if (aProximity !== bProximity) {
      return aProximity - bProximity;
    }
    
    // 5. INFINE: Alfabetico
    return a.name.localeCompare(b.name);
  });
}, [establishments, promos, searchQuery, user, favorites, usageFrequency]);
```

#### 6. **Carousel Ordinamento Geografico**
```typescript
const establishmentsWithPromos = useMemo(() => {
  const withPromos = establishments.filter((est) => {
    const promo = promos[est.id];
    return promo && isPromoValid(promo);
  });

  // Ordina SOLO per vicinanza (tutti i bar con promo)
  return withPromos.sort((a, b) => {
    const aProximity = getProximityScore(a);
    const bProximity = getProximityScore(b);
    
    if (aProximity !== bProximity) {
      return aProximity - bProximity; // Più vicini prima
    }
    
    return a.name.localeCompare(b.name);
  });
}, [establishments, promos, user]);
```

---

## 🎨 UI Components

### Card Bar con Cuoricino
```tsx
<View key={est.id} style={styles.barCardWrapper}>
  {/* Card principale (click = seleziona bar) */}
  <TouchableOpacity
    onPress={() => handleSelectBar(est)}
    disabled={!hasPromo}
    style={{ flex: 1 }}
  >
    <Card style={hasPromo ? styles.barCard : {...styles.barCard, ...styles.barCardDisabled}}>
      <View style={styles.barInfo}>
        <MapPin size={24} color={hasPromo ? Colors.orange : Colors.text.secondary} />
        <View style={styles.barDetails}>
          {/* Header con stella preferito */}
          <View style={styles.barHeader}>
            <View style={styles.barTitleRow}>
              {isFavorite && <Text style={styles.favoriteBadge}>⭐</Text>}
              <Text style={styles.barName}>{est.name}</Text>
              {hasPromo && (
                <View style={styles.activePromoBadge}>
                  <Text style={styles.activePromoText}>✓</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Indirizzo */}
          <Text style={styles.barAddress}>{est.address}</Text>
          
          {/* Badges: vicinanza + frequenza */}
          <View style={styles.badgeRow}>
            {locationBadge && (
              <Text style={styles.locationBadge}>{locationBadge}</Text>
            )}
            {usageCount > 0 && (
              <Text style={styles.usageBadge}>
                🍺 {usageCount} {usageCount === 1 ? 'volta' : 'volte'}
              </Text>
            )}
          </View>
          
          {/* Warning se no promo */}
          {!hasPromo && (
            <Text style={styles.noPromoWarning}>
              ⚠️ {t('errors.noActivePromoShort')}
            </Text>
          )}
        </View>
      </View>
    </Card>
  </TouchableOpacity>
  
  {/* Pulsante cuoricino (click = toggle preferito) */}
  <TouchableOpacity
    onPress={(e) => {
      e.stopPropagation();
      toggleFavorite(est.id);
    }}
    style={styles.favoriteButton}
    activeOpacity={0.7}
  >
    <Heart
      size={22}
      color={isFavorite ? '#FF6B6B' : Colors.text.secondary}
      fill={isFavorite ? '#FF6B6B' : 'none'}
    />
  </TouchableOpacity>
</View>
```

### Styles
```typescript
barCardWrapper: {
  flexDirection: 'row',        // Card + Cuoricino side-by-side
  alignItems: 'center',
  marginBottom: 12,
},
barCard: {
  flex: 1,                     // Card occupa tutto lo spazio disponibile
  marginBottom: 0,
},
barTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
favoriteBadge: {
  fontSize: 16,
  marginRight: 6,              // Stella ⭐ prima del nome
},
badgeRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 4,
},
locationBadge: {
  fontSize: 11,
  color: Colors.orange,
  fontWeight: '600',
},
usageBadge: {
  fontSize: 11,
  color: Colors.text.secondary,
  fontWeight: '500',
},
favoriteButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 8,               // Spazio tra card e cuoricino
  borderWidth: 1,
  borderColor: Colors.border,
},
```

---

## 🔄 User Flow

### Aggiungere Bar ai Preferiti
1. User apre `select-bar.tsx`
2. Vede lista bar ordinata per priorità
3. Click cuoricino ❤️ accanto a bar preferito
4. `toggleFavorite()` chiamata API
5. State `favorites` aggiornato
6. Lista si riordina automaticamente (useMemo)
7. Bar preferito salta in cima con stella ⭐

### Rimuovere dai Preferiti
1. Click cuoricino pieno ❤️ (rosso)
2. API rimuove da `favoriteEstablishments[]`
3. State aggiornato
4. Bar scende in lista secondo altre priorità
5. Stella ⭐ rimossa

---

## 📊 Esempio Ordinamento

### User Profile
```json
{
  "id": "user-123",
  "city": "Milano",
  "province": "MI",
  "region": "Lombardia",
  "favoriteEstablishments": ["bar-3"]
}
```

### Bar Database
```json
[
  { "id": "bar-1", "name": "Bar Alpha", "city": "Milano", "hasPromo": true },
  { "id": "bar-2", "name": "Bar Beta", "city": "Roma", "hasPromo": true },
  { "id": "bar-3", "name": "Bar Gamma", "city": "Torino", "hasPromo": false },
  { "id": "bar-4", "name": "Bar Delta", "city": "Milano", "hasPromo": true }
]
```

### Usage Frequency
```json
{
  "bar-1": 5,  // Usato 5 volte
  "bar-4": 10  // Usato 10 volte
}
```

### Risultato Lista Ordinata
```
1. ⭐ Bar Gamma (Torino) - PREFERITO (anche senza promo, sempre primo!)
2. 🍺 Bar Delta (Milano) ✓ - 10 volte, promo, stessa città
3. 🍺 Bar Alpha (Milano) ✓ - 5 volte, promo, stessa città
4. Bar Beta (Roma) ✓ - Promo attiva ma lontano
```

### Risultato Carousel
```
1. 📍 Bar Delta (Milano) - Stessa città
2. 📍 Bar Alpha (Milano) - Stessa città
3. 🌍 Bar Beta (Roma) - Altra regione
```
_Nota: Bar Gamma non appare (nessuna promo attiva)_

---

## 📡 API Backend Requirements

### Database Schema
```sql
-- Aggiungi colonna preferiti (array JSON o tabella pivot)
ALTER TABLE users ADD COLUMN favorite_establishments TEXT[];

-- Oppure tabella pivot
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  establishment_id INTEGER REFERENCES establishments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, establishment_id)
);
```

### API Endpoints

#### GET `/api/users/:userId/favorites`
Response:
```json
{
  "favorites": ["est-1", "est-3", "est-7"]
}
```

#### POST `/api/users/:userId/favorites/:establishmentId`
Action: Aggiungi ai preferiti
Response:
```json
{
  "isFavorite": true,
  "favorites": ["est-1", "est-3", "est-7", "est-9"]
}
```

#### DELETE `/api/users/:userId/favorites/:establishmentId`
Action: Rimuovi dai preferiti
Response:
```json
{
  "isFavorite": false,
  "favorites": ["est-1", "est-3", "est-7"]
}
```

#### GET `/api/validations/user/:userId`
Response (per calcolo frequenza):
```json
[
  {
    "id": "val-1",
    "userId": "user-123",
    "establishmentId": "est-1",
    "timestamp": "2025-11-01T10:00:00Z"
  },
  {
    "id": "val-2",
    "userId": "user-123",
    "establishmentId": "est-1",
    "timestamp": "2025-11-02T11:00:00Z"
  }
]
```

---

## 🧪 Testing Checklist

### Test Preferiti
- [ ] Click cuoricino vuoto → diventa pieno rosso
- [ ] Click cuoricino pieno → diventa vuoto grigio
- [ ] Bar aggiunto a preferiti → stella ⭐ appare
- [ ] Bar preferito → sempre primo in lista
- [ ] Rimozione preferito → bar scende secondo priorità
- [ ] Preferiti persistono dopo reload app

### Test Frequenza
- [ ] User con 10 validazioni bar A, 5 bar B → A prima di B
- [ ] Badge "🍺 X volte" mostrato correttamente
- [ ] Frequenza aggiornata dopo nuova validazione

### Test Ordinamento Lista
- [ ] Preferito + 0 utilizzi → prima di non-preferito con 100 utilizzi
- [ ] 10 utilizzi + no promo → prima di 5 utilizzi con promo? NO! Con promo priorità su utilizzi
- [ ] Stessa città + no promo → prima di altra regione con promo? NO! Promo > vicinanza
- [ ] **Ordine corretto**: Preferiti > Utilizzi > Promo > Vicinanza > Alfabetico

### Test Carousel
- [ ] Mostra TUTTI bar con promo valida
- [ ] Non mostra bar senza promo (anche se preferiti)
- [ ] Ordinamento SOLO geografico (più vicini prima)
- [ ] Preferiti NON influenzano ordine carousel

---

## 🔮 Future Enhancements

### Fase 2: Categorie Preferiti
- Preferiti "Casa" (vicino casa)
- Preferiti "Lavoro" (vicino ufficio)
- Preferiti "Weekend" (bar del sabato sera)

### Fase 3: Suggerimenti Intelligenti
- "Non visiti Bar X da 30 giorni, nuova promo attiva!"
- "Bar Y (tuo preferito) ha lanciato promo speciale"

### Fase 4: Social Sharing
- Condividi lista preferiti con amici
- "Mario ha aggiunto 5 bar ai preferiti questa settimana"

### Fase 5: Analytics Merchant
- Dashboard merchant: "Sei tra i preferiti di 150 utenti"
- "10 nuovi utenti ti hanno aggiunto ai preferiti oggi"

---

## 📝 Changelog

### v1.0.0 (2025-11-11)
- ✅ Sistema preferiti con cuoricino ❤️
- ✅ Tracciamento frequenza utilizzo 🍺
- ✅ Ordinamento intelligente lista: Preferiti → Utilizzi → Promo → Vicinanza → Alfabetico
- ✅ Carousel geolocalizzato: TUTTI bar con promo, ordinati per vicinanza
- ✅ API `toggleFavorite` e `getFavorites`
- ✅ UI stella ⭐ per bar preferiti
- ✅ Badge "🍺 X volte" per frequenza
- ✅ Fix Promo type con startDate/endDate

---

## 📞 Support

Per domande:
- **Preferiti non salvati**: Verificare API backend `/users/:id/favorites`
- **Ordinamento sbagliato**: Controllare console logs per debug sort()
- **Cuoricino non funziona**: Verificare `e.stopPropagation()` nel TouchableOpacity
