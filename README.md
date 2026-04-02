# أذكار — Azkar Desktop App

تطبيق سطح مكتب لأذكار الصباح والمساء مع إشعارات دورية.

A desktop app for Muslim morning and evening Adhkar with scheduled reminders.

---

## Download

Pre-built installers are attached to every [GitHub Release](https://github.com/F-47/azkar/releases/latest).

| Platform | File | Notes |
|----------|------|-------|
| Windows | `.msi` | Recommended — Windows Installer |
| Windows | `.exe` | NSIS standalone installer |
| Linux | `.deb` | Debian / Ubuntu / Mint |
| Linux | `.AppImage` | Portable, runs on any distro |

Go to **[Releases](https://github.com/F-47/azkar/releases)** → pick the latest version → download the file for your OS.

---

## Features

- أذكار الصباح والمساء (Morning & Evening Adhkar)
- Scheduled desktop reminders at a configurable interval
- Custom reminder window — styled popup, not a plain OS notification
- Active hours setting (e.g. only remind between 6 AM and 10 PM)
- Minimizes to system tray instead of closing
- Dark/light aware styling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://tauri.app) (Rust) |
| Frontend | Next.js 14 + React 18 (static export) |
| Styling | Tailwind CSS + CSS variables |
| Fonts | Noto Naskh Arabic, Amiri |

---

## Development

**Prerequisites:** Node.js 20+, Rust (stable), system WebView2 (Windows) or WebKitGTK (Linux).

```bash
# Install dependencies
npm install

# Run in dev mode (hot reload)
npm run dev

# Build for production (current platform only)
npm run build
```

> Releases for both Windows and Linux are built automatically via GitHub Actions when a version tag is pushed — no local cross-compilation needed.

---

## Releasing

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build the installers and publish them to the Releases page automatically.
