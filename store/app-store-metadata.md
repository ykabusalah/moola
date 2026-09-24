# moola — App Store Connect submission fields

Copy-paste these into App Store Connect. Character counts noted for the fields Apple limits.

---

## Basic

- **App name**: `moola`
- **Subtitle** (30 chars): `Quiet, offline expense tracker` — 30/30
- **Primary language**: English (U.S.)
- **Bundle ID**: `com.ykabusalah.moola` (select from dropdown after first EAS build has uploaded)
- **SKU**: `moola-001` (any unique string)
- **Primary category**: Finance
- **Secondary category**: (leave blank, or Productivity)

---

## Pricing & Availability

- **Price**: Free
- **Availability**: All territories (or pick as you like)

---

## App Privacy

Click through the privacy questionnaire and mark **"Data Not Collected"** across every category. This matches the app's actual behavior — no analytics, no crash reporting, no third-party SDKs, no data leaves the device.

If Apple asks about a specific SDK it detected:
- `expo-notifications` uses **local notifications only**, no push tokens sent anywhere
- `expo-secure-store` writes to the iOS Keychain, on-device only
- `expo-local-authentication` is bundled but not used for any user-facing feature in v1.0 (the app lock is PIN-only)

None of these count as "Data Collection."

---

## Age Rating

Answer **"None"** to every question in the age rating questionnaire. Result: **4+**.

---

## URLs

- **Support URL**: `https://ykabusalah.github.io/moola/support.html`
- **Marketing URL** (optional): `https://ykabusalah.github.io/moola/`
- **Privacy Policy URL**: `https://ykabusalah.github.io/moola/privacy.html`

> Hosted via GitHub Pages on the `moola` repo, `/docs` folder. To enable: repo &rarr; Settings &rarr; Pages &rarr; Source = "Deploy from a branch" &rarr; Branch: `main`, folder: `/docs` &rarr; Save. Live within ~1 minute at the URLs above.

---

## Description (max 4000 chars)

```
moola is a quiet, private way to track what you spend.

No accounts. No cloud. No servers. Every expense you log stays on your device and nowhere else — that's the whole point.

If you've ever felt uneasy handing your bank login to another app, or watched an "expense tracker" ask permission to sync everything to the cloud, moola is the opposite of that. It doesn't want your data. It just helps you keep your own record.

━━━━━━━━━━━━━━━━━━━━

WHAT IT DOES

• Log expenses in seconds, with optional notes
• Recurring expenses — weekly, monthly, or yearly
• Views by day, week, month, and year with a running total
• Optional daily reminder to log
• Optional backup reminder to export your records
• PIN lock (off by default; enable it if you want it)
• 24 currency options and EU-style number formatting
• 5 accent color themes
• Light and dark mode
• CSV export via the share sheet
• Fully offline — works in airplane mode, on a plane, in a basement

━━━━━━━━━━━━━━━━━━━━

WHAT IT DOESN'T DO

• No account creation
• No cloud sync
• No bank connections
• No analytics or usage tracking
• No third-party SDKs that collect data
• No ads

━━━━━━━━━━━━━━━━━━━━

WHY LOCAL-ONLY

Because your financial history is yours. Not a growth metric. Not something to be modeled, sold, or used to train anything. Uninstall the app and every trace is gone.

If you want a backup, you export a CSV. That's it.

━━━━━━━━━━━━━━━━━━━━

moola is free and always will be. If it helps you, and you'd like to support future work, there's a "Buy me a coffee" link in Settings — completely optional.

"Your coins remain within this vessel."
```

Character count: ~1550. Well under the 4000 limit.

---

## Keywords (100 chars, comma-separated, no spaces after commas)

```
expense,budget,spending,money,private,offline,finance,personal,mindful,tracker,log,daily,ledger
```

Character count: 96/100. Apple strips duplicates against your app name and description automatically, so avoid repeating "moola" here.

---

## Promotional Text (170 chars, editable without new review)

```
Every version of moola stays quiet and private — your data lives only on your device. No accounts, no servers. Just you and your record.
```

Character count: 138/170.

---

## What's New in This Version (release notes for v1.0.0, 4000 chars)

```
First release.

moola is a quiet, private way to track what you spend. Everything stays on your device — no accounts, no servers, no tracking.

• Log expenses with optional notes
• Recurring expenses (weekly, monthly, yearly)
• Views by day, week, month, and year
• Optional PIN lock
• Optional daily and backup reminders
• 24 currencies, EU number format option
• 5 accent color themes, light and dark mode
• CSV export via share sheet
• Fully offline
```

---

## App Review Information

- **Sign-in required?**: No
- **Demo account username / password**: (leave blank)
- **Contact information**:
  - First name: `Yousef`
  - Last name: `Abu-Salah`
  - Phone: (your number)
  - Email: `ykabusalah@gmail.com`
- **Notes**:

```
moola is a fully offline, local-only expense tracker.

• No accounts, no sign-in, no server calls at any point in the app lifecycle.
• All data is stored on-device using AsyncStorage and expo-secure-store (iOS Keychain).
• No analytics, crash reporting, ad SDKs, or tracking of any kind.
• Optional PIN lock is disabled by default. Users may enable it in Settings > Security.
• Optional local notifications (daily log reminder, weekly/monthly backup reminder) are disabled by default and require explicit user opt-in during onboarding or later in Settings > Reminders.
• The "Buy me a coffee" link in Settings > Support opens a Ko-fi page in Safari after showing a confirmation prompt. There is no in-app purchase.
• The feedback link in Settings > Support opens an external Tally.so form in Safari after showing a confirmation prompt.

No demo credentials are needed. The app is fully usable on first launch after completing the ~30 second onboarding (name, start date, optional reminders).
```

---

## Version & Build

- **Version number**: `1.0.0` (already set in app.json)
- **Build number**: auto-incremented by EAS on production build (`autoIncrement: true` in eas.json)
- **Copyright**: `2026 Yousef Abu-Salah`

---

## Screenshots (you need these before submitting)

Required sizes — take AT LEAST ONE of these:

| Device | Resolution | Aspect | Notes |
|---|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 x 2868 | portrait | Primary — recommended |
| iPhone 6.7" (iPhone 15 Pro Max) | 1290 x 2796 | portrait | Alternative |

iPad screenshots **not required** — `supportsTablet` is now `false` in app.json.

Recommended shots (3–6, in this order):
1. Today view with a few expenses (looks lived-in)
2. Add expense modal, mid-entry
3. Week or month view with the running total
4. Onboarding step 3 (the notifications toggle screen)
5. Settings screen showing the sections
6. Lock screen (optional — shows PIN protection)

Take on your iPhone via **Volume Up + Side button**. Airdrop or upload to your Mac/PC, then drag into ASC.

---

## Encryption declaration

Already handled — `ITSAppUsesNonExemptEncryption: false` is set in `app.json`. ASC won't ask you again.

---

## Final checklist before hitting Submit

- [ ] `docs/` published via GitHub Pages, all 3 links load
- [ ] Screenshots uploaded (min 3, max 10 per device size)
- [ ] App icon 1024x1024 uploaded (auto-pulled from your build's `icon.png` in most cases; upload manually if not)
- [ ] Description, keywords, promo text, subtitle filled
- [ ] Support & privacy URLs entered and verified
- [ ] Age rating questionnaire completed (4+)
- [ ] Privacy nutrition labels set to "Data Not Collected"
- [ ] App Review notes pasted
- [ ] Build uploaded via `eas submit --platform ios --latest` and selected in ASC
- [ ] Submit for Review
