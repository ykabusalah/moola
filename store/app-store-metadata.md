# moola: App Store Connect submission fields

Copy-paste these into App Store Connect. Character counts noted for the fields Apple limits.

---

## Basic

- **App name**: `moola`
- **Subtitle** (30 chars): `Quiet, offline expense tracker` (30/30)
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

Click through the privacy questionnaire and mark **"Data Not Collected"** across every category. This matches the app's actual behavior: no analytics, no crash reporting, no third-party SDKs, and no data leaves the device.

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

- **Support URL**: `https://moola.fyi/support.html`
- **Marketing URL** (optional): `https://moola.fyi/`
- **Privacy Policy URL**: `https://moola.fyi/privacy.html`

> Hosted on Vercel from the `docs/` folder of the `moola` repo (Root Directory = `docs`, no build step). Domain `moola.fyi` is registered at Porkbun, with A and CNAME records pointing at Vercel. Pushing to `main` redeploys the site.

---

## Description (max 4000 chars)

```
moola is a simple, private way to track what you spend.

No accounts, no cloud, no servers. Every expense you log stays on your iPhone.

moola doesn't connect to your bank and doesn't sync anything online. You log what you spend, and it keeps a clear record for you.

WHAT IT DOES

• Log expenses in seconds, with optional notes
• Recurring expenses: weekly, monthly, or yearly
• Day, week, month, and year views with a running total
• Optional daily reminder to log
• Optional backup reminder to export your records
• Optional PIN lock, off by default
• 24 currencies and EU-style number formatting
• 5 accent colors
• Light and dark mode
• CSV export through the share sheet
• Works fully offline

WHAT IT DOESN'T DO

• No account creation
• No cloud sync
• No bank connections
• No analytics or usage tracking
• No third-party SDKs that collect data
• No ads

YOUR DATA STAYS ON YOUR PHONE

moola has no servers, so your records are never uploaded anywhere. Deleting the app deletes your data. To keep a backup, export a CSV from Settings.

moola is free. If you'd like to support it, there's an optional "Buy me a coffee" link in Settings.
```

Well under the 4000 character limit.

---

## Keywords (100 chars, comma-separated, no spaces after commas)

```
expense,budget,spending,money,private,offline,finance,personal,mindful,tracker,log,daily,ledger
```

Character count: 96/100. Apple strips duplicates against your app name and description automatically, so avoid repeating "moola" here.

---

## Promotional Text (170 chars, editable without new review)

```
Log an expense in seconds. See your day, week, month, and year at a glance. No accounts, no cloud. Your records never leave your iPhone.
```

Character count: 136/170.

---

## What's New in This Version (release notes for v1.0.0, 4000 chars)

```
First release.

moola is a simple, private way to track what you spend. Everything stays on your device. No accounts, no servers, no tracking.

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
  - Email: `yousef@moola.fyi`
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

Required sizes (take AT LEAST ONE of these):

| Device | Resolution | Aspect | Notes |
|---|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 x 2868 | portrait | Primary, recommended |
| iPhone 6.7" (iPhone 15 Pro Max) | 1290 x 2796 | portrait | Alternative |

iPad screenshots **not required** because `supportsTablet` is `false` in app.json.

Recommended shots (3 to 6, in this order):
1. Today view with a few expenses (looks lived-in)
2. Add expense modal, mid-entry
3. Week or month view with the running total
4. Onboarding step 3 (the notifications toggle screen)
5. Settings screen showing the sections
6. Lock screen (optional, shows PIN protection)

Take on your iPhone via **Volume Up + Side button**. Airdrop or upload to your Mac/PC, then drag into ASC.

---

## Encryption declaration

Already handled: `ITSAppUsesNonExemptEncryption: false` is set in `app.json`. ASC won't ask you again.

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
