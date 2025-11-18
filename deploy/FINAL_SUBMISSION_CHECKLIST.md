# 🎯 PRE-SUBMISSION FINAL CHECKLIST

**App**: Stappa Drink Tracker  
**Status**: Build ready, metadata pending  
**Target**: iOS App Store submission  
**Date**: 18 November 2025

---

## ⚠️ CRITICAL BLOCKERS (Must Fix Before Submit)

### 🔴 BLOCKER 1: Age Verification Missing
- [ ] **Issue**: App rated 17+ but no age verification in registration
- [ ] **Fix Required**: Add birthdate field to `app/register.tsx`
- [ ] **Apple Requirement**: Apps with alcohol content MUST verify age
- [ ] **Implementation**: 
  ```tsx
  - Add DatePicker or manual input (DD/MM/YYYY)
  - Calculate age from birthdate
  - Block registration if age < 18
  - Store birthdate in database (required for compliance)
  ```
- [ ] **Backend Update**: Add `birthdate` column to User schema (Prisma)
- [ ] **Priority**: 🔴 CRITICAL - Apple WILL reject without this

### 🟡 BLOCKER 2: Privacy Policy URL Not Live
- [ ] **Issue**: Legal documents only on GitHub, not on public domain
- [ ] **Current URLs**: 
  - https://github.com/ClaudioLoreto/.../PRIVACY_POLICY.md (NOT valid for App Store)
- [ ] **Fix Required**: Host `deploy/assets/legal-page.html` on public web
- [ ] **Options**:
  - Option A: Use GitHub Pages (free, easy)
  - Option B: Host on rork.com/stappa/legal
  - Option C: Use Vercel/Netlify (free hosting)
- [ ] **Update URLs in**:
  - [ ] `app/register.tsx` (links in checkboxes)
  - [ ] App Store Connect → Privacy Policy URL field
  - [ ] `deploy/ios/app-store-metadata.json`
- [ ] **Priority**: 🔴 CRITICAL - Apple WILL reject without accessible URL

### 🟡 BLOCKER 3: Demo Account for Review
- [ ] **Issue**: No test account created yet
- [ ] **Fix Required**: Create dedicated demo account
- [ ] **Details**:
  ```
  Email: demo@stappa.com (or demo@rork.com)
  Password: DemoStappa2025!
  Age: 25+ (to pass age verification)
  ```
- [ ] **Test**: Login works, all features accessible
- [ ] **Add to**: App Store Connect → App Review Information
- [ ] **Priority**: 🟡 HIGH - Required for review process

### 🟢 BLOCKER 4: Screenshots
- [ ] **Issue**: No screenshots generated yet
- [ ] **Options**:
  - [ ] Option A: Install Xcode + run `deploy/screenshots/generate-ios.sh`
  - [ ] Option B: Manual capture from TestFlight on iPhone
  - [ ] Option C: Use mockup tools (mockuphone.com, shots.so)
  - [ ] Option D: Quick placeholder approach (iterate later)
- [ ] **Required Sizes**: 6.7" (1290×2796), 6.5" (1242×2688), 5.5" (1242×2208)
- [ ] **Quantity**: 6-10 screenshots
- [ ] **Guide**: See `deploy/screenshots/SCREENSHOT_GUIDE.md`
- [ ] **Priority**: 🟢 MEDIUM - Can use "good enough" for v1.0.0

---

## ✅ COMPLETED ITEMS

### Backend & Infrastructure
- [x] Backend deployed on Railway (https://rork-stappa-drink-tracker-production.up.railway.app)
- [x] PostgreSQL database configured
- [x] API endpoints tested and functional
- [x] OpenAI optional (no crashes if missing key)

### Apple Developer Setup
- [x] Apple Developer account active
- [x] Bundle ID registered: `app.rork.stappa-drink-tracker`
- [x] App created on App Store Connect (ID: 6755406156)
- [x] Team ID configured: 65HWTGRJ83

### EAS Build
- [x] EAS CLI installed and logged in
- [x] Build configuration complete (eas.json)
- [x] Dependencies fixed (babel-plugin-module-resolver in dependencies)
- [x] iOS build successful (.ipa artifact generated)
- [x] Build uploaded to TestFlight

### Documentation
- [x] iOS submission checklist created
- [x] Android preparation checklist created
- [x] Legal compliance review documented
- [x] Screenshot generation guide created
- [x] Session continuity document created
- [x] App Store Connect guide created
- [x] All docs committed to GitHub

---

## 📝 METADATA STATUS

### App Information (App Store Connect)
- [ ] App Name: "Stappa - Drink Tracker"
- [ ] Subtitle: "Social Drink Tracking & Nightlife"
- [ ] Primary Category: Social Networking
- [ ] Secondary Category: Food & Drink
- [ ] Age Rating: 17+ (Alcohol content)
- [ ] Copyright: © 2025 Rork / Claudio Loreto
- [ ] SKU: stappa-drink-tracker-2025
- [ ] **Privacy Policy URL**: ⚠️ PENDING (awaiting hosting)
- [ ] **Support URL**: ⚠️ PENDING (awaiting hosting)

### Version Information (1.0.0)
- [ ] "What's New" text written (see APP_STORE_CONNECT_GUIDE.md)
- [ ] Description (long) written (see APP_STORE_CONNECT_GUIDE.md)
- [ ] Promotional text written
- [ ] Keywords selected
- [ ] Marketing URL (optional)
- [ ] **Screenshots**: ⚠️ PENDING

### App Review Information
- [ ] Contact name: Claudio Loreto
- [ ] Contact phone: [YOUR PHONE]
- [ ] Contact email: support@rork.com
- [ ] **Demo account**: ⚠️ PENDING (to create)
- [ ] Review notes (IT + EN) prepared
- [ ] Test QR code attached (optional but recommended)

### Privacy Nutrition Label
- [ ] Contact Info → Email Address
- [ ] Location → Precise Location
- [ ] User Content → Photos
- [ ] User Content → Other User Content
- [ ] Identifiers → User ID
- [ ] Usage Data → Product Interaction
- [ ] Diagnostics → Crash Data

---

## 🔧 TECHNICAL REQUIREMENTS

### App Functionality
- [x] App launches without crashes
- [x] Login/Register flow works
- [x] QR code scanning functional
- [x] Geolocation permission handled correctly
- [x] Social feed loads
- [x] Promo system works
- [ ] **Age verification**: ⚠️ TO IMPLEMENT

### Legal Compliance
- [ ] **Privacy Policy accessible**: ⚠️ PENDING
- [ ] **Terms of Service accessible**: ⚠️ PENDING
- [ ] **Cookie Policy accessible**: ⚠️ PENDING
- [ ] Age gate at registration: ⚠️ TO IMPLEMENT
- [ ] GDPR-compliant data handling (backend implemented)
- [ ] Account deletion feature (backend implemented)

### Performance
- [x] No critical bugs in TestFlight
- [x] Backend responds correctly
- [x] Images load properly
- [x] Navigation smooth

---

## 🚀 SUBMISSION WORKFLOW

### Phase 1: Fix Critical Blockers (URGENT)
**Time estimate: 2-4 hours**

1. **Add Age Verification** (1-2 hours)
   - [ ] Update Prisma schema (add `birthdate` to User model)
   - [ ] Run migration: `npx prisma migrate dev --name add_birthdate`
   - [ ] Update `app/register.tsx`:
     - Add DatePicker or manual date input
     - Add age validation (must be 18+)
     - Block submit if underage
   - [ ] Update backend `auth.controller.js` register endpoint
   - [ ] Test registration flow
   - [ ] **Files to edit**:
     - `backend/prisma/schema.prisma`
     - `app/register.tsx`
     - `backend/src/controllers/auth.controller.js`
     - `constants/translations.ts` (add age-related translations)

2. **Host Legal Documents** (30 min)
   - [ ] Option A: GitHub Pages
     ```bash
     cd deploy/assets
     git checkout -b gh-pages
     git add legal-page.html
     git commit -m "Add legal documents page"
     git push origin gh-pages
     # Enable GitHub Pages in repo settings
     # URL: https://claudioreto.github.io/rork-stappa-drink-tracker/legal-page.html
     ```
   - [ ] Option B: Vercel (faster)
     ```bash
     cd deploy/assets
     vercel --prod
     # URL: https://stappa-legal.vercel.app (or custom)
     ```
   - [ ] Update all references to new URL:
     - `app/register.tsx` (3 Linking.openURL calls)
     - App Store Connect fields
     - `deploy/ios/app-store-metadata.json`

3. **Create Demo Account** (15 min)
   - [ ] Use production app to register:
     - Email: demo@rork.com
     - Username: demo_stappa
     - Password: DemoStappa2025!
     - Birthdate: 01/01/1995 (age 30)
   - [ ] Verify login works
   - [ ] Add some test data (track 2-3 drinks, post on social)
   - [ ] Document credentials in App Store Connect

### Phase 2: Complete Metadata (30-60 min)
4. **Fill App Store Connect** 
   - [ ] Navigate to https://appstoreconnect.apple.com/apps/6755406156
   - [ ] Copy metadata from `deploy/ios/app-store-metadata.json`
   - [ ] Paste into all fields
   - [ ] Update URLs with actual hosted legal page
   - [ ] Save all sections

5. **Complete Privacy Nutrition Label**
   - [ ] Answer all data collection questions
   - [ ] Use checklist from APP_STORE_CONNECT_GUIDE.md
   - [ ] Save

### Phase 3: Screenshots (1-2 hours)
6. **Generate Screenshots**
   - [ ] Choose method (see SCREENSHOT_GUIDE.md)
   - [ ] Generate for 3 sizes required
   - [ ] Upload to App Store Connect
   - [ ] Verify all slots filled

### Phase 4: Final Review (30 min)
7. **Pre-Flight Check**
   - [ ] Test app on TestFlight one more time
   - [ ] Verify demo account works
   - [ ] Check all URLs accessible (privacy, support)
   - [ ] Verify age verification works
   - [ ] Review App Store Connect metadata (no typos)

8. **Submit for Review**
   - [ ] App Store Connect → Version 1.0.0
   - [ ] Click "Add for Review"
   - [ ] Select "Manually release this version"
   - [ ] Click "Submit for Review"
   - [ ] **Done!** 🎉

---

## ⏱️ TIME ESTIMATES

| Task | Time | Priority |
|------|------|----------|
| Add age verification | 2h | 🔴 CRITICAL |
| Host legal docs | 30min | 🔴 CRITICAL |
| Create demo account | 15min | 🟡 HIGH |
| Complete metadata | 1h | 🟡 HIGH |
| Generate screenshots | 2h | 🟢 MEDIUM |
| Final review & submit | 30min | ✅ Final |
| **TOTAL** | **6 hours** | |

**Realistic timeline**: 1-2 working days (with breaks)

---

## 📞 HELP & RESOURCES

**If stuck on**:
- Age verification → See `docs/REGISTRATION_REQUIREMENTS.md` or create GitHub issue
- Legal hosting → Use Vercel (fastest): https://vercel.com
- Screenshots → Use Option C (mockup tools) if no Xcode
- Metadata → See `deploy/ios/APP_STORE_CONNECT_GUIDE.md` (detailed walkthrough)
- General → Check `SESSION_CONTINUITY.md` for all project context

**External Resources**:
- Apple Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect Help: https://developer.apple.com/support/
- Vercel Deployment: https://vercel.com/docs

---

## ✅ CHECKLIST SUMMARY

**Before you can submit**:
- [ ] Age verification implemented ✨ MUST DO
- [ ] Legal docs hosted on public URL ✨ MUST DO
- [ ] Demo account created ✨ MUST DO
- [ ] All metadata filled in App Store Connect
- [ ] Screenshots uploaded (at least "good enough" quality)
- [ ] Privacy Nutrition Label completed
- [ ] Tested on TestFlight (no critical bugs)

**Once all checked → SUBMIT! 🚀**

---

**Current Status**: 🔴 3 Critical Blockers Remaining  
**Next Action**: Implement age verification in registration  
**Document Version**: 1.0.0  
**Last Updated**: 18 Nov 2025
