# Stappa – Age Rating Questionnaire Guidance (App Store Connect)

Last update: 2025-11-18

This guide maps each App Store Connect age rating question to recommended answers based on current app functionality (social feed, bar interaction, drink tracking/unlocking, bug reporting, no UGC media beyond text/standard UI).

Apple uses a content matrix. Alcohol/tobacco/drug references determine baseline age rating. Because Stappa focuses on alcoholic beverages and unlocking related experiences, the safest consistent rating is **17+**. Attempting 12+ while centered on alcohol can trigger rejection or require justification.

## Summary Recommendation
- Target Rating: **17+**
- Primary Reason: Core purpose involves discovering and tracking alcoholic drinks and venues; alcohol reference frequency is integral ("frequent and/or intense").
- Downgrading Risk: Selecting infrequent references (12+) could be contradicted by UI screens (menus, drink lists, social check-ins).

## Questionnaire Mapping
| Category | Apple Prompt Example | Recommended Selection | Rationale |
|----------|----------------------|-----------------------|-----------|
| Violence | Cartoon / Fantasy / Realistic / Prolonged | None / "No" for all | App has no violent content. |
| Sexual Content | Nudity / Sexual Content / Graphic | None / "No" | No sexual content. |
| Profanity | Profanity or Crude Humor | No | Not part of UX. |
| Alcohol, Tobacco, Drugs | References or Use | "Frequent or Intense" | Core functionality revolves around beverages (alcohol). |
| Gambling | Simulated Gambling | No | No gambling features. |
| Horror | Horror / Fear Themes | No | Not present. |
| Mature / Suggestive | Mature Themes | No | Plain social/establishment interactions. |
| Medical / Treatment | Medical / Treatment Info | No | No medical guidance. |
| Contests | Contests | No | No contest system. |
| Unrestricted Web Access | Web Access | No | In-app web views limited (legal docs). |
| Violence Against Human | Graphic Violence | No | None. |
| Weapons | Weapons Info | No | None. |
| Sexual Content or Nudity | Sexual / Nudity | No | None. |
| User Generated Content (UGC) | UGC Moderation | "Yes (Moderated)" if text posts/reviews expand later OR currently "N/A" | Present state minimal; if enabling reviews, mark moderated. |
| Advertising | Apps sharing data / targeted ads | "No" targeted ads | No ad network integration currently. |

## Additional Notes
1. **Alcohol Reference Depth**: Screens (bar selection, drink articles, stock) show repeated references; mark as frequent/intense to avoid mismatch.
2. **UGC Considerations**: If future reviews or comments allow free-form text, ensure moderation policy and toggle "User Generated Content" -> "Yes" with description: "Text-only reviews subjected to automated and manual moderation."
3. **Data Safety Alignment**: Ensure privacy policy URL is active before submission; Apple reviewers often cross-check alcohol rating claims with policy phrasing (include brief mention of age-use expectations).
4. **Localization**: Age rating logic is language-independent; Italian metadata does not change selection.

## Metadata Field Tips
- "Review Notes": Reiterate: "Core feature: scanning / unlocking beverages in partner venues; all alcohol references are informational; no purchase gateway inside the app." Already included in `app-store-metadata.json`.
- "Demo Account": Provide credentials (already in reviewNotes). Make sure they log in successfully under current backend seed.

## Checklist Before Submission
- [ ] Age Rating selections entered exactly as table above.
- [ ] Privacy Policy URL (GitHub Pages) live and linked in App Store Connect.
- [ ] App Screenshots do not depict minors; show neutral UI (login, venue list, social feed, merchant dashboard).
- [ ] Review Notes updated if features changed since last build.
- [ ] Build passes TestFlight smoke test (login, select bar, open social feed, merchant view if applicable).

## FAQ
**Can we lower to 12+?** Only if we convincingly categorize alcohol references as "Infrequent and Mild" (not true for core flows). Risk: metadata rejection.

**Will 17+ limit reach?** Some. However accuracy reduces re-review delays. Can revisit if product pivots away from alcohol focus (e.g., generic venue social app).

**Do we need additional disclaimers?** Optional: Add in settings screen a short line: "L'app è destinata a utenti maggiorenni conformemente alla normativa locale."

## Next Step Automation (Optional)
You can script metadata upload via App Store Connect API (Fastlane deliver) but manual first submission recommended.

Example Fastlane snippet (for later):
```ruby
deliver(
  submit_for_review: false,
  force: true,
  metadata_path: "deploy/ios",
  screenshots_path: "deploy/ios/screenshots/output"
)
```

Keep this guide updated if features introducing new content types (UGC media, promotions) are added.
