# Establishment Creation - Multi-Merchant Selection

## Overview
Sistema migliorato per la creazione di establishments che permette di **selezionare più merchants contemporaneamente** e **identificare obbligatoriamente il SENIOR_MERCHANT**. 

**Regola fondamentale**: Ogni establishment **DEVE** avere almeno 1 SENIOR_MERCHANT.

---

## Modifiche Implementate

### 1. Stati Aggiunti (admin.tsx)

```typescript
const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]); // Multi-select
const [seniorMerchantId, setSeniorMerchantId] = useState(''); // ID del SENIOR
```

- **`selectedUserIds`**: Array di IDs degli utenti selezionati come merchants (max 5)
- **`seniorMerchantId`**: ID dell'utente che sarà il SENIOR_MERCHANT

### 2. Funzione `handleCreateEstablishment` - Validazioni

```typescript
const handleCreateEstablishment = async () => {
  // Validazione 1: Campi richiesti + almeno 1 merchant + senior identificato
  if (!token || !estName || !estAddress || selectedUserIds.length === 0 || !seniorMerchantId) {
    setErrorModal({ 
      visible: true, 
      message: 'Devi selezionare almeno 1 merchant e identificare il SENIOR' 
    });
    return;
  }

  // Validazione 2: SENIOR deve essere tra i selezionati
  if (!selectedUserIds.includes(seniorMerchantId)) {
    setErrorModal({ 
      visible: true, 
      message: 'Il SENIOR MERCHANT deve essere tra i merchant selezionati' 
    });
    return;
  }

  // Validazione 3: Massimo 5 merchants
  if (selectedUserIds.length > 5) {
    setErrorModal({ 
      visible: true, 
      message: 'Massimo 5 merchants per establishment' 
    });
    return;
  }

  // Validazione 4: Nessun utente già assegnato ad altro establishment
  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
  const alreadyAssigned = selectedUsers.filter(u => u.establishmentId);
  if (alreadyAssigned.length > 0) {
    setErrorModal({ 
      visible: true, 
      message: `Utenti già assegnati: ${alreadyAssigned.map(u => u.username).join(', ')}` 
    });
    return;
  }

  // Creazione establishment con SENIOR come primo merchant
  await api.establishments.create(estName, estAddress, token, seniorMerchantId);
  
  // Assegnazione altri merchants
  const otherMerchantIds = selectedUserIds.filter(id => id !== seniorMerchantId);
  for (const userId of otherMerchantIds) {
    await api.establishments.assignMerchant(newEst.id, userId, token);
  }
};
```

**Validazioni implementate:**
1. ✅ Nome, indirizzo, almeno 1 merchant, SENIOR identificato
2. ✅ SENIOR deve essere incluso nei merchants selezionati
3. ✅ Massimo 5 merchants totali per establishment
4. ✅ Nessun utente può essere già assegnato ad altro establishment

### 3. UI Modal - Selezione Multipla

```jsx
<Text style={styles.sectionTitle}>
  Seleziona Merchants (max 5) - Tap su ⭐ per identificare il SENIOR
</Text>

<View style={styles.userSelectList}>
  {availableUsersForAssignment.slice(0, 10).map((u) => {
    const isSelected = selectedUserIds.includes(u.id);
    const isSenior = seniorMerchantId === u.id;
    
    return (
      <View key={u.id} style={styles.merchantSelectRow}>
        {/* Merchant card selezionabile */}
        <TouchableOpacity
          style={[
            styles.userSelectItem,
            isSelected && styles.userSelectItemActive,
            { flex: 1 }
          ]}
          onPress={() => {
            if (isSelected) {
              // Deseleziona
              setSelectedUserIds(prev => prev.filter(id => id !== u.id));
              if (isSenior) {
                setSeniorMerchantId(''); // Rimuovi senior se deselezionato
              }
            } else {
              // Seleziona (max 5)
              if (selectedUserIds.length < 5) {
                setSelectedUserIds(prev => [...prev, u.id]);
              }
            }
          }}
        >
          <Text style={[...]}>
            {u.username} {isSenior && '(SENIOR)'}
          </Text>
        </TouchableOpacity>
        
        {/* Star button per identificare SENIOR (visibile solo se selezionato) */}
        {isSelected && (
          <TouchableOpacity
            style={[
              styles.seniorToggleButton,
              isSenior && styles.seniorToggleButtonActive
            ]}
            onPress={() => {
              if (isSenior) {
                setSeniorMerchantId(''); // Rimuovi senior
              } else {
                setSeniorMerchantId(u.id); // Imposta come senior
              }
            }}
          >
            <Text style={styles.seniorToggleIcon}>⭐</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  })}
</View>

{/* Summary bar */}
<View style={styles.selectionSummary}>
  <Text style={styles.selectionSummaryText}>
    Selezionati: {selectedUserIds.length}/5 | 
    Senior: {seniorMerchantId ? users.find(u => u.id === seniorMerchantId)?.username : 'Nessuno'}
  </Text>
</View>

<Button
  title="Crea Establishment"
  onPress={handleCreateEstablishment}
  disabled={selectedUserIds.length === 0 || !seniorMerchantId}
/>
```

**Comportamento UI:**
- **Tap sul merchant**: Seleziona/Deseleziona (toggle)
- **Tap su stella ⭐**: Identifica come SENIOR (solo se merchant selezionato)
- **Background arancione**: Merchant selezionato
- **Stella gialla**: SENIOR identificato
- **Summary bar**: Mostra "Selezionati: 3/5 | Senior: mario_rossi"

### 4. Stili Aggiunti

```typescript
merchantSelectRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
},
seniorToggleButton: {
  width: 48,
  height: 48,
  borderRadius: 8,
  backgroundColor: Colors.background.card,
  borderWidth: 2,
  borderColor: Colors.border,
  alignItems: 'center',
  justifyContent: 'center',
},
seniorToggleButtonActive: {
  backgroundColor: Colors.yellow,
  borderColor: Colors.amber,
},
seniorToggleIcon: {
  fontSize: 24, // ⭐ emoji
},
selectionSummary: {
  padding: 12,
  backgroundColor: Colors.cream,
  borderRadius: 8,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: Colors.amber,
},
selectionSummaryText: {
  fontSize: 14,
  fontWeight: '600',
  color: Colors.text.primary,
  textAlign: 'center',
},
```

### 5. Reset Stati alla Chiusura Modal

```typescript
<BottomSheet
  visible={showEstablishmentModal}
  onClose={() => {
    setShowEstablishmentModal(false);
    setSelectedUserIds([]); // Reset selezione multipla
    setSeniorMerchantId(''); // Reset senior
    setEstName('');
    setEstAddress('');
  }}
  title="Crea Establishment"
>
```

---

## User Experience

### Scenario: Admin crea nuovo establishment

1. **Apre modal "Crea Establishment"**
   - Inserisce nome: "Bar Centrale"
   - Inserisce indirizzo: "Via Roma 123, Milano"

2. **Seleziona Merchants**:
   - Tap su "mario_rossi" → Selezionato (card diventa arancione)
   - Tap su "laura_bianchi" → Selezionata
   - Tap su "paolo_verdi" → Selezionato
   - **Summary bar**: "Selezionati: 3/5 | Senior: Nessuno"

3. **Identifica SENIOR**:
   - Tap su stella ⭐ accanto a "mario_rossi"
   - Stella diventa gialla, card mostra "(SENIOR)"
   - **Summary bar**: "Selezionati: 3/5 | Senior: mario_rossi"

4. **Click "Crea Establishment"**:
   - Validazioni passano ✅
   - Establishment creato con 3 merchants
   - mario_rossi assegnato come SENIOR_MERCHANT
   - laura_bianchi e paolo_verdi assegnati come MERCHANT base
   - Success: "Establishment creato! 3 merchant assegnati (1 SENIOR)"

### Scenario: Errori Validazione

**Errore 1**: Nessun merchant selezionato
```
❌ "Devi selezionare almeno 1 merchant e identificare il SENIOR"
```

**Errore 2**: Merchants selezionati ma senior non identificato
```
❌ "Devi selezionare almeno 1 merchant e identificare il SENIOR"
```

**Errore 3**: Tentativo di selezionare più di 5 merchants
```
⚠️ Button disabilitato, UI mostra "Selezionati: 5/5"
```

**Errore 4**: Tentativo di deselezionare merchant che è SENIOR
```
✅ Deseleziona merchant E rimuove automaticamente il flag SENIOR
```

**Errore 5**: Utente già assegnato ad altro establishment
```
❌ "Utenti già assegnati: mario_rossi, laura_bianchi"
```

---

## API Backend - Implementazione Necessaria

### Endpoint 1: Create Establishment (Modificato)

**Attuale:**
```typescript
POST /api/establishments
Body: { name, address }
```

**Nuovo:**
```typescript
POST /api/establishments
Body: { 
  name: string,
  address: string,
  seniorMerchantId: string  // ID dell'utente da assegnare come SENIOR
}
```

**Backend Logic:**
1. Crea establishment
2. Assegna `seniorMerchantId` come SENIOR_MERCHANT:
   - `UPDATE users SET role='SENIOR_MERCHANT', establishment_id=<new_id> WHERE id=<seniorMerchantId>`
3. Return establishment created

### Endpoint 2: Assign Merchant (Esistente)

```typescript
POST /api/establishments/:id/merchants
Body: { merchantId: string }
```

**Backend Logic:**
1. Verifica che establishment esista
2. Verifica che utente non sia già assegnato ad altro establishment
3. Verifica che team non abbia già 5 membri
4. Assegna merchant:
   - `UPDATE users SET role='MERCHANT', establishment_id=<id> WHERE id=<merchantId>`

### Database Migrations

Nessuna migration necessaria - lo schema attuale supporta già il sistema:
- `users.role`: 'USER' | 'MERCHANT' | 'SENIOR_MERCHANT' | 'ROOT'
- `users.establishment_id`: FK a establishments.id

---

## Frontend Flow Completo

```
Admin Dashboard
  ↓
Click "Crea Establishment"
  ↓
Modal aperto
  ↓
1. Inserisce nome + indirizzo
2. Cerca e seleziona merchants (tap per toggle)
3. Identifica SENIOR (tap su ⭐)
  ↓
Validazioni Frontend:
  ✅ Almeno 1 merchant selezionato
  ✅ SENIOR identificato
  ✅ SENIOR incluso nei selezionati
  ✅ Max 5 merchants
  ✅ Nessun merchant già assegnato
  ↓
handleCreateEstablishment():
  1. api.establishments.create(name, address, token, seniorMerchantId)
  2. Ottieni ID del nuovo establishment
  3. Per ogni other merchant:
     - api.establishments.assignMerchant(estId, merchantId, token)
  ↓
Success Modal:
  "Establishment creato! X merchant assegnati (1 SENIOR)"
  ↓
loadData() refresh
  ↓
Modal chiuso, stati resettati
```

---

## Validazioni Riepilogate

| Validazione | Check | Messaggio Errore |
|---|---|---|
| Nome establishment | `estName !== ''` | "Fill all fields" |
| Indirizzo | `estAddress !== ''` | "Fill all fields" |
| Almeno 1 merchant | `selectedUserIds.length > 0` | "Devi selezionare almeno 1 merchant" |
| SENIOR identificato | `seniorMerchantId !== ''` | "Devi identificare il SENIOR" |
| SENIOR tra selezionati | `selectedUserIds.includes(seniorMerchantId)` | "Il SENIOR deve essere tra i selezionati" |
| Max 5 merchants | `selectedUserIds.length <= 5` | "Massimo 5 merchants per establishment" |
| Merchants disponibili | `!selectedUser.establishmentId` | "Utenti già assegnati: ..." |

---

## Differenze con Sistema Precedente

### Prima (Single Selection):
- ❌ Si poteva assegnare **solo 1 merchant** alla creazione
- ❌ Non si identificava esplicitamente il SENIOR
- ❌ Altri merchants dovevano essere aggiunti successivamente
- ❌ Risk: establishment creato senza SENIOR

### Ora (Multi Selection):
- ✅ Si possono selezionare **fino a 5 merchants** alla creazione
- ✅ **Obbligatorio** identificare il SENIOR con stella ⭐
- ✅ Tutti i merchants vengono assegnati in una sola operazione
- ✅ Garantito: ogni establishment ha sempre 1 SENIOR_MERCHANT
- ✅ UX più chiara con summary bar "Selezionati: X/5 | Senior: nome"

---

## Testing Checklist

### Unit Tests
- [ ] `handleCreateEstablishment` con 0 merchants selezionati → Error
- [ ] `handleCreateEstablishment` con merchants ma no senior → Error
- [ ] `handleCreateEstablishment` con senior non tra selezionati → Error
- [ ] `handleCreateEstablishment` con 6 merchants → Error
- [ ] `handleCreateEstablishment` con merchant già assegnato → Error
- [ ] `handleCreateEstablishment` con 3 merchants + senior → Success

### UI Tests
- [ ] Tap su merchant non selezionato → Aggiunto a selectedUserIds
- [ ] Tap su merchant selezionato → Rimosso da selectedUserIds
- [ ] Tap su ⭐ quando merchant selezionato → seniorMerchantId impostato
- [ ] Tap su ⭐ quando merchant è già senior → seniorMerchantId resettato
- [ ] Deseleziona merchant che è senior → Rimuove anche senior flag
- [ ] Tentativo selezione 6° merchant → UI blocca (disabled o alert)
- [ ] Summary bar aggiornata in tempo reale
- [ ] Button "Crea" disabled quando no senior identificato

### Integration Tests
- [ ] Crea establishment con 1 SENIOR → Database: 1 SENIOR_MERCHANT
- [ ] Crea establishment con 1 SENIOR + 4 MERCHANT → Database: 5 utenti assegnati
- [ ] Verifica role SENIOR_MERCHANT assegnato correttamente
- [ ] Verifica role MERCHANT assegnato agli altri
- [ ] Verifica establishment_id uguale per tutti
- [ ] Refresh dashboard mostra establishment con team completo

---

## Backend Implementation Notes

### Pseudo-code Backend

```typescript
// POST /api/establishments
async createEstablishment(req, res) {
  const { name, address, seniorMerchantId } = req.body;
  
  // Validazioni
  if (!name || !address || !seniorMerchantId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Verifica che senior candidate esista e sia disponibile
  const seniorUser = await User.findById(seniorMerchantId);
  if (!seniorUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (seniorUser.establishmentId) {
    return res.status(400).json({ error: 'User already assigned to establishment' });
  }
  
  // Crea establishment
  const establishment = await Establishment.create({ name, address });
  
  // Assegna SENIOR
  await User.update(seniorMerchantId, {
    role: 'SENIOR_MERCHANT',
    establishmentId: establishment.id,
  });
  
  return res.status(201).json(establishment);
}

// POST /api/establishments/:id/merchants
async assignMerchant(req, res) {
  const { id } = req.params;
  const { merchantId } = req.body;
  
  const establishment = await Establishment.findById(id);
  if (!establishment) {
    return res.status(404).json({ error: 'Establishment not found' });
  }
  
  const user = await User.findById(merchantId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.establishmentId) {
    return res.status(400).json({ error: 'User already assigned' });
  }
  
  // Conta merchants esistenti
  const teamCount = await User.count({ establishmentId: id });
  if (teamCount >= 5) {
    return res.status(400).json({ error: 'Team is full (max 5)' });
  }
  
  // Assegna come MERCHANT base
  await User.update(merchantId, {
    role: 'MERCHANT',
    establishmentId: id,
  });
  
  return res.status(200).json({ success: true });
}
```

---

## Security Considerations

1. **Validazione Token**: Solo ROOT admin può creare establishments
2. **Validazione SENIOR**: Verificare che seniorMerchantId sia un utente valido
3. **Prevenzione Duplicati**: Un utente non può essere merchant di 2 establishments
4. **Limit Team Size**: Max 5 merchants per establishment (frontend + backend)
5. **Atomicità**: Usare transazioni DB per assegnazioni multiple
6. **Rollback**: Se assegnazione di un merchant fallisce, rollback dell'intero processo

---

## Commit Message Suggerito

```
feat(admin): multi-merchant selection for establishment creation with mandatory SENIOR identification

- Added `selectedUserIds` and `seniorMerchantId` states for multi-selection
- Implemented multi-select UI with star button (⭐) to identify SENIOR
- Added validations: min 1 merchant, max 5, SENIOR required and included
- Added summary bar showing "Selected: X/5 | Senior: username"
- Auto-reset states when closing modal
- Added styles: merchantSelectRow, seniorToggleButton, selectionSummary
- BREAKING: Every establishment MUST have 1 SENIOR_MERCHANT at creation

Closes #XXX
```

---

## Conclusione

Il sistema di creazione establishments è ora più robusto e user-friendly:
- ✅ **Multi-selection**: Fino a 5 merchants selezionabili contemporaneamente
- ✅ **SENIOR obbligatorio**: Impossibile creare establishment senza SENIOR identificato
- ✅ **UX chiara**: Stella ⭐ per identificare SENIOR, summary bar sempre visibile
- ✅ **Validazioni complete**: 7 validazioni frontend + backend checks
- ✅ **No orphan establishments**: Garantito che ogni establishment ha sempre 1 SENIOR

**Next Steps:**
1. Implementare endpoint backend modificati
2. Aggiungere tests E2E
3. Deploy e test su staging
4. Monitorare creazione establishments in produzione
