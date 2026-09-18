# Changelog

All notable changes to the Cibola2 Electron client will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Global Recently Viewed History Across Clients**:
  - **Central Database Sync**: Added a backend `recently_viewed` table in `cibola2` schema and REST endpoints (`POST /recently-viewed`, `GET /recently-viewed`) that track unique record views across all terminals and hydrate up to 50 records with details, estimates, and thumbnails.
  - **Single-Record Debounced View Dispatch**: Client dispatches atomic view notifications (`{ type, id }`) upon user navigation, automatically debounced to prevent duplicate requests when switching tabs or viewing the same record.
  - **All vs Local History Toggle**: Added a compact segmented button toggle (`[ All | Local ]`) in the card header of [RecentlyViewed.vue](file:///c:/dev/Cibola2-Electron/src/components/RecentlyViewed.vue), defaulting to `All` on application launch while allowing operators to switch to local device history.
  - **Auto-Polling & Manual Refresh**: Implemented 45-second auto-polling while viewing the Dashboard, auto-fetching on connection recovery, and added a manual refresh button (`mdi-refresh`).
  - **Removed Clear History Broom**: Removed the legacy clear history broom button to prevent accidental purge of global and local viewing history.
- **Editable Line-Item Markup on Scrap Payout Form**: Converted the `Markup` column in [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue) items table from static text to an editable numeric text field, allowing operators to manually customize the markup multiplier per item on the fly while automatically recalculating line item unit prices and total values.
- **Gold Credit 'Ignore Payout Markup' Configuration (`value4`)**: Stored an ignore payout markup boolean in the `value4` column for Karat Metal Items (`type_id = 1` in `values` table):
  - Added an "Ignore Payout Markup" switch column in [CustomValuesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/CustomValuesAdmin.vue) allowing administrators to configure which metals bypass payout type markup adjustments (such as Cash vs Split vs Credit).
  - Updated `getAdjustedMarkup()` in [pricing.js](file:///c:/dev/Cibola2-Electron/src/utils/pricing.js) to dynamically bypass adjustments when `ignoreTypeMarkup` is true, eliminating hardcoded metal name lists (`['8k', '9k', '10k', '12k', '14k', '18k']`).
  - Updated [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue) to pass item `value4` flags dynamically when calculating and recalculating scrap payout line items.
- **Gold Credit Item Reordering & Inactive Filter**: Replaced numeric order text inputs on the Gold Credits admin page in [CustomValuesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/CustomValuesAdmin.vue) with Up/Down buttons (`mdi-chevron-up` / `mdi-chevron-down`) for quick item reordering:
  - Added interactive reordering with `moveGoldCredit()` to recalculate item sequence orders and batch update the database via `api.put`.
  - Added a "Hide Inactive" toggle checkbox for Karat Metal Items matching sheet category configuration.
  - Updated [metadata.js](file:///c:/dev/Cibola2-Electron/src/store/metadata.js) to sort `metadataState.goldCredits` by `order` descending so selection dropdowns throughout the app (such as [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue)) reflect the configured sequence.
- **Duplicate Contact Detection & Merging**: Built an automated fuzzy duplicate contact detection and merging suite:
  - **Database Schema**: Created `customer_duplicates` table in SQLite schema storing potential duplicate customer pairs with similarity scores, match reasons, and status tracking (`unreviewed`, `merged`, `rejected`).
  - **Fuzzy & Weighted Match Engine**: Built `duplicateDetector.js` module featuring weighted Levenshtein distance on normalized names, phone numbers, and email matching to flag pairs scoring >= 75% similarity.
  - **Real-Time & Batch Detection**: Integrated real-time candidate checks on customer creation (`POST /customers`) and updates (`PUT /customers/:id`), alongside an index-bucketed full database scan endpoint (`POST /customers/duplicates/scan`).
  - **Side-by-Side Merge Modal**: Created `CustomerMergeModal.vue` presenting side-by-side customer profile attribute comparison with line-by-line selection toggles, automatically re-linking all historical Jobs, Gold Credits, Custom Sheets, Estimates, and Attached Images to Primary before deleting Secondary.
  - **Customer Profile Alerts**: Added Vuetify warning alert banners to `CustomerForm.vue` when loaded customers have potential duplicate pairs, providing direct access to the side-by-side merge modal.
  - **Admin Review Hub**: Integrated `CustomerDuplicatesAdmin.vue` into [Admin.vue](file:///c:/dev/Cibola2-Electron/src/components/Admin.vue) under "Customer Tools" for reviewing unreviewed and rejected duplicate pairs and running manual database scans.
  - **Batch Auto-Merge Exact Matches**: Added a **Merge All Exact Matches** action button and prominent warning modal in `CustomerDuplicatesAdmin.vue` paired with a backend transaction endpoint `POST /customers/merge-exact` to automatically consolidate 100% exact matching candidate pairs across the database.
  - **Unused Customer Maintenance & Bulk Cleanup**: Integrated `CustomerOrphansAdmin.vue` under "Customer Tools" in [Admin.vue](file:///c:/dev/Cibola2-Electron/src/components/Admin.vue) paired with `GET /customers/orphans`, `DELETE /customers/orphans/:id`, and `POST /customers/orphans/delete-bulk` backend endpoints. Provides an explicit **Scan for Unused Customers** trigger button to scan the database on demand rather than on page load. Automatically purges associated `customer_duplicates` pairs on single or bulk customer deletion.
  - **High Value Credit Payout Warning Alert ($3,000+)**: Added dual alert banners (`mdi-alert-decagram-outline`) at both the top and bottom of [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue) that automatically display when creating a new credit payout whose sum total reaches or exceeds $3,000.00, prompting operators to confirm with management before proceeding.
  - **Top-Right Hide Customer Note Button**: Added a compact icon button (`mdi-eye-off-outline`) in the top-right corner of the customer note field in [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue) to easily hide customer notes for privacy.

### Changed
- **Credit Form Save Defaults Button Text**: Updated the save markup defaults button in [CreditForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CreditForm.vue) to explicitly display the text "Save Defaults" alongside the save icon.
- **Customer Profile Contact Layout**: Updated [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue) contact info block layout so customer email addresses render on a newline directly below the phone number for cleaner visual hierarchy.
- **Navigation Drawer Logo Header Alignment**: Styled `.drawer-logo-header` in [App.vue](file:///c:/dev/Cibola2-Electron/src/App.vue) to explicitly match the 64px height of `<v-app-bar>`, ensuring the navigation drawer logo divider lines up seamlessly with the main header bar border.
- **Spot Metal Price Auto-Sync Interval**: Adjusted background auto-refresh threshold in [MetalPricesCard.vue](file:///c:/dev/Cibola2-Electron/src/components/MetalPricesCard.vue) from 15 minutes to **23 hours** (and updated `priceAgeWarn` stale indicator threshold to 23 hours), while maintaining immediate on-demand manual sync and inline editing.

### Fixed
- **Table Refresh Flickering & UI Resizing**:
  - **Persistent Table Mounting in UnifiedRecordTable**: Updated [UnifiedRecordTable.vue](file:///c:/dev/Cibola2-Electron/src/components/UnifiedRecordTable.vue) so the `<v-table>` remains continuously mounted whenever records exist (`processedRecords.length > 0`), displaying a subtle top progress linear bar (`v-progress-linear`) and slight opacity transition during reloads instead of unmounting the table and collapsing card height to an empty circular spinner.
  - **Reactivity Optimization**: Added a deep equivalence check in `fetchGlobalRecentlyViewed()` in [recentlyViewed.js](file:///c:/dev/Cibola2-Electron/src/store/recentlyViewed.js) to avoid re-assigning `globalRecords` when the fetched dataset is unchanged, preventing unnecessary reactive re-renders across the dashboard.
- **Form Bottom Navigation Centering Alignment**: Removed extraneous `<v-spacer>` before the Delete button in [FormBottomNavigation.vue](file:///c:/dev/Cibola2-Electron/src/components/FormBottomNavigation.vue), ensuring action buttons remain consistently centered across both new record creation and existing record viewing states.
- **Dark Mode Hidden Customer Note Contrast**: Replaced hardcoded light grey background (`bg-grey-lighten-4`) on the hidden note placeholder in [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue) with a theme-aware surface style (`rgba(var(--v-theme-on-surface), 0.05)`) and high-contrast typography, ensuring seamless readability in both dark and light modes.
- **Duplicate Merge Modal Lifecycle & Field Selection**:
  - **Modal Mounting Fix**: Resolved blank modal loading state in `CustomerMergeModal.vue` by adding `onMounted()` and props watcher hooks to fetch customer profiles immediately upon modal open.
  - **Interactive Side-by-Side Field Selector**: Replaced single-radio groups with interactive table cell selection targets (`clickable-cell` with `.selected-cell` background highlights and dynamic radio icons). Fixed default field selection logic so empty/null fields do not default to Secondary, and added inactive/greyed-out states (`mdi-check-circle-outline`) for exact matching fields to clarify that no manual selection is required.
  - **In-Modal Pair Rejection**: Added a **Reject (Not Duplicate)** button to `CustomerMergeModal.vue`'s footer action bar, enabling operators to reject false positive candidate pairs directly from the merge modal without returning to the Admin hub.
  - **Admin Directory Pagination & Search**: Integrated `DirectoryPagination.vue` into `CustomerDuplicatesAdmin.vue` for Unreviewed and Rejected pair listings (10 items per page) and added a live search/filter input bar to instantly filter candidate records by customer name, ID, phone, email, address, or match reason.
  - **Immediate Duplicate Banner Notification**: Updated `saveCustomer()` in [CustomerForm.vue](file:///c:/dev/Cibola2-Electron/src/components/CustomerForm.vue) to invoke `fetchDuplicatesForCustomer()` immediately upon creating or updating a customer profile, displaying warning banners without requiring navigation changes.
  - **Sensitive Name Spelling Variation Scoring**: Enhanced `calculateSimilarity()` and candidate lookup in `duplicateDetector.js` to assign 75 points for minor name spelling variations (such as *Jon Smith* vs *John Smith* or *John Smith* vs *John Smyth*), ensuring minor typos trigger duplicate flags even with `null` contact fields.
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
