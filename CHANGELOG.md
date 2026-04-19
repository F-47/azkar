# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2026-04-19

### Added

- Privacy policy page at `/privacy` with link in site footer.
- Microsoft Store support: offline WebView2 installer config and dedicated `build:store` script.
- Automated Microsoft Store installer build in CI/CD pipeline.

### Fixed

- Notification scheduler now cycles through azkar in sequential order — no more random repeats until all have been shown.
- Tray icon left-click now opens the app window; right-click shows the Open/Quit menu.

### Changed

- Build optimizations: `panic = "abort"` for smaller release binary, `incremental = true` for faster dev rebuilds, `removeUnusedCommands` to strip dead Tauri commands.

---

## [1.0.6] - 2026-04-14

### Changed

- Improved UI layout and refined font sizes
- Removed letter spacing for better readability

### Added

- Duration multiplier control in settings

### Fixed

- Notification timer not starting immediately
- Hover interaction causing timer instability

---

## [1.0.5] - 2026-04-13

### Fixed

- Corrected typo in zikr text
- Resolved issue causing text to render as squares

---

## [1.0.4] - 2026-04-12

### Added

- App will auto start in tray on launch.

## [1.0.3] - 2026-04-12

### Added

- Fix auto start issue.

## [1.0.2] - 2026-04-12

### Added

- Auto Start toggler in settings.

## [1.0.1] - 2026-04-10

### Fixed

- Notification positioning is now correctly aligned across screen sizes.
- Auto-dismiss timer now pauses when hovering over notifications.

### Added

- Default notification settings for improved out-of-the-box behavior.
- UI customization options for notifications.

## [1.0.0] - 2026-03-15

### Added

- Initial release of Azkar Desktop App.
- Core collection of Morning & Evening Adhkar.
- Basic system tray support.
- Windows installer (.msi).

---

_For full details, visit the GitHub Releases page._
