# Changelog

All notable changes to the Cibola2 Electron client will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [1.9.4]

### Fixed
- Fixed Quick Extra items not rendering on Custom Sheets.
- Increased font size on Job Notes print field.
- Update notification now persists until update is applied.


## [1.9.3] - 2026-06-24

### Fixed

### Added
- **UI**: Dark/light mode preference is now persisted in `settings.json` and restored on next launch.

### Fixed
- **UI**: Fixed light mode display of the configuration page — admin panel and sub-components no longer render with dark backgrounds in light mode.
- **UI**: Fixed inactive employees appearing on employee picklist.

### Changed
- **Gold Credits**: Removed Final Amount field.

## [1.9.2] - 2026-06-23

### Fixed
- **Printing**: Adjusted margins and styling in [jobPrintTemplate.js](file:///c:/dev/Cibola2-Electron/src/utils/jobPrintTemplate.js) to prevent the outer edges from being cut off (clipping issue) when printed on physical paper.
- **Printing**: Shifted bottom quadrants of the job print template up by 10mm and reduced overall height to fit physical page guidelines.
- **Auto-Updater**: Set explicit `artifactName` mapping (`${productName}-Setup-${version}.${ext}`) in [package.json](file:///c:/dev/Cibola2-Electron/package.json) to match the dash-separated filename generated in `latest.yml`, resolving a 404 download error.
- **Credits**: Fixed silver credit calculation in `CreditForm.vue` to correctly apply purity multipliers and pricing markup values.

## [1.9.1] - 2026-06-23

### Fixed
- **Auto-Updater**: Corrected GitHub release publishing path and owner configuration in `package.json` to allow `electron-updater` to successfully locate `latest.yml`.
- **Navigation**: Implemented Non-Existent Record Navigation & Recovery Protocol. Shows an error toast when navigation fails, purges deleted records from the recently viewed history list, and performs automatic fallback redirection using `navigateBack()`.

## [1.9.0] - 2026-06-23

### Added
- **UI/Layout**: Refactored the Admin Settings dashboard to feature a persistent left sidebar instead of top tabs.
- **UI/Layout**: Extracted settings tabs into modular subcomponents ([LocalSettingsAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/LocalSettingsAdmin.vue), [EmployeesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/EmployeesAdmin.vue), [CustomValuesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/CustomValuesAdmin.vue)) to keep the code clean and isolated.
- **Version bump**: Bumped version configurations to 1.9.0 across configuration files.
