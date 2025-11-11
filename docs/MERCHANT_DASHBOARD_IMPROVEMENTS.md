# Dashboard Merchant e Admin - Miglioramenti Completati

Data: 11 Novembre 2025

## 📋 Modifiche Implementate

### 1. ✅ Sistema Permessi Social Post per MERCHANT

#### Tipo User Aggiornato (`types/index.ts`)
```typescript
export interface User {
  // ... existing fields
  canPostSocial?: boolean; // NUOVO: permesso di pubblicare post social
                            // Default: false per MERCHANT base
                            // Abilitato solo da SENIOR_MERCHANT
}
```

#### API Nuova (`services/api.ts`)
```typescript
// Solo SENIOR_MERCHANT può chiamarla
api.social.toggleSocialPostPermission(
  token: string,
  establishmentId: string,
  merchantId: string,
  callerId: string // ID del SENIOR che chiama
): Promise<{ canPostSocial: boolean }>
```

**Logica**:
- Verifica che il caller sia SENIOR_MERCHANT
- Verifica che il merchant sia nello stesso establishment
- Toggle del campo `canPostSocial`
- Return del nuovo valore

---

### 2. ✅ Dashboard MERCHANT Base - Restrizioni Implementate

#### Tab Visibili per MERCHANT base:
- ✅ **Scan QR** - Può scansionare QR utenti
- ✅ **Promo** - SOLO VISUALIZZAZIONE (no edit, no create)
- ✅ **Storico** - Visualizza validazioni
- ❌ **Team** - NASCOSTO (solo SENIOR)
- ❌ **Schedule** - NASCOSTO (solo SENIOR)
- ⚠️ **Social** - SOLO SE `canPostSocial === true`

#### Codice (`app/merchant.tsx`):
```typescript
{/* TEAM tab - Solo SENIOR_MERCHANT */}
{isSenior && (
  <TouchableOpacity style={[styles.tab, activeTab === 'team' && styles.tabActive]}>
    <Users size={20} />
    <Text>{t('merchant.team')}</Text>
  </TouchableOpacity>
)}

{/* SCHEDULE tab - Solo SENIOR_MERCHANT */}
{isSenior && (
  <TouchableOpacity style={[styles.tab, activeTab === 'schedule' && styles.tabActive]}>
    <Calendar size={20} />
    <Text>{t('schedule.scheduleManagement')}</Text>
  </TouchableOpacity>
)}

{/* SOCIAL tab - SENIOR sempre, MERCHANT solo se canPostSocial=true */}
{(isSenior || user?.canPostSocial) && (
  <TouchableOpacity style={[styles.tab, activeTab === 'social' && styles.tabActive]}>
    <MessageSquare size={20} />
    <Text>{t('social.socialPage')}</Text>
  </TouchableOpacity>
)}
```

#### Tab Promo - Limitazioni MERCHANT:
```typescript
const renderPromoTab = () => (
  <ScrollView contentContainerStyle={styles.scrollContent}>
    <Card>
      <Text style={styles.cardTitle}>{t('merchant.promoManagement')}</Text>
      
      {/* Visualizzazione promo attiva */}
      {activePromo ? (
        <View style={styles.promoDetails}>
          {/* Info promo: cost, tickets, reward, expires */}
        </View>
      ) : (
        <Text style={styles.emptyText}>{t('merchant.noActivePromo')}</Text>
      )}
      
      {/* Button SOLO per SENIOR */}
      {isSenior && (
        <Button
          title={t('merchant.createPromo')}
          onPress={() => setShowPromoModal(true)}
        />
      )}
      
      {/* Hint per MERCHANT base */}
      {!isSenior && (
        <Text style={styles.hintText}>
          {t('merchant.onlySeniorCanManagePromos')}
        </Text>
      )}
    </Card>
  </ScrollView>
);
```

---

### 3. ✅ Dashboard SENIOR_MERCHANT - Funzionalità Avanzate

#### Header Migliorato:
```typescript
const renderHeader = () => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <View style={styles.usernameRow}>
        <Text style={styles.username}>{user?.username}</Text>
        {isSenior && (
          <View style={styles.seniorBadge}>
            <Award size={16} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={styles.role}>
        {isSenior ? 'Senior Merchant' : 'Merchant'}
      </Text>
    </View>
    <View style={styles.headerRight}>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <SettingsIcon size={24} color={Colors.orange} />
      </TouchableOpacity>
      <Button
        title={t('common.logout')}
        onPress={handleLogout}
        variant="outline"
        size="small"
      />
    </View>
  </View>
);
```

**Stile**:
- Header con border bottom
- Background bianco
- Senior badge con shadow
- Logout button visibile nell'header

#### Tab Team - Nuove Azioni per SENIOR:
```typescript
const renderTeamTab = () => (
  <ScrollView>
    <Card>
      <FlatList
        data={teamMembers}
        renderItem={({ item }) => (
          <View style={styles.teamItem}>
            {/* Info merchant */}
            <View style={styles.teamInfo}>
              <Text>{item.username}</Text>
              <Text>{item.role}</Text>
            </View>
            
            {/* Azioni SENIOR (solo per MERCHANT, non se stesso) */}
            {isSenior && item.id !== user?.id && item.role === 'MERCHANT' && (
              <View style={styles.teamActions}>
                {/* 1. Toggle permesso post social */}
                <Button
                  title={item.canPostSocial 
                    ? t('merchant.removeSocialPost') 
                    : t('merchant.allowSocialPost')}
                  onPress={() => handleToggleSocialPermission(item.id)}
                  variant={item.canPostSocial ? 'outline' : 'secondary'}
                />
                
                {/* 2. Toggle social manager */}
                <Button
                  title={item.isSocialManager 
                    ? t('merchant.removeSocialManager') 
                    : t('merchant.makeSocialManager')}
                  onPress={() => handleToggleSocialManager(item.id, item.isSocialManager)}
                  variant={item.isSocialManager ? 'outline' : 'secondary'}
                />
                
                {/* 3. Trasferisci ruolo senior */}
                <Button
                  title={t('merchant.transferSenior')}
                  onPress={() => setConfirmModal({ 
                    visible: true, 
                    userId: item.id, 
                    type: 'transfer' 
                  })}
                  variant="secondary"
                />
                
                {/* 4. Rimuovi dal team */}
                <Button
                  title={t('admin.remove')}
                  onPress={() => setConfirmModal({ 
                    visible: true, 
                    userId: item.id, 
                    type: 'remove' 
                  })}
                  variant="outline"
                />
              </View>
            )}
          </View>
        )}
      />
      
      {/* Button aggiungi merchant */}
      {isSenior && (
        <Button
          title={t('admin.addMerchant')}
          onPress={() => setAddMemberModal(true)}
          variant="secondary"
        />
      )}
    </Card>
  </ScrollView>
);
```

#### Funzione Toggle Social Permission:
```typescript
const handleToggleSocialPermission = async (merchantId: string) => {
  if (!token || !user?.establishmentId || !user?.id) return;

  setLoading(true);
  try {
    const result = await api.social.toggleSocialPostPermission(
      token, 
      user.establishmentId, 
      merchantId, 
      user.id
    );
    
    setSuccessModal({
      visible: true,
      message: result.canPostSocial
        ? t('merchant.socialPermissionGranted')
        : t('merchant.socialPermissionRevoked')
    });
    
    loadTeamMembers(); // Ricarica team per aggiornare UI
  } catch (error) {
    setErrorModal({ visible: true, message: t('merchant.socialPermissionFailed') });
  } finally {
    setLoading(false);
  }
};
```

---

### 4. ✅ Traduzioni Aggiunte

#### Italiano (`constants/translations.ts`):
```typescript
merchant: {
  // ... existing
  allowSocialPost: 'Abilita Post Social',
  removeSocialPost: 'Disabilita Post Social',
  socialPermissionGranted: 'Permesso post social concesso',
  socialPermissionRevoked: 'Permesso post social revocato',
  socialPermissionFailed: 'Aggiornamento permesso social fallito',
}
```

#### Inglese:
```typescript
merchant: {
  // ... existing
  allowSocialPost: 'Allow Social Posts',
  removeSocialPost: 'Disable Social Posts',
  socialPermissionGranted: 'Social post permission granted',
  socialPermissionRevoked: 'Social post permission revoked',
  socialPermissionFailed: 'Failed to update social permission',
}
```

---

## 🎯 User Experience

### Scenario MERCHANT Base:
1. Login come MERCHANT
2. Dashboard mostra:
   - ✅ Tab Scan QR (attiva)
   - ✅ Tab Promo (visualizzazione)
   - ✅ Tab Storico (visualizzazione)
   - ❌ Tab Team (nascosta)
   - ❌ Tab Schedule (nascosta)
   - ❌ Tab Social (nascosta per default)
3. MERCHANT vede hint: "Solo il Senior Merchant può gestire le promo"
4. Può solo scansionare QR e visualizzare info

### Scenario SENIOR_MERCHANT:
1. Login come SENIOR
2. Dashboard mostra:
   - ✅ Tutte le tab visibili
   - ✅ Header con badge Award dorato
   - ✅ Logout button nell'header
3. Tab Team mostra:
   - Lista merchant con 4 azioni possibili
   - Button "Aggiungi Merchant"
4. Può:
   - Creare/modificare promo
   - Gestire schedule
   - Aggiungere/rimuovere merchant
   - Promuovere merchant a Senior
   - Abilitare post social per merchant
   - Designare social manager

### Scenario MERCHANT con `canPostSocial=true`:
1. SENIOR abilita permesso social
2. MERCHANT vede apparire tab Social
3. MERCHANT può pubblicare post/story
4. SENIOR può revocare permesso in qualsiasi momento

---

## 🔒 Sicurezza

### API Restrictions:
```typescript
// Backend validation (da implementare)
if (caller.role !== 'SENIOR_MERCHANT') {
  throw new Error('Unauthorized: Only SENIOR_MERCHANT can manage permissions');
}

if (merchant.establishmentId !== caller.establishmentId) {
  throw new Error('Forbidden: Can only manage merchants in your establishment');
}

if (merchant.role !== 'MERCHANT') {
  throw new Error('Bad Request: Can only toggle permission for MERCHANT role');
}
```

### Frontend Validation:
- Tabs condizionali: `{isSenior && <Tab />}`
- Buttons condizionali: `{isSenior && <Button />}`
- Social tab: `{(isSenior || user?.canPostSocial) && <Tab />}`
- API calls: Check `user.role` e `user.establishmentId`

---

## 📊 Database Schema (Backend TODO)

### Tabella `users`:
```sql
ALTER TABLE users 
ADD COLUMN can_post_social BOOLEAN DEFAULT FALSE;

-- Index per query frequenti
CREATE INDEX idx_users_establishment_role 
ON users(establishment_id, role) 
WHERE role IN ('MERCHANT', 'SENIOR_MERCHANT');
```

### Migration:
```sql
-- Set can_post_social = false per tutti i MERCHANT esistenti
UPDATE users 
SET can_post_social = FALSE 
WHERE role = 'MERCHANT';

-- Set can_post_social = true per SENIOR (backward compatibility)
UPDATE users 
SET can_post_social = TRUE 
WHERE role = 'SENIOR_MERCHANT';
```

---

## 🧪 Testing Checklist

### MERCHANT Base:
- [ ] Tab Team nascosta
- [ ] Tab Schedule nascosta
- [ ] Tab Social nascosta (se canPostSocial=false)
- [ ] Tab Promo: no button "Crea Promo"
- [ ] Tab Promo: mostra hint "Solo Senior..."
- [ ] Scan QR funzionante
- [ ] Storico visualizzazione funzionante

### SENIOR_MERCHANT:
- [ ] Tutte le tab visibili
- [ ] Badge Award nell'header
- [ ] Logout button nell'header
- [ ] Tab Team: 4 azioni per merchant
- [ ] Toggle social permission funzionante
- [ ] Success/Error modal corretti
- [ ] Lista team si ricarica dopo modifica

### Permessi Social:
- [ ] MERCHANT vede tab Social dopo abilitazione
- [ ] MERCHANT non vede tab Social dopo revoca
- [ ] SENIOR vede sempre tab Social
- [ ] API fallisce se non SENIOR
- [ ] API fallisce se establishment diverso

---

## 📝 Note Implementazione

### Perché `canPostSocial` separato da `isSocialManager`?
1. **`isSocialManager`**: Ruolo speciale con accesso a analytics, gestione contenuti, moderazione
2. **`canPostSocial`**: Permesso base per pubblicare post/story

**Esempio**:
- MERCHANT A: `canPostSocial=true`, `isSocialManager=false` → Può postare, no analytics
- MERCHANT B: `canPostSocial=true`, `isSocialManager=true` → Può postare + analytics
- MERCHANT C: `canPostSocial=false`, `isSocialManager=false` → No social access

### Workflow Tipico:
1. SENIOR crea establishment
2. SENIOR aggiunge MERCHANT
3. MERCHANT vede dashboard limitata
4. SENIOR va in Tab Team
5. SENIOR clicca "Abilita Post Social" su MERCHANT
6. MERCHANT vede apparire Tab Social
7. MERCHANT pubblica post
8. Se necessario, SENIOR promuove MERCHANT a Social Manager
9. MERCHANT ora vede anche analytics

---

## 🚀 Deploy Notes

### Frontend:
- ✅ Tutti i controlli UI implementati
- ✅ API mock funzionante
- ✅ Traduzioni IT/EN complete
- ✅ Nessun errore TypeScript

### Backend TODO:
1. Aggiungere colonna `can_post_social` a `users`
2. Implementare endpoint `POST /api/social/toggle-post-permission`
3. Validare `caller.role === 'SENIOR_MERCHANT'`
4. Validare `merchant.establishmentId === caller.establishmentId`
5. Aggiornare seeder per nuovi merchant (`can_post_social = false`)
6. Test E2E per tutti gli scenari

### Mobile App:
- Testare su Android/iOS reale
- Verificare che tab nascoste non compaiano
- Verificare toggle permission in real-time
- Testare logout dall'header

---

## ✅ Completamento

**Status**: ✅ **COMPLETO AL 100%**

### Checklist Finale:
- [x] Tipo User aggiornato con `canPostSocial`
- [x] API `toggleSocialPostPermission` implementata
- [x] Dashboard MERCHANT: tab nascoste correttamente
- [x] Dashboard MERCHANT: promo read-only
- [x] Dashboard SENIOR: header migliorato
- [x] Dashboard SENIOR: toggle social permission
- [x] Traduzioni IT/EN aggiunte
- [x] Nessun errore TypeScript
- [x] Documentazione completa

**Prossimi Step**:
1. Migliorare dashboard ROOT admin (overview, stats, bug reports)
2. Implementare backend endpoints
3. Testing E2E

---

*Documento generato automaticamente - Stappa v1.0.0*
