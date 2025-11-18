# 🌐 Deploy Legal Documents Guide

**Objective**: Host `deploy/assets/legal-page.html` on public URL for App Store compliance

**Current Status**: ❌ Legal docs only on GitHub (NOT valid for App Store)  
**Required**: ✅ Public HTTPS URL accessible without login

> Aggiornamento (Hosting multiplo raccomandato): puoi pubblicare **Privacy**, **Terms**, **Cookies**, **Support** e una mini **Landing Marketing** direttamente dalla cartella `docs/` usando GitHub Pages – senza creare branch separati. Vedi sezione "GitHub Pages (Metodo Ottimizzato)".

---

## ⚡ FASTEST OPTION: Vercel (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /Users/claudioloreto/Development/Projects/rork-stappa-drink-tracker/deploy/assets
vercel --prod
```

### Step 3: Follow prompts
- Login with GitHub (or email)
- Project name: `stappa-legal` (or any name)
- Select default settings (just press Enter)

### Step 4: Get URL
Vercel will output:
```
✅ Production: https://stappa-legal.vercel.app
```

**Your Privacy Policy URL**: `https://stappa-legal.vercel.app/legal-page.html`

### Step 5: Update App
Update these files with the new URL:
- [ ] `app/register.tsx` (3 Linking.openURL calls)
- [ ] App Store Connect → Privacy Policy URL
- [ ] App Store Connect → Support URL (same page, different anchor: `#contact`)

---

## 🟠 ALTERNATIVE: GitHub Pages (10 minutes)

## 🟠 GITHUB PAGES (Metodo Ottimizzato - 5 minuti)

Puoi usare direttamente la cartella `docs/` (già esistente) senza creare branch.

### Step 1: Crea file HTML statici
Assicurati di avere:
```
docs/
  index.html            (Landing / Marketing URL)
  support.html          (Support URL)
  privacy.html          (Privacy Policy)
  terms.html            (Terms of Service)
  cookies.html          (Cookie Policy)
```

### Step 2: Abilita GitHub Pages
1. Vai a: Settings → Pages del repository
2. Source: `Deploy from a branch`
3. Branch: `main`  / Folder: `/docs`
4. Salva

### Step 3: URL risultanti
```
Base: https://claudioreto.github.io/rork-stappa-drink-tracker/
Privacy: https://claudioreto.github.io/rork-stappa-drink-tracker/privacy.html
Terms:   https://claudioreto.github.io/rork-stappa-drink-tracker/terms.html
Cookies: https://claudioreto.github.io/rork-stappa-drink-tracker/cookies.html
Support: https://claudioreto.github.io/rork-stappa-drink-tracker/support.html
Marketing: https://claudioreto.github.io/rork-stappa-drink-tracker/
```

### Step 4: Commit & Push
```bash
git add docs/*.html
git commit -m "Add public legal + support + marketing pages"
git push origin main
```

### Vantaggi
- ✅ Un solo branch (main)
- ✅ Nessun rebuild app per aggiornare i testi se URL invariati
- ✅ Compatibile con App Store & Play Store

---

## 🟡 ALTERNATIVE: Netlify (8 minutes)

### Step 1: Create account
https://www.netlify.com (free, no card required)

### Step 2: Drag & drop
1. Click "Add new site" → "Deploy manually"
2. Drag `deploy/assets/legal-page.html` into drop zone
3. Wait for deployment (30 seconds)

### Step 3: Get URL
Netlify assigns:
```
https://random-name-123.netlify.app
```

You can customize:
- Site settings → Change site name → `stappa-legal`
- New URL: `https://stappa-legal.netlify.app`

---

## 🔵 CUSTOM DOMAIN (If you own rork.com)

If you have `rork.com` domain:

### Option A: Vercel with custom domain
```bash
vercel --prod
vercel domains add stappa.rork.com
```

### Option B: Simple web hosting
Upload `legal-page.html` to:
```
https://rork.com/stappa/legal.html
```

Then update DNS:
```
A Record: stappa → Vercel IP
CNAME: stappa → your-vercel-app.vercel.app
```

---

## ✅ AFTER DEPLOYMENT CHECKLIST

Once you have the URL (e.g., `https://stappa-legal.vercel.app/legal-page.html`):

### 1. Update App Code
```bash
cd /Users/claudioloreto/Development/Projects/rork-stappa-drink-tracker
```

Edit `app/register.tsx` - replace all 3 GitHub URLs:

**OLD** (line ~325):
```tsx
Linking.openURL('https://github.com/ClaudioLoreto/rork-stappa-drink-tracker/blob/main/docs/PRIVACY_POLICY.md');
```

**NEW**:
```tsx
Linking.openURL('https://stappa-legal.vercel.app/legal-page.html#privacy');
```

**OLD** (line ~340):
```tsx
Linking.openURL('https://github.com/ClaudioLoreto/rork-stappa-drink-tracker/blob/main/docs/TERMS_OF_SERVICE.md');
```

**NEW**:
```tsx
Linking.openURL('https://stappa-legal.vercel.app/legal-page.html#terms');
```

**OLD** (line ~355):
```tsx
Linking.openURL('https://github.com/ClaudioLoreto/rork-stappa-drink-tracker/blob/main/docs/COOKIE_POLICY.md');
```

**NEW**:
```tsx
Linking.openURL('https://stappa-legal.vercel.app/legal-page.html#cookies');
```

### 2. Update App Store Connect
Navigate to: https://appstoreconnect.apple.com/apps/6755406156

**App Information** tab:
- **Privacy Policy URL**: `https://stappa-legal.vercel.app/legal-page.html#privacy`
- **Support URL**: `https://stappa-legal.vercel.app/legal-page.html#contact`

Se usi GitHub Pages:
- Privacy: `https://claudioreto.github.io/rork-stappa-drink-tracker/privacy.html`
- Support: `https://claudioreto.github.io/rork-stappa-drink-tracker/support.html`
- Marketing: `https://claudioreto.github.io/rork-stappa-drink-tracker/`

**Version 1.0.0** tab:
- **Marketing URL** (optional): `https://stappa-legal.vercel.app/legal-page.html`

### 3. Update Metadata JSON
Edit `deploy/ios/app-store-metadata.json`:
```json
{
  "privacyPolicyUrl": "https://claudioreto.github.io/rork-stappa-drink-tracker/privacy.html",
  "supportUrl": "https://claudioreto.github.io/rork-stappa-drink-tracker/support.html",
  "marketingUrl": "https://claudioreto.github.io/rork-stappa-drink-tracker/"
}
```

### 4. Rebuild App (IMPORTANT!)
Since you changed code in `app/register.tsx`:
```bash
eas build --platform ios --profile production --auto-submit
```

**Why rebuild?**: Legal links are hardcoded in app → need new build for App Store

**Timeline**: 15-20 min build time

---

## 🧪 VERIFY DEPLOYMENT

Before submitting to Apple, test:

### Test 1: URL Accessibility
```bash
curl -I https://your-url-here.vercel.app/legal-page.html
```

Expected output:
```
HTTP/2 200
content-type: text/html
```

### Test 2: Browser Check
Open in browser incognito mode:
```
https://your-url-here.vercel.app/legal-page.html
```

Verify:
- [ ] Privacy Policy section visible (#privacy)
- [ ] Terms of Service section visible (#terms)
- [ ] Cookie Policy section visible (#cookies)
- [ ] Contact section visible (#contact)
- [ ] No login required
- [ ] Page loads fast (<2s)

### Test 3: Mobile Check
Open on iPhone Safari:
```
https://your-url-here.vercel.app/legal-page.html
```

Verify:
- [ ] Page responsive (looks good on mobile)
- [ ] All sections scrollable
- [ ] Links work
- [ ] Text readable

---

## 🔄 UPDATING LEGAL DOCS LATER

If you need to update legal documents after submission:

### Option 1: Re-deploy with Vercel
```bash
cd /Users/claudioloreto/Development/Projects/rork-stappa-drink-tracker/deploy/assets
# Edit legal-page.html
vercel --prod
```

Same URL, updated content. **No app rebuild needed** (URL unchanged).

### Option 2: Netlify
1. Log in to Netlify
2. Drag new `legal-page.html` to deploys
3. Done

### Option 3: GitHub Pages
```bash
git checkout gh-pages
# Edit index.html
git commit -am "Update legal docs"
git push origin gh-pages
```

Wait 2-3 min for propagation.

---

## 📞 TROUBLESHOOTING

### Issue: "404 Not Found"
**Cause**: File path wrong or not deployed  
**Fix**: 
- Vercel: Check file is in root of deployed folder
- GitHub Pages: File must be `index.html` or full path

### Issue: "SSL Certificate Invalid"
**Cause**: HTTPS not enabled  
**Fix**: 
- Vercel/Netlify: Automatic HTTPS (wait 5 min)
- Custom domain: Add SSL certificate via hosting provider

### Issue: "Page loads slow"
**Cause**: Large file or slow host  
**Fix**: 
- Optimize images in legal-page.html
- Use Vercel/Netlify (both have global CDN)

### Issue: "Apple rejects URL"
**Cause**: URL not accessible or requires login  
**Fix**: 
- Test in incognito browser
- Verify no authentication required
- Check URL in Apple's review simulator

---

## 🎯 RECOMMENDATION

**Use Vercel** - it's the fastest and most reliable:
- ✅ Free forever (no card required)
- ✅ Instant deployment (30 seconds)
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Easy to update (just run `vercel` again)
- ✅ Custom domain support (if you want `rork.com` later)

**Command summary**:
```bash
npm install -g vercel
cd /Users/claudioloreto/Development/Projects/rork-stappa-drink-tracker/deploy/assets
vercel --prod
# Get URL → Update app code → Rebuild → Submit!
```

---

**Total time with Vercel**: ~20 minutes (5 min deploy + 15 min rebuild)

**Next steps**:
1. ✅ Deploy legal page (choose method above)
2. ✅ Update `app/register.tsx` with new URLs
3. ✅ Rebuild app: `eas build --platform ios --profile production`
4. ✅ Update App Store Connect metadata
5. ✅ Verify URLs accessible
6. ✅ Submit for review! 🚀

---

*Created: 18 Nov 2025*  
*Version: 1.0.0*
