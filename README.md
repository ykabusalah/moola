# moola

A local-only expense tracker for iOS and Android. No accounts, no cloud, no tracking.

## Why

Most expense apps want your bank login or sync to servers. This one doesn't. Everything stays on your device.

## Features

- Quick expense logging with optional notes
- Recurring expenses (weekly, monthly, yearly)
- View by day, week, month, or year
- Light and dark mode
- CSV export
- Fully offline

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone (or iOS Simulator / Android Emulator)

### Installation

```bash
git clone https://github.com/yourusername/moola.git
cd moola
npm install
npx expo start
```

Scan the QR code with Expo Go to run on your device.

### Building for Production

```bash
npm install -g eas-cli
eas build:configure
eas build --platform ios
eas build --platform android
```

## Project Structure

```
moola/
├── App.js
├── app.json
├── package.json
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## Data Storage

Uses AsyncStorage. Data stored under:
- `@moola/expenses`
- `@moola/preferences`

Export to CSV from the app menu.

## Privacy

No servers, no analytics, no tracking. Data never leaves your device unless you export it.

## License

MIT