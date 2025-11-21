# 🔄 Session Continuity Document - Stappa Drink Tracker

**Ultimo aggiornamento**: 18 Novembre 2025  
**Versione app**: 1.0.0  
**Piattaforme**: iOS, Android (in preparazione)

---

## 📋 Quick Reference

### Identifiers
- **Bundle ID (iOS)**: `app.rork.stappa-drink-tracker`
- **Package Name (Android)**: `app.rork.stappadrinktracker`
- **App Store Connect ID**: 6755406156
- **Apple Team ID**: 65HWTGRJ83
- **Expo Project ID**: c0a486cf-b2c2-4bd0-a508-a40c8e0aed06

### URLs
- **Repository**: https://github.com/ClaudioLoreto/rork-stappa-drink-tracker
- **Backend API**: https://rork-stappa-drink-tracker-production.up.railway.app
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6755406156
- **Website**: https://rork.com (TODO)
- **Support**: support@rork.com (TODO)

### Accounts
- **Apple Developer**: cloreto71@gmail.com
- **Expo**: claudio.loreto.20
- **GitHub**: ClaudioLoreto
- **Railway**: (backend hosting)

---

## 🗂 Project Structure

```
rork-stappa-drink-tracker/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout (auth context)
│   ├── index.tsx                # Home/Splash
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration
│   ├── user.tsx                 # User dashboard
│   ├── merchant.tsx             # Merchant dashboard
│   ├── admin.tsx                # Admin dashboard
│   ├── select-bar.tsx           # Bar selection
│   ├── social/                  # Social features
│   └── merchant/                # Merchant features
│       ├── articles.tsx         # Article management
│       └── stock/               # Stock management
├── backend/                      # Express API server
│   ├── src/
│   │   ├── server.js            # Entry point
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Auth, etc.
│   │   ├── routes/              # API routes
│   │   └── utils/               # Helpers
│   └── prisma/
│       └── schema.prisma        # Database schema
├── components/                   # Reusable UI components
├── constants/                    # Colors, translations
├── contexts/                     # React contexts (Auth, Bar, Language, Theme)
├── docs/                         # Documentation
│   ├── PRIVACY_POLICY.md
│   ├── TERMS_OF_SERVICE.md
│   └── COOKIE_POLICY.md
├── deploy/                       # 🆕 Deployment files & docs
│   ├── README.md                # Deployment overview
│   ├── ios/                     # iOS specific
│   │   ├── IOS_CHECKLIST.md
│   │   └── app-store-metadata.json
│   ├── android/                 # Android specific
│   │   ├── ANDROID_CHECKLIST.md
│   │   └── play-store-metadata.json
│   ├── screenshots/             # Screenshot generators
│   │   ├── generate-ios.sh
│   │   └── generate-android.sh
│   └── assets/                  # Shared assets
├── services/                     # API services
│   ├── api.ts                   # Main API client
│   ├── api-config.ts            # API configuration
│   └── api-http.ts              # HTTP implementation
├── types/                        # TypeScript types
├── utils/                        # Utility functions
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind (currently disabled)
└── metro.config.js               # Metro bundler config
```

---

## 🔧 Current Configuration Status

### ✅ Completed
1. **Backend Deployment**
   - Deployed on Railway
   - PostgreSQL database configured
   - API_BASE_URL: `https://rork-stappa-drink-tracker-production.up.railway.app`
   - OpenAI integration made optional

2. **iOS Setup**
   - Apple Developer account active
   - Bundle ID registered
   - App created on App Store Connect (ID: 6755406156)
   - EAS credentials generated (distribution cert + provisioning profile)
   - First build completed and uploaded to TestFlight

3. **Build System**
   - EAS Build configured
   - Fixed Bun conflicts (removed bun.lock, added .easignore)
   - Fixed path alias resolution (babel-plugin-module-resolver)
   - NativeWind temporarily disabled (aspect-ratio parse errors)
   - npm enforced as package manager

### ⏳ In Progress
1. **iOS App Store**
   - Build uploaded to TestFlight ✅
   - Metadata compilation needed
   - Screenshots needed (6.7", 6.5", 5.5")
   - Privacy nutrition label to complete
   - Submit for review

2. **Android Setup**
   - EAS configuration ready
   - Build not yet created
   - Play Console app not yet created

### ❌ TODO
1. **iOS Completion**
   - Generate screenshots
   - Complete metadata on App Store Connect
   - Add demo account credentials
   - Submit for review

2. **Android/Google Play**
   - Create Play Console account
   - Generate Android build
   - Create Play Store listing
   - Upload screenshots
   - Submit for review

3. **Legal & Compliance**
   - Publish privacy policy on web
   - Publish terms of service on web
   - Verify GDPR compliance
   - Verify CCPA compliance
   - Consider trademark registration

4. **Assets**
   - Generate all icon sizes
   - Create feature graphic for Play Store
   - Create promotional materials

---

## 🐛 Known Issues & Workarounds

### 1. NativeWind / Tailwind Disabled
**Issue**: `react-native-css-interop` parseAspectRatio error during Metro bundling  
**Workaround**: Disabled NativeWind in `metro.config.js`  
**Impact**: No Tailwind utilities available, using StyleSheet only  
**Files affected**: `metro.config.js`, `app/_layout.tsx`  
**Future fix**: Upgrade to compatible nativewind/css-interop versions or wait for bug fix

### 2. Path Alias Resolution
**Issue**: Metro couldn't resolve `@/*` imports  
**Solution**: Added `babel-plugin-module-resolver` to dependencies (not devDependencies!)  
**Files**: `babel.config.js`, `package.json`

### 3. Bun Conflicts on EAS
**Issue**: EAS detected bun.lock and tried to use Bun instead of npm  
**Solution**: 
- Removed `bun.lock`
- Added `.easignore` with Bun files
- Added `.npmrc` with `legacy-peer-deps=true`
**Files**: `.easignore`, `.npmrc`

### 4. React Version
**Issue**: Expo SDK 54 requires React 18.3.x  
**Solution**: Downgraded from 19 to 18.3.1  
**Files**: `package.json`

### 5. NODE_ENV=production Build
**Issue**: With NODE_ENV=production, npm only installs production dependencies  
**Solution**: Moved `babel-plugin-module-resolver` from devDependencies to dependencies  
**Files**: `package.json`

---

## 🚀 Quick Commands Reference

### Development
```bash
# Start development server
npx expo start

# Start on iOS simulator
npx expo start --ios

# Start on Android emulator
npx expo start --android

# Clear cache
rm -rf .expo node_modules && npm install

# Lint
npm run lint
```

### Building
```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production

# Clear cache and rebuild
eas build --platform ios --profile production --clear-cache
```

### Submission
```bash
# Submit to App Store
eas submit -p ios --latest

# Submit to Play Store
eas submit -p android --latest
```

### Screenshots
```bash
# Generate iOS screenshots
./deploy/screenshots/generate-ios.sh

# Generate Android screenshots
./deploy/screenshots/generate-android.sh
```

### Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Seed database
node src/seed.js

# Start server locally
npm start
```

---

## 🔐 Environment Variables

### Frontend (Expo)
No environment variables needed in app - configuration in `services/api-config.ts`:
- `USE_MOCK_API`: false (using HTTP backend)
- `API_BASE_URL`: Railway production URL

### Backend (Railway)
Required environment variables on Railway:
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `PORT`: Auto-configured by Railway
- `OPENAI_API_KEY`: Optional (for AI features)
- `JWT_SECRET`: For authentication tokens
- `NODE_ENV`: production

---

## 📦 Dependencies Overview

### Critical Dependencies
- `expo`: ^54.0.22 - React Native framework
- `expo-router`: ~6.0.14 - File-based routing
- `react`: 18.3.1 - Core (must be 18.x for Expo 54)
- `react-native`: 0.81.5 - Native platform
- `babel-plugin-module-resolver`: ^5.0.2 - Path alias resolution (MUST be in dependencies, not devDependencies!)

### UI & Styling
- `nativewind`: ^4.1.23 - Currently disabled due to css-interop bug
- `react-native-css-interop`: 0.2.1 - CSS processing (causing issues)
- `tailwindcss`: ^3.4.18 - Not actively used
- `lucide-react-native`: Icons

### Navigation & Routing
- `expo-router`: File-based routing
- `react-native-screens`: Screen management
- `react-native-safe-area-context`: Safe area handling

### Backend Communication
- `@tanstack/react-query`: Data fetching/caching
- No axios/fetch wrapper - using native fetch

### Device Features
- `expo-camera`: QR code scanning
- `expo-location`: Geolocation for nearby bars
- `expo-image-picker`: Photo uploads
- `expo-av`: Audio (stappa sound effects)
- `expo-haptics`: Haptic feedback

### State Management
- `zustand`: Lightweight state management
- React Context for auth, bar, language, theme

---

## 🌍 Multi-Platform Considerations

### Cross-Platform Compatibility
✅ **Working on both**:
- Core app logic
- API communication
- Authentication flow
- Most UI components (StyleSheet-based)

⚠️ **Platform-specific**:
- Camera permissions (different implementations)
- Location permissions (different strings)
- Push notifications (if added)
- In-app purchases (if added)

### Windows Development
When pulling on Windows:
- Git line endings: ensure `.gitattributes` configured
- Node version: use same as Mac (20.11.1)
- EAS CLI works cross-platform
- Can't build iOS locally (need Mac or EAS)
- Can build Android locally with Android Studio

---

## 📄 Legal & Compliance Status

### Privacy Documents
- ✅ Privacy Policy exists: `docs/PRIVACY_POLICY.md`
- ✅ Terms of Service exists: `docs/TERMS_OF_SERVICE.md`
- ✅ Cookie Policy exists: `docs/COOKIE_POLICY.md`
- ❌ Documents not yet published on web (needed for store submission)

### Compliance
- ✅ GDPR considerations documented
- ✅ CCPA considerations documented
- ✅ Data collection disclosed
- ❌ Legal review not yet performed
- ❌ Trademark not registered

### Copyright
- App name: "Stappa Drink Tracker"
- Copyright holder: Rork / Claudio Loreto
- Year: 2025
- ❌ **TODO**: Verify no trademark conflicts
- ❌ **TODO**: Consider registering trademark for "Stappa"

### Third-Party Licenses
- All dependencies use permissive licenses (MIT, Apache 2.0, BSD)
- No GPL dependencies
- OpenAI API (optional, requires API key)

---

## 🎯 Next Session: What to Do

### If Continuing iOS Submission
1. Run screenshot generator: `./deploy/screenshots/generate-ios.sh`
2. Open App Store Connect: https://appstoreconnect.apple.com/apps/6755406156
3. Upload screenshots to all required sizes
4. Fill metadata from `deploy/ios/app-store-metadata.json`
5. Complete privacy nutrition label
6. Add demo account: demo@stappa.app / [password]
7. Submit for review

### If Starting Android
1. Create Google Play Console account ($25)
2. Run: `eas build --platform android --profile production`
3. Create app on Play Console
4. Run: `./deploy/screenshots/generate-android.sh`
5. Fill metadata from `deploy/android/play-store-metadata.json`
6. Upload AAB and screenshots
7. Complete Data Safety section
8. Submit for review

### If Publishing Legal Documents
1. Set up simple static website or use GitHub Pages
2. Publish:
   - `docs/PRIVACY_POLICY.md` → https://rork.com/privacy
   - `docs/TERMS_OF_SERVICE.md` → https://rork.com/terms
   - `docs/COOKIE_POLICY.md` → https://rork.com/cookies
3. Update URLs in:
   - `deploy/ios/app-store-metadata.json`
   - `deploy/android/play-store-metadata.json`
   - App Store Connect
   - Play Console

### If Working on Features
- Branch from main
- Test thoroughly
- NativeWind is disabled - use StyleSheet only
- Ensure @/ imports work (babel-plugin-module-resolver)
- Test on both iOS and Android if possible

---

## 🆘 Troubleshooting Guide

### Build Fails
1. Clear cache: `rm -rf node_modules .expo && npm install`
2. Clear EAS cache: `--clear-cache` flag
3. Check EAS build logs for specific error
4. Common issues documented in "Known Issues" section above

### App Crashes on Start
1. Check API_BASE_URL is correct in `services/api-config.ts`
2. Verify backend is running on Railway
3. Check console logs in dev tools
4. Try mock API mode for testing

### Can't Submit to Store
1. Verify all metadata fields filled
2. Check screenshots uploaded (all sizes)
3. Ensure Privacy Policy URL is live and accessible
4. Verify build completed successfully on EAS

### Path Import Errors
- Ensure `babel-plugin-module-resolver` is in dependencies (not devDependencies)
- Clear cache and rebuild
- Check `babel.config.js` configuration

---

## 📞 Important Contacts

- **Apple Developer Support**: https://developer.apple.com/contact/
- **Google Play Support**: https://support.google.com/googleplay/android-developer
- **Expo Support**: https://expo.dev/support
- **Railway Support**: https://railway.app/help

---

## 🔖 Bookmark These

Essential links for quick access:
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Expo Dashboard](https://expo.dev/@claudio.loreto.20)
- [Railway Dashboard](https://railway.app/)
- [GitHub Repo](https://github.com/ClaudioLoreto/rork-stappa-drink-tracker)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

---

**This document should be updated after each major change or milestone.**
