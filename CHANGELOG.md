# Changelog

All notable changes to the Cibola2 Electron client will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Gold Credit Payout Markups**: Made Credit, Split, and Cash payout markup values editable and persistent:
  - **Database Persistence**: Stored payout type markups in the `values` table with `type_id = 5` (records for Cash, Split, Credit storing decimal markup adjustment offsets) and cached them in `metadataState.payoutMarkups` in [metadata.js](file:///c:/dev/Cibola2-Electron/src/store/metadata.js).
  - **Dynamic Pricing Calculations**: Updated `getAdjustedMarkup()` in [pricing.js](file:///c:/dev/Cibola2-Electron/src/utils/pricing.js) to resolve markup adjustment offsets dynamically from cached `payoutMarkups` values.
  - **CreditForm Inline Editing**: Added editable markup offset text fields for Cash, Split, and Credit next to the Payout Type radio group in [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue), complete with dynamic item recalculation and a "Save Markups" button to commit modified defaults globally to the database.
  - **Admin Settings**: Added a "Payout Type Markups" configuration section on the Gold Credits page (`section === 'gold-credit'`) in [CustomValuesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/CustomValuesAdmin.vue) allowing administrators to edit and save default markup adjustments.

## [2.0.0]

### Changed
- **UI & Layout**: Compacted the customer summary header card at the top of Job, Gold Credit, and Custom Sheet forms to reduce vertical scrolling and maximize active workspace:
  - Moved customer history totals (Jobs, Gold Credits, Custom Sheets) into a compact row in the card footer.
  - Hidden Customer ID in transaction form headers while retaining it on the main Customer Manager page.
  - Removed empty address placeholders for customers without physical addresses on file.
- **Custom Sheet Admin & Workflow**: Redesigned the Custom Sheet Values and Categories configuration interface:
  - Replaced the single monolithic table in `CustomValuesAdmin.vue` with organized category section cards (`Metal`, `Labor`, `Stones`, `Quick Extra`) matching custom sheet estimate layouts.
  - Added section-specific `+ Add [Category] Item` buttons to create items pre-filled to that category.
  - Unified `Extra` and `Quick Extra` into a single, merged `Quick Extra` section card and dropdown option.
  - Added case-insensitive, whitespace-trimmed category deduplication to prevent duplicate section headers or dropdown entries.
  - Replaced the numeric `Order` text field on the Sheet Categories configuration page with Up/Down arrow buttons (`mdi-chevron-up` / `mdi-chevron-down`) for quick reordering.
  - Removed the Category column from section cards to maximize table space, and converted "Delete" buttons into compact icon-only trash actions.
  - Attached a full-height 36px pulsing warning strip button (`mdi-alert-decagram`) seamlessly to the left edge of the note text field, saving ~45px of vertical space while keeping high-visibility warning styling.
  - Clicking the warning strip toggles privacy mode, switching to a quiet grey eye-off strip (`mdi-eye-off-outline`) and displaying a discrete privacy placeholder bar.
  - Unified all note controls (`Add Note`, `Edit Note`, `Discard`, `Save Note`) into the card footer action bar, keeping the card body completely clean.
  - Set notes to be locked by default (`lockNotes: true`) and removed field `autofocus` to prevent unintended focus theft or edit mode entry when clicking customer names or loading customer records.
  - Moved save progress indicators to the Save button itself, eliminating layout movement and using toast notifications for save confirmation.
- **Job Print Template & Layout**:
  - Overhauled Quadrant 1 (Office/Store Copy) layout in `jobPrintTemplate.js`: stacked Customer Info (Name, Phone, Email) and Employee/Dates Meta info (`assignment_ind` & `event` icons) into dedicated rounded bordered cards in the left column.
  - Expanded the right-hand Estimate Details box to match the full height of the stacked left cards.
  - Implemented dynamic character-length font scaling for Customer Names and Image Notes.
  - Removed legacy line-clamp CSS rules from multi-line job notes to prevent premature ellipsis truncation.
  - Adjusted bottom receipt warning text size and positioning.
- **Form Navigation & Admin Configuration**:
  - Scoped the Print Preview button in `FormBottomNavigation.vue` to development environments (`import.meta.env.DEV`), hiding it automatically in production builds.
  - Aligned the uncommitted customer changes warning banner relative to the active workspace area offset from the navigation sidebar.
  - Removed update simulation mode toggle and purged all simulation state properties and logic from `LocalSettingsAdmin.vue` and `notifications.js`.

## [1.9.5]

### Added
- **UI**: Added a Hide/Unhide toggle button on the right-hand side of the customer note warning alert in [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue). Clicking "Hide" stops the pulsing animation, turns the alert to a neutral grey color, and hides the customer note textarea. Clicking "Unhide" restores the active state and warning theme.
- **UI**: Added a feature in [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue) where the customer autocomplete dropdown shows up to 5 recently viewed customer records when focused/selected and the search input is empty. These items are displayed with a history clock icon (`mdi-history`) and a `"Recently Viewed"` tag. Typing a character clears the suggestions list.
- **UI/Pagination**: Added pagination support to the **Recently Viewed Records** ([RecentlyViewed.vue](file:///c:/dev/Cibola2-Electron/src/components/RecentlyViewed.vue)) and **Recently Created Records** ([RecentlyCreated.vue](file:///c:/dev/Cibola2-Electron/src/components/RecentlyCreated.vue)) widgets on the dashboard. They now support up to 50 records, paginated in segments of 10 using the standard `DirectoryPagination.vue` component.
- **Performance**: Optimized thumbnail loading in [RecentlyCreated.vue](file:///c:/dev/Cibola2-Electron/src/components/RecentlyCreated.vue) by lazily querying job thumbnails only when they become visible on the active page of the pagination widget.

### Changed
- **Employees**: Switched the employee selection dropdowns on Job Form (`JobForm.vue`) and Credit Form (`CreditForm.vue`) to load from the new `/employees/assignable` endpoint (cached via `metadataState.assignableEmployees` in `metadata.js`). This excludes system-default and unassignable records (like "Unassigned" / "Nobody", ID 1) from active assignment options. Additionally, updated the initial states and reset logic to set `employee_id` to `null` by default on new records so that the select dropdown starts empty and requires explicit user selection to pass form validation, while maintaining a computed fallback display for existing historical assignments.
- **Storage**: Extended `recentlyViewedState.records` capacity from 10 to 50 in [recentlyViewed.js](file:///c:/dev/Cibola2-Electron/src/store/recentlyViewed.js) and modified the customer recording logic to save individual details (`fname`, `lname`, `phone`) along with standard information to populate suggestions.

## [1.9.4]

### Fixed
- Fixed Quick Extra items not rendering on Custom Sheets.
- Adjusted font sizes on Job bag prints.
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
