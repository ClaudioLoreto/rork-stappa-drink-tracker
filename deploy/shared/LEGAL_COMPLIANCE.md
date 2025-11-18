# ⚖️ Legal Compliance Review - Stappa Drink Tracker

**Documento**: Legal Compliance Checklist  
**Data**: 18 Novembre 2025  
**Versione App**: 1.0.0  
**Status**: ⚠️ PRE-LAUNCH REVIEW REQUIRED

---

## ⚠️ DISCLAIMER

**QUESTO NON È CONSIGLIO LEGALE**. Questo documento è una checklist orientativa per identificare aree che potrebbero richiedere attenzione legale. Si raccomanda fortemente di consultare un avvocato specializzato in:
- Diritto della proprietà intellettuale
- Privacy e protezione dati (GDPR/CCPA)
- Diritto digitale e app mobile
- Regolamentazione settore alimentare/bevande

---

## 1. 📝 Proprietà Intellettuale

### Nome e Marchio "Stappa"

#### Status Attuale
- ⚠️ **Nome non verificato per conflitti trademark**
- ⚠️ **Marchio non registrato**

#### Azioni Richieste

**✅ IMMEDIATO (Prima del launch)**:
```
1. Ricerca trademark "Stappa" su database:
   - EUIPO (EU): https://euipo.europa.eu/eSearch/
   - USPTO (USA): https://www.uspto.gov/trademarks
   - UIBM (Italia): https://uibm.mise.gov.it/

2. Verifica se esistono:
   - Marchi identici o simili
   - Nella stessa classe merceologica (Class 9 - Software, Class 42 - SaaS)
   - Nel settore food & beverage (Class 32, 33)
   - Attivi in IT/EU/mercati target

3. Se CLEAR: procedere con cautela
4. Se CONFLICT: considerare cambio nome PRIMA del launch
```

**📋 CONSIGLIATO (Entro 3-6 mesi)**:
```
Registrare marchio "Stappa" nelle classi:
- Classe 9: Software per dispositivi mobile
- Classe 42: Servizi software (SaaS)
- Classe 43: Servizi di informazione ristorazione/bar (opzionale)

Costo stimato:
- Trademark EU: ~€1000-1500 (con avvocato)
- Trademark Italia: ~€500-800
- Trademark USA: $350-500 + legal fees
```

### Logo e Grafica

#### Status Attuale
- ⚠️ **Logo/icona app da verificare se originale**
- ✅ Nessun uso di loghi terze parti
- ✅ Icone lucide-react-native (MIT License)

#### Azioni
- [ ] Confermare che logo/icona è opera originale o correttamente licenziata
- [ ] Se usato designer esterno: ottenere cessione diritti
- [ ] Conservare documentazione cessione diritti

### Copyright

#### Status Attuale
```
Copyright © 2025 Rork / Claudio Loreto
```

#### Azioni
- ✅ Copyright claim inserito in app
- [ ] Considerare registrazione copyright (opzionale, protezione automatica in EU/USA)
- [ ] Verificare ownership di tutto il codice
  - Se collaboratori esterni: acquisire cessione diritti
  - Se code da tutorial/GitHub: verificare licenze

---

## 2. 🔐 Privacy e Protezione Dati

### GDPR (General Data Protection Regulation - EU)

#### Applicabilità
✅ **SI APPLICA** perché:
- App disponibile in Italia/EU
- Raccoglie dati personali di cittadini EU
- Stabilimento/targeting EU

#### Obblighi Principali

**✅ COMPLETATO**:
- [x] Privacy Policy esistente (`docs/PRIVACY_POLICY.md`)
- [x] Descrizione raccolta dati
- [x] Base giuridica per trattamento (consenso, legittimo interesse)
- [x] Diritti utente descritti (accesso, cancellazione, portabilità)

**⚠️ DA IMPLEMENTARE NEL CODICE**:
- [ ] **Cookie Consent Banner** (se web component)
  - Consenso esplicito prima di tracciamento
  - Opzione rifiuto facile quanto accettazione
  - Granularità (necessari vs marketing vs analytics)

- [ ] **Meccanismo "Right to be Forgotten"**
  - Endpoint API per cancellazione account
  - Rimozione tutti dati personali entro 30 giorni
  - Attualmente: ❌ NON IMPLEMENTATO

- [ ] **Data Portability**
  - Export dati utente in formato machine-readable (JSON/CSV)
  - Attualmente: ❌ NON IMPLEMENTATO

- [ ] **Consent Management**
  - Tracciare quando/cosa utente ha consentito
  - Possibilità revoca consenso
  - Attualmente: ⚠️ IMPLICITO al signup

**⚠️ DA VERIFICARE**:
- [ ] Data Retention Policy
  - Quanto tempo conservare dati inattivi?
  - Policy automatica cancellazione account dormienti?
  - Attualmente: ⚠️ NON DEFINITO

- [ ] Data Processing Agreement (se fornitori terzi)
  - Railway (hosting): verificare DPA
  - OpenAI (se usato): verificare contratto
  - Analytics provider (se aggiunto): DPA necessario

- [ ] **Data Breach Response Plan**
  - Notifica entro 72h in caso di breach
  - Procedura documentata?
  - Attualmente: ❌ NON DEFINITO

**✅ RECOMMENDED**:
```
Azioni entro 1-3 mesi:
1. Implementare account deletion endpoint
2. Implementare data export feature
3. Review e hardening sicurezza backend
4. Definire data retention policy
5. Considerare Data Protection Impact Assessment (DPIA)
```

### CCPA (California Consumer Privacy Act - USA)

#### Applicabilità
🤔 **POSSIBILE** se:
- App scaricata da residenti California
- Revenue > $25M/anno (non applicabile ora)
- O dati >50k CA residents (probabile non applicabile inizialmente)

#### Obblighi (se applicabile)
- [ ] "Do Not Sell My Personal Information" link
- [ ] Disclosure categorie dati raccolti
- [ ] Diritto opt-out vendita dati
- [ ] Non discriminazione per chi opt-out

**Status**: ⚠️ Monitorare se app raggiunge threshold applicabilità

### Altri Regolamenti

- **LGPD (Brasile)**: Se targeting Brasile
- **PIPEDA (Canada)**: Se targeting Canada
- **PDPA (Singapore)**: Se targeting Asia

**Azione**: Valutare mercati target e compliance necessaria

---

## 3. 🍺 Regolamentazione Alcool

### Contenuto Alcool-Relato

#### Situazione
- App traccia consumazioni bevande alcoliche
- Promozione/marketing di bar che servono alcool
- Social sharing di drink
- ⚠️ **SETTORE ALTAMENTE REGOLAMENTATO**

#### Rischi Legali

**✅ MITIGAZIONI ATTUALI**:
- Age rating 17+ (iOS) / Mature 17+ (Android)
- No vendita diretta alcool (solo tracking/info)
- No sponsorizzazione diretta brand alcool

**⚠️ AREE GRIGIE DA CHIARIRE**:

1. **Marketing Restrictions**
   - Alcuni paesi vietano marketing alcool verso minori
   - Sistema promo potrebbe essere considerato "advertising"
   - **Azione**: Legal review del sistema promo

2. **Health Claims**
   - Non fare claim salutistici su alcool
   - Non promuovere consumo eccessivo
   - **Status**: ✅ App non fa claim

3. **Responsible Drinking**
   - Considerare disclaimer su uso responsabile
   - Warning su gravidanza/guida
   - **Status**: ⚠️ Non presente, potrebbe essere utile

4. **Age Verification**
   - Store rating 17+ è sufficiente?
   - Serve ulteriore age gate nell'app?
   - **Status**: ⚠️ Solo store rating

**📋 AZIONI CONSIGLIATE**:
```
1. Aggiungere "Responsible Drinking" disclaimer:
   - All'onboarding
   - Nella sezione legal
   - Messaggi tipo "Bevi responsabilmente"

2. Considerare age gate in-app:
   - Richiesta data nascita al signup
   - Blocco <18 anni (o 21 in USA)

3. Warning labels:
   - "Non guidare dopo aver bevuto"
   - "Sconsigliato in gravidanza"
   - Link a risorse supporto alcool

4. Consultare avvocato specializzato in:
   - Advertising regulations per alcool
   - Compliance mercati target
```

### Jurisdictions Specifiche

#### Italia
- Divieto vendita minori <18 anni: ✅ OK (no vendita diretta)
- Marketing limitazioni: ⚠️ DA VERIFICARE
- Decreto "Balduzzi" anti-alcool: ⚠️ VERIFICARE APPLICABILITÀ

#### USA
- 21+ per consumo: ⚠️ Store rating 17+ potrebbe non bastare
- State-specific regulations: ⚠️ Variano per stato
- ATF regulations: ⚠️ Se considerato "advertising"

#### EU
- Audiovisual Media Services Directive: ⚠️ Possibili limitazioni marketing
- Country-specific: Ogni paese ha regole diverse

**Raccomandazione**: 🔴 **LEGAL REVIEW NECESSARIO PRIMA DI SCALING**

---

## 4. 📱 App Store Policies

### Apple App Store

#### Guideline Compliance

**Alcohol-Related (Guideline 1.4.3)**
- ✅ Age rating 17+ impostato
- ⚠️ Non deve facilitare consumo eccessivo
- ⚠️ Non deve normalizzare abuso alcool
- **Azione**: Review contenuti social per ensure compliance

**Privacy (Guideline 5.1)**
- ✅ Privacy Policy presente
- ⚠️ Privacy Policy deve essere su URL pubblico accessibile
- [ ] Privacy Nutrition Label da completare accuratamente
- **Status**: ⚠️ URL non ancora live

**User Generated Content (Guideline 1.2)**
- App ha social feed con UGC
- ✅ Sistema moderazione presente (`utils/moderation.ts`)
- [ ] Serve sistema report content
- [ ] Serve moderazione attiva
- **Status**: ⚠️ Moderazione automatica OK, serve anche manuale

### Google Play Store

#### Policy Compliance

**Alcohol-Related Content**
- ✅ Content rating Mature 17+ impostato
- ⚠️ Non deve facilitare vendita alcool a minori
- ⚠️ Non deve promuovere consumo irresponsabile

**User Generated Content**
- [ ] Serve chiaro sistema report e blocco
- [ ] Moderazione attiva richiesta
- [ ] Policy contro hate speech/harassment
- **Status**: ⚠️ Implementare report system

**Data Safety**
- [ ] Data Safety section da compilare accuratamente
- [ ] Disclosure precisa tutti dati raccolti
- [ ] Disclosure data sharing practices
- **Status**: ⚠️ Da completare su Play Console

---

## 5. 📄 Contratti e Terms

### Terms of Service

#### Status
- ✅ Terms of Service esistenti (`docs/TERMS_OF_SERVICE.md`)
- ⚠️ Non ancora pubblicati su URL accessibile

#### Contenuto Essenziale
✅ **Presenti**:
- Account terms
- User conduct
- Intellectual property
- Limitation of liability
- Dispute resolution

⚠️ **DA AGGIUNGERE/VERIFICARE**:
- [ ] Clausola arbitrato (invece di class action)
- [ ] Severability clause
- [ ] Force majeure
- [ ] Modification rights
- [ ] Termination rights dettagliati

### Merchant Agreement

#### Status
⚠️ **MANCANTE** - App ha dashboard merchant ma:
- [ ] Nessun contratto specifico merchant
- [ ] Nessuna definizione commissioni/fees
- [ ] Nessuna responsabilità merchant vs piattaforma

**Azione**: 🔴 **CRITICO** - Creare Merchant Terms prima di onboarding merchant

**Deve includere**:
- Fees/commissioni (se presenti)
- Responsabilità per contenuti merchant
- Diritti rimozione merchant
- Data ownership
- Indemnification clauses

### End User License Agreement (EULA)

#### Status
⚠️ **Opzionale ma consigliato**

Difference vs ToS:
- EULA = licenza uso software
- ToS = termini servizio

**Considerare se**:
- Vuoi restringere uso commerciale
- Vuoi vietare reverse engineering
- Vuoi limitare liability più stringente

---

## 6. 💳 Monetizzazione e Taxes

### Current Status
- ✅ App è **FREE** (no in-app purchases)
- ✅ No ads attualmente
- ⚠️ Sistema promo: monetizzazione futura?

### Se/Quando Monetizzare

#### In-App Purchases
**Obblighi**:
- [ ] Apple prende 30% (15% per small business <$1M)
- [ ] Google prende 30% (15% per primi $1M)
- [ ] Serve Partita IVA/business registration
- [ ] Fatturazione e tax compliance
- [ ] VAT registration se EU

#### Merchant Commissions
**Se introduci fees per merchant**:
- [ ] Contratto merchant chiaro
- [ ] Payment processing (Stripe, etc.)
- [ ] Tax withholding
- [ ] 1099/fiscal reporting (USA)
- [ ] Invoice system

#### Advertising
**Se introduci ads**:
- [ ] Disclosure chiara agli utenti
- [ ] Privacy policy update (data sharing)
- [ ] Considerazioni GDPR/CCPA
- [ ] Store policy compliance (no intrusive ads)

**Raccomandazione**: Consultare commercialista prima di monetizzare

---

## 7. 🔒 Sicurezza e Liability

### Data Security

#### Current Implementation
✅ **Buone Pratiche**:
- HTTPS per tutte le API
- JWT authentication
- Password hashing (bcrypt)
- Database su Railway (managed, backup)

⚠️ **DA VERIFICARE**:
- [ ] Penetration testing
- [ ] Security audit del codice
- [ ] Rate limiting su API
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

### Limitation of Liability

#### Status
✅ Presente in Terms of Service

**Verifica include**:
- [ ] "As-is" disclaimer
- [ ] No warranty express/implied
- [ ] Limitation damages to amount paid (=$0 ora)
- [ ] Exclusion consequential damages
- [ ] Jurisdictional limitations (alcune giurisdizioni non permettono certe esclusioni)

### Insurance

⚠️ **CONSIGLIATO quando app cresce**:
- Cyber Liability Insurance
- Professional Liability (E&O)
- General Liability

**Costo**: ~$500-2000/anno per startup piccola

---

## 8. ✅ CHECKLIST IMMEDIATA (Pre-Launch)

### Must-Have Prima di Launch Pubblico

**🔴 CRITICAL (blockers)**:
```
[ ] 1. Trademark search "Stappa" completata
       → Se conflitto: CHANGE NAME IMMEDIATELY
       
[ ] 2. Privacy Policy su URL pubblico accessibile
       → Required by both stores
       
[ ] 3. Terms of Service su URL pubblico accessibile
       → Legal protection essenziale
       
[ ] 4. Merchant Terms creati
       → Prima di permettere merchant signup
       
[ ] 5. Account deletion feature implementata
       → GDPR requirement critical
```

**🟡 IMPORTANT (entro 30 giorni)**:
```
[ ] 6. Data export feature implementata
       → GDPR right to portability
       
[ ] 7. Content reporting system
       → Store policy + legal protection
       
[ ] 8. Responsible drinking disclaimers
       → Mitigazione rischio alcool
       
[ ] 9. Age verification in-app
       → Oltre a store rating
       
[ ] 10. Legal review documents
        → Avvocato verifica Terms/Privacy
```

**🟢 RECOMMENDED (entro 90 giorni)**:
```
[ ] 11. Trademark registration iniziata
[ ] 12. Security audit
[ ] 13. Data retention policy definita
[ ] 14. Incident response plan
[ ] 15. Insurance quote ricevuta
```

---

## 9. 💰 Costi Stimati Compliance

### Immediate (Pre-Launch)
```
Trademark search:        €0-200 (self) / €500-800 (avvocato)
Legal review ToS/Privacy: €500-1500 (avvocato)
TOTAL:                   €500-2300
```

### Entro 6 mesi
```
Trademark registration:  €1000-1500 (EU)
Privacy compliance audit: €800-2000
Security audit:          €1000-3000
TOTAL:                   €2800-6500
```

### Ongoing
```
Legal counsel (retainer): €200-500/mese (opzionale)
Insurance:                €500-2000/anno
Compliance monitoring:    €0-1000/anno
```

---

## 10. 🔗 Risorse e Contatti

### Self-Service Resources
- **GDPR**: https://gdpr.eu/
- **CCPA**: https://oag.ca.gov/privacy/ccpa
- **Apple Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Policies**: https://play.google.com/about/developer-content-policy/
- **EUIPO Trademark**: https://euipo.europa.eu/
- **USPTO Trademark**: https://www.uspto.gov/

### Legal Services
**Italia**:
- Altalex (directory avvocati tech)
- ICT Legal Consulting
- Studio legale specializzato in privacy/tech

**Online**:
- Rocket Lawyer
- LegalZoom (USA)
- Ironclad (contract management)

### Privacy/GDPR
- iubenda.com (Privacy/Cookie Policy generator)
- OneTrust (Compliance platform)
- TrustArc (Privacy compliance)

---

## ⚠️ DISCLAIMER FINALE

Questo documento è fornito a scopo informativo e NON costituisce consulenza legale. Le leggi variano per giurisdizione e cambiano frequentemente.

**SI RACCOMANDA FORTEMENTE** di consultare:
1. Avvocato specializzato in tech/privacy per review Terms e Privacy Policy
2. Commercialista per implicazioni fiscali
3. Consulente IP per trademark strategy

**RISCHIO se ignori compliance**:
- Removal da App Store/Play Store
- Multe GDPR fino a €20M o 4% revenue globale
- Lawsuits da utenti
- Criminal liability (in casi gravi)

**L'investimento in legal compliance ora** previene problemi costosi futuri e protegge il business a lungo termine.

---

**Prossimo passo**: Prioritizzare Critical items e contattare avvocato per review.
