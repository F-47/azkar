# Azkar App - Desktop Reminders

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/F-47/azkar/releases)
[![Tauri](https://img.shields.io/badge/platform-Tauri%20v2-orange.svg)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)

Azkar App is a professional desktop application designed for daily spiritual reminders. Built with a focus on performance and minimalist aesthetics, it integrates directly into your desktop environment with a glassmorphic interface and native system notifications.

---

## Screenshots

<div align="center">
  <img src="screenshots/1.png" width="48%" />
  <img src="screenshots/2.png" width="48%" />
  <br />
  <img src="screenshots/3.png" width="48%" />
  <img src="screenshots/4.png" width="48%" />
  <br />
  <img src="screenshots/5.png" width="35%" />
</div>

---

## Technical Specifications

Azkar App is built on the **Tauri v2** framework, ensuring high security and a minimal resource footprint. The frontend leverages **Next.js 16** and **React 19** for a fast, responsive user experience. It supports cross-platform deployment on both **Windows** and **Linux** systems.

---

## Core Features

- **Cross-Platform Support**: Ready for Windows and Linux systems.
- **Glassmorphic UI**: Minimalist design language compatible with Light and Dark modes.
- **Automated Reminders**: Configurable scheduling for morning and evening Adhkar.
- **Custom Notifications**: Stylized reminder windows integrated with the desktop shell.
- **System Tray Integration**: Persistent background operation with a low memory profile.
- **Automatic Updates**: Seamless background updates via the Tauri updater plugin.
- **Active Hours**: Intelligent scheduling to avoid interruptions during specific times.

---

## Technology Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| **Core**     | [Tauri v2](https://tauri.app)               |
| **Frontend** | [Next.js 16](https://nextjs.org/), React 19 |
| **Styling**  | Tailwind CSS 4, Framer Motion               |

---

## Installation and Development

### Downloads

Installers are available for Windows and Linux on the [Releases Page](https://github.com/F-47/azkar/releases).

| Operating System | Recommended Format                    |
| ---------------- | ------------------------------------- |
| **Windows**      | `.msi` (Installer) or `.exe` (NSIS)   |
| **Linux**        | `.deb` (Debian/Ubuntu) or `.AppImage` |

### Building from Source

To set up a local development environment:

1. **Requirements**: Node.js 20+ and Rust (Stable).
2. **Setup**:
   ```bash
   npm install
   ```
3. **Run Development**:
   ```bash
   npm run dev
   ```
4. **Build Distribution**:
   ```bash
   npm run build
   ```

---

## Patch Notes

Detailed version history and changes are documented in the [CHANGELOG.md](CHANGELOG.md).

---

## License

Distributed under the MIT License. See [LICENSE.md](LICENSE.md) for more information.
