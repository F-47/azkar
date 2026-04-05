# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-04-05
### Added
- **Modern UI**: Full glassmorphism design for a premium feel.
- **Migration**: Ported to **Tauri v2** for improved security and performance.
- **Next.js 16**: Upgraded frontend to Next.js 16 and React 19.

### Changed
- Refactored notification scheduling for better reliability on Windows.
- Improved system tray integration.
- Updated styling system with Tailwind CSS 4.

## [2.0.2] - 2026-04-02
### Added
- **Auto-Updater**: Integrated `@tauri-apps/plugin-updater` for seamless background updates.
- **Custom Notifications**: Stylized reminder windows instead of standard OS popups.
- **Configurable Intervals**: User-defined reminder frequency.

## [1.2.1] - 2026-03-30
### Fixed
- Navigation issues in production builds.
- Text clipping in notification windows on certain screen resolutions.

## [1.1.4] - 2026-03-25
### Added
- **Active Hours**: Option to silence reminders during specific hours (e.g., night time).
- Dark/Light mode synchronization with system settings.

## [1.0.0] - 2026-03-15
### Added
- Initial release of Azkar Desktop App.
- Core collection of Morning & Evening Adhkar.
- Basic system tray support.
- Windows installer (`.msi`).

---
*For full details, visit the [GitHub Releases](https://github.com/F-47/azkar/releases).*
