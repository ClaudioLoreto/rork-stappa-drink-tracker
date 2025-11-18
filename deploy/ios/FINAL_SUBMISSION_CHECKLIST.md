# Stappa – iOS Final Submission Checklist

Last update: 2025-11-18

Use this file as the runbook to move from "ready locally" to "Submitted for Review" in App Store Connect.

## 1. Prerequisites Confirm
- [ ] Legal pages live (GitHub Pages folder `docs/`): privacy, terms, cookies, support, index.
- [ ] URLs validated (open each in browser + mobile):
  - Privacy: https://<your-gh-username>.github.io/rork-stappa-drink-tracker/privacy.html
  - Terms:   https://<your-gh-username>.github.io/rork-stappa-drink-tracker/terms.html
  - Cookies: https://<your-gh-username>.github.io/rork-stappa-drink-tracker/cookies.html
  - Support: https://<your-gh-username>.github.io/rork-stappa-drink-tracker/support.html
- [ ] `deploy/ios/app-store-metadata.json` finalized.
- [ ] Age Rating selections prepared (see `AGE_RATING_GUIDE.md`).

## 2. Generate Production Build (TestFlight)
```bash
# Install eas if missing
npm install --save-dev eas-cli

# Authenticate (once)
npx eas login

# Configure (already have eas.json). Run build:
eas build -p ios --profile production
```
- Wait for build to finish (link in terminal). When complete, it appears in App Store Connect > TestFlight.
- [ ] Download .ipa locally (optional) and verify integrity.

## 3. Internal TestFlight Smoke Test
- Add internal testers (your Apple team members).
- Test critical flows:
  - Login with demo account.
  - Select a bar.
  - View social feed.
  - Perform merchant dashboard action (if role available).
  - Scan/unlock a drink (if implemented in build).
- [ ] No crashes / major UI blockers.

## 4. Capture & Prepare Screenshots
- Use script:
```bash
chmod +x deploy/ios/screenshots/generate-ios-screenshots.sh
./deploy/ios/screenshots/generate-ios-screenshots.sh
```
- Capture required device sizes (Apple currently requires 6.7" & 6.5"; optionally 5.5").
- Ensure consistent light/dark choice (prefer light) and brand color presence.
- Remove any personal data / extraneous debug elements.
- [ ] At least 4–5 strong feature screens (Login, Venue List, Social Feed, Unlock/Scan, Merchant Dashboard).

## 5. App Store Connect – Metadata Entry
In App Store Connect > App Information & Version:
- Paste Subtitle, Description, Promo Text, Keywords from `app-store-metadata.json`.
- Support URL: use support.html.
- Marketing URL: can point to index.html (or future landing site).
- Privacy Policy URL: privacy.html.
- Review Notes: copy prepared reviewer instructions + demo credentials.
- [ ] Age Rating questionnaire: select values per `AGE_RATING_GUIDE.md` (Alcohol frequent/intense, rest No).

## 6. Compliance & Export
- If asked for encryption export compliance: App uses standard HTTPS only (answer "Yes" to using encryption, but qualifies for exemption; typical selection: "This app uses encryption but is exempt (non-custom, only standard protocols).").
- Confirm no third-party login requiring extra doc.
- [ ] Provide contact email for support in App Store Connect.

## 7. Final Validation
- [ ] Version number matches build (e.g., 1.0.0) and build number increments (e.g., 1, 2).
- [ ] Pricing & Availability set (Free, all countries or selected region list).
- [ ] App Icon and screenshots visible.
- [ ] No placeholder text remaining.

## 8. Submit For Review
- Click "Submit for Review".
- If any warnings (missing compliance info), resolve first.
- Record submission timestamp in internal log (`deploy/shared/SESSION_WORK_SUMMARY.md`).

## 9. Post-Submission Watch
- Typical initial review time: 24–72h for first submission.
- Respond promptly to metadata clarification requests (most common: Age Rating mismatch or Privacy URL unreachable).

## 10. After Approval
- Tag release in Git: `git tag ios-v1.0.0 && git push --tags`.
- Create release notes (same as Promo Text + any minor known limitations).

## Common Pitfalls Checklist
- [ ] Privacy URL returns HTTP 200 (no 404, no redirect loops).
- [ ] Screenshots not mixing languages (all Italian or all English consistently; Italian is fine since metadata Italian). 
- [ ] No mention of future features as if already live.
- [ ] Reviewer credentials clearly stated and functioning.
- [ ] No third-party content without rights (logos of bars only if authorized).

## Fastlane (Optional Future Automation)
Create `fastlane/Fastfile` for metadata + screenshots automation:
```ruby
lane :deliver_ios do
  upload_to_app_store(
    skip_screenshots: false,
    metadata_path: "deploy/ios",
    screenshots_path: "deploy/ios/screenshots/output",
    submit_for_review: false
  )
end
```
Run later with:
```bash
bundle exec fastlane deliver_ios
```

## Minimal Review Notes Template (for quick copy)
```
Demo account: demo_user / DemoPass123
Merchant demo: merchant_demo / MerchantPass123
Features: login, select venue, view feed, scan/unlock beverages, merchant stock view.
Alcohol references are purely informational; no purchase pathway.
Legal pages hosted publicly at provided URLs.
```

Keep this file updated after each submission iteration.
