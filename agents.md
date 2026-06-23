# Printing Guidelines and Architectural Standards for Cibola2-Electron

Future agents working on this application MUST adhere to these architectural standards and guidelines.

---

## 1. IPC Printing Protocol (No Deprecated `@electron/remote`)
Never use the deprecated `@electron/remote` module or `remote.getCurrentWindow()` to invoke printing directly from renderer code. Instead, always use the secure Electron Context Isolation IPC protocol:
* **Preload API**: `window.electronAPI.printDocument(printerName, type, data)`
* **Main Process**: Handles the print queue in `electron/main.js` via `ipcMain.handle('print-document')`.

---

## 2. Hidden Window Print Pattern (No Inline DOM Pollution)
To print documents, do not pollute the primary application views (like `JobForm.vue`) with print-only elements hidden via `@media print`. Instead, use the **Headless Print Window** pattern:
1. When printing is requested, the Main Process creates a temporary hidden `BrowserWindow`:
   ```javascript
   const printWindow = new BrowserWindow({
     show: false,
     webPreferences: {
       preload: path.join(__dirname, 'preload.mjs')
     }
   })
   ```
2. Load a dedicated print template/HTML file (e.g., `dist/print-template.html` or a specific route).
3. Once loaded, send the job/receipt data to that window, wait for rendering, and execute `printWindow.webContents.print(...)`.
4. Close and destroy the print window immediately after completion.

---

## 3. Printer Configuration Options
POS thermal printers and ticket printers are highly sensitive to print margins and styling options. Use these settings inside `webContents.print()`:
* `silent: true` (Skip the native dialog for fast POS execution).
* `printBackground: true` (Ensure colors, borders, and barcodes render).
* `deviceName: printerName` (Target the configured system printer).
* `margins: { marginType: 'none' }` (Prevents text clipping and excessive paper rolling).
* **Validation**: Validate that a target printer is selected in the local settings before triggering print. Provide user feedback (via SnackBar toasts) if printing fails to enqueue, instead of failing silently.

---

## 4. Base64 Asset Embedding in Headless Print Windows
For static assets (such as `logo.png`) that need to render inside the headless print BrowserWindow:
* **Avoid Local File Paths**: Do not use local paths (`file://...`) or relative paths (such as `/logo.png`) in the HTML `src` attributes. Because the print layout is loaded via a sandboxed `data:text/html` URL, the Chromium engine blocks local resource loading due to same-origin policies.
* **Inline Base64 Encoding**: Convert static print assets into base64 Data URLs and export them from dedicated utility modules (such as [logo.js](file:///c:/dev/Cibola2-Electron/src/utils/logo.js)). Import them into form components and embed them directly inside the print HTML string as inline image data.
* **Print Template Separation**: Keep component files clean and modular by moving print HTML templates and associated styling into separate utility modules under `src/utils/` (e.g., [jobPrintTemplate.js](file:///c:/dev/Cibola2-Electron/src/utils/jobPrintTemplate.js), [creditPrintTemplate.js](file:///c:/dev/Cibola2-Electron/src/utils/creditPrintTemplate.js), and [customSheetPrintTemplate.js](file:///c:/dev/Cibola2-Electron/src/utils/customSheetPrintTemplate.js)). The template function should accept plain parameters (`job`, `customer`, `activeEmployees`) to avoid directly accessing Vue reactive state/refs, and handle base64 assets and server URLs internally.

---

## 5. Shared State & Cache Management (No Pinia)
To keep the application lightweight and simple for a small-scale single terminal setup, do not introduce state libraries like Pinia or Vuex. Instead:
* Use standard importable Vue 3 `reactive` store modules in `src/store/` (e.g., [settings.js](file:///c:/dev/Cibola2-Electron/src/store/settings.js), [session.js](file:///c:/dev/Cibola2-Electron/src/store/session.js), and [metadata.js](file:///c:/dev/Cibola2-Electron/src/store/metadata.js)).
* **Cache DB configurations**: Configuration and lookup lists (like active employees, custom sheets, spot metal prices) should be cached once in `metadataState` when a network connection is established, rather than fetched on every page navigation.

---

## 6. Offline Connection Monitoring & Resilience
* **Network Status Heartbeat**: The app runs a periodic heartbeat check in `session.js` targeting the configured server URL.
* **API Error Integration**: The API client wrapper in [api.js](file:///c:/dev/Cibola2-Electron/src/utils/api.js) automatically sets `sessionState.connectionStatus = 'offline'` when network requests fail, and `'connected'` when they succeed.
* **Global Visibility**: A visual warning banner [ConnectionBanner.vue](file:///c:/dev/Cibola2-Electron/src/components/ConnectionBanner.vue) is displayed at the top of the viewport when offline. Always check `sessionState.connectionStatus === 'offline'` to inform operators that save actions will fail when offline.

---

## 7. Centralized Calculations
* Keep mathematical formulas and financial calculations (like gold credit buy-back pricing or custom sheet estimates) in [pricing.js](file:///c:/dev/Cibola2-Electron/src/utils/pricing.js).
* Never duplicate estimation or price calculation logic within individual UI page components to prevent mathematical discrepancy.

---

## 8. Date and Timezone Handling
To ensure consistent dates across various timezone configurations:
* **Centralized Utility**: Always use formatting functions in [dates.js](file:///c:/dev/Cibola2-Electron/src/utils/dates.js) (e.g., `formatLocalDate(dateStr, formatType)`) to format dates for display, rather than writing custom parsing/formatting helpers in individual components.
* **Date-only values**: Fields representing calendar dates (e.g., `due_date`) are stored as `YYYY-MM-DD` strings in the SQLite database. When parsing or displaying these values, format them using local component extraction (e.g., splitting by `-` and constructing a date via `new Date(year, monthIndex, day)`) instead of using raw `new Date('YYYY-MM-DD')` which implicitly parses as UTC and causes off-by-one calendar day offsets in negative timezone offsets.
* **HTML5 Date Inputs**: Standard `<v-text-field type="date">` inputs strictly expect the value format `YYYY-MM-DD`. Ensure all values loaded into these inputs from the database are normalized to strip time suffixes (e.g., splitting by space or `'T'`). To align with UI consistency, hide Chrome's native right-aligned calendar picker indicator via CSS (setting `display: none` on `::-webkit-calendar-picker-indicator`), style the text field with `prepend-inner-icon="mdi-calendar"`, and use programmatic `showPicker()` on the underlying `<input>` element when clicking the prepend icon or the text field to trigger the native calendar popup.
* **Timestamp values**: Database created/updated timestamps are saved as UTC string format `YYYY-MM-DD HH:mm:ss`. Normalize them to ISO format (replacing space with `'T'` and appending `'Z'`) before using the Javascript `Date` constructor to guarantee they convert correctly to the client's local timezone.

---

## 9. Global Tab-Navigation History (Back Button)
The application handles view routing via tab states instead of Vue Router to avoid file loading protocol constraints inside Electron:
* **Navigation Stack**: Store current and past active route states (objects with `tab` and `params`) in `sessionState.navigationHistory`.
* **Utility helpers**: Use `navigateTo(tab, params)` to transition to a tab with optional parameter values (e.g. `activeJobId`, `selectedCustomerId`). Use `navigateBack()` to pop the top route state and restore previous active properties.
* **Avoid Direct State Mutation**: Never mutate global parameters (such as `sessionState.selectedCustomerId = id`) directly for user-initiated transitions. Always invoke `navigateTo(tab, params)`. Directly mutating state without navigating causes the history syncing watcher to overwrite the parameters of the active parent route (e.g., directory lists) in-place.
* **Hoisting Watcher Helper Functions**: In components, when utilizing immediate watchers (`{ immediate: true }`) that depend on setup functions (like `fetchAssociatedHistory` or `fetchDirectory`), those functions **must** be defined above the watcher block in the `<script setup>` tag to prevent Temporal Dead Zone `ReferenceErrors`.
* **Global Back and Forward Buttons**: Arrow-left and arrow-right icons in `App.vue`'s app-bar bind to `navigateBack()` and `navigateForward()` respectively. They are present on all views (including the Dashboard) to maintain layout alignment and prevent title shifting, but are disabled when no history is available.
* **Parameter Syncing**: A reactive watcher in [session.js](file:///c:/dev/Cibola2-Electron/src/store/session.js) automatically synchronizes parameter mutations (such as selecting/saving an entity) into the current history entry.
* **Persistent Directory State**: Directory search queries and pagination page numbers (e.g. `customerSearchQuery`, `jobCurrentPage`) are cached in `sessionState` so lists retain their scroll context when navigating back and forth across different sections.
* **Mouse Back/Forward Button Support**: The main process listens to Electron's `'app-command'` events (`browser-backward` and `browser-forward`) and forwards them via IPC. `App.vue` subscribes to these and calls `navigateBack()` / `navigateForward()`. A DOM `mouseup` listener (capturing phase) is used as a fallback for browser/development environments. Both listeners are active, and the actions are throttled (300ms) to prevent duplicate triggers from firing twice for a single click.

---

## 10. Customer Lookup & Two-Pronged Search
To avoid sending the entire customer list to the client while keeping search spelling-tolerant:
* **Backend Prefix Search**: `GET /customers?q=...` tokenizes the query and performs prefix & substring queries in SQLite (returning up to 100 candidate records).
* **Frontend Fuzzy Ranking**: The client uses `fuse.js` to fuzzy filter and rank this candidate list as the operator types.
* Do not bypass the candidate limit or query the entire directory for interactive lookups.

---

## 11. Directory Column Sorting Guidelines
For manager directories (Jobs, Credits, Custom Sheets, Customers):
* **Default Sort**: Always default to sorting by record creation date descending (`created_at` descending, i.e., `sortBy = 'created_at'`, `sortDesc = true`) to surface the newest records first.
* **Sortable Columns**: Enable sorting by clicking headers for **Customer Name** (and **Record Created Date** or **Last Active** / **Name**).
* **Hover Interaction**: Apply the `.sortable-header` class to enable interactive cursor-pointer styles and background highlights on hover. Show the sorting chevron indicator (`mdi-chevron-down` or `mdi-chevron-up`) only when the corresponding column is active.
* **Pagination Reset**: Always reset the directory's active page back to 1 (`currentPage.value = 1`) when toggling or switching sorting columns.

---

## 12. Global Toast Notification System (Unified Snackbar)
To keep user feedback notifications consistent and avoid cluttering views with duplicate snackbar structures:
* **Centralized Store**: The application uses a single global `<v-snackbar>` in `App.vue` that binds to the reactive `toastState` and `showToast` helper from [toast.js](file:///c:/dev/Cibola2-Electron/src/store/toast.js).
* **Usage**: Import `showToast` from the store and call `showToast('Message text', 'success' | 'error' | 'warning' | 'info')`.
* **No Local Snackbars or Alerts**: Do not define local `<v-snackbar>` markup or use native `alert()` popups.

---

## 13. Reusable UI Components
Always reuse these core components rather than rebuilding their functionality:

* **[CameraCapture.vue](file:///c:/dev/Cibola2-Electron/src/components/CameraCapture.vue)**: Handles webcam permissions, multi-device selection, alignment masks, exports base64 JPEG at maximum resolution (`canvas.toDataURL('image/jpeg', 1.0)`), and defaults the camera light/torch to ON with an interactive UI toggle and fallback constraints. Pre-queries devices list on mount to bypass permission checks on opening, and utilizes a 10-second cool-down window to keep the stream warm when closing and quickly reopening the dialog.
* **[ImageDropzone.vue](file:///C:/dev/Cibola2-Electron/src/components/ImageDropzone.vue)**: Supports drag-and-drop or file input uploads, emitting the base64 data URL. Supports `:compact` mode for grid embedding.
* **[AttachedImages.vue](file:///C:/dev/Cibola2-Electron/src/components/AttachedImages.vue)**: Embedded image gallery with lightboxes, description note inputs, camera/upload triggers, and database delete capabilities. Supports `disable-add` prop (boolean) to hide the upload/capture dropzone tile and prevent new image additions.
* **[UnifiedRecordTable.vue](file:///c:/dev/Cibola2-Electron/src/components/UnifiedRecordTable.vue)**: Reusable list rendering table. Used on the Dashboard (Recent lists) and Customer Manager (Unified History tab) to display record listings with support for type colors, left border highlights, job thumbnails/fallback icons, sorting logic, and custom empty/loading states.
* **[DirectoryPagination.vue](file:///C:/dev/Cibola2-Electron/src/components/DirectoryPagination.vue)**: Handles paginating tabular views and search pages.
* **[DeleteConfirmationDialog.vue](file:///C:/dev/Cibola2-Electron/src/components/DeleteConfirmationDialog.vue)**: Confirmation dialog requiring match validation keys (e.g. typing customer last name) and checkbox acknowledgement.
* **[MetalPricesCard.vue](file:///c:/dev/Cibola2-Electron/src/components/MetalPricesCard.vue)**: Used in Large mode (dashboard) or `small` mode (transactional forms). Handles spot syncs, manual overrides, price staleness, and database metadata updates. Disable state must be bound on historical items.
* **[FormBottomNavigation.vue](file:///c:/dev/Cibola2-Electron/src/components/FormBottomNavigation.vue)**: Shared bottom bar action layout for all forms. Always add `pb-20` class (80px bottom padding) to the parent form wrapper to avoid content coverage.

---

## 14. Single-Instance Application Lock
To prevent multiple instances of the application from running simultaneously (which could result in database lock or session sync issues):
* **Single Instance Check**: The main process executes `app.requestSingleInstanceLock()`.
* **Early Exit**: If a second instance attempts to run, `app.quit()` is invoked immediately.
* **Focus Existing Instance**: The `second-instance` event is registered to restore and focus the primary application window (`win`) whenever a second instance launch is attempted.

---

## 15. Customer Note Alerts & Unsaved Safeguards
* **Active Notes Alert Banner**: If a customer has a note stored in the database, `CustomerForm.vue` displays a pulsing warning banner (`pulsing-alert` class) above the customer info to highlight critical instructions.
* **Explicit Save/Discard Buttons**: When editing notes, auto-save on blur is disabled. A sub-toolbar with **Save Note** and **Discard** buttons is rendered directly under the textarea when modifications are made.
* **Parent Save Prevention Block**: `CustomerForm.vue` emits `@dirty-state-change` when the customer note has unsaved changes or if the customer profile is in edit mode. Parent form components (e.g., `JobForm.vue`, `CreditForm.vue`, `CustomSheetForm.vue`) must listen to this event, disable their save and print actions in `FormBottomNavigation`, and throw warning toasts if save attempts occur while customer information is dirty.

---

## 16. Global Notifications & Periodic Version Updates
* **Centralized Store**: To ensure consistency and state persistence across page unmounts/navigation, notifications and updater properties (status, error, latest version, download progress) are maintained in a unified reactive store at [notifications.js](file:///c:/dev/Cibola2-Electron/src/store/notifications.js).
* **Automatic Background Checks**: Check for updates immediately upon application startup (after a 5-second delay) and repeat the check automatically every 30 minutes.
* **10-Second Timeout Constraint**: Checking for updates utilizes a 10-second `Promise.race` timeout on the `window.electronAPI.checkForUpdate()` call to avoid infinite spinning states in development or slow connectivity environments.
* **Resolve Fallback**: In unpacked development mode, `electron-updater` skips checking and resolves successfully without emitting `update-available` or `update-not-available` events. To prevent hanging on `"checking"`, if the IPC call resolves successfully and the status is still `'checking'`, transition it to `'not-available'`.
* **Notification Activator Behavior**: The notifications dropdown menu and its activator (the bell icon button in the top right app-bar) should be hidden entirely if there are no notifications in `notificationsState.list` to prevent UI clutter.
* **Click Actions**: Clicking a notification should automatically route the user to the corresponding view (e.g., config for update alerts) and dismiss the notification from the list.

---
## 17. Core Record Color Theming Protocol
To help operators scan information rapidly, the application maps each of the 4 core record types to a specific jewel/mineral color theme in both light and dark mode configurations:
* **Customer**: Amethyst Purple (`customer` theme color key)
* **Job**: Cobalt Blue (`job` theme color key)
* **Credit**: Amber Gold (`credit` theme color key)
* **Custom Sheet**: Emerald Green (`sheet` theme color key)

### Theming Highlights Layout
The color themes are applied permanently throughout the application using:
1. **Header Highlights**: Form and Directory header backgrounds are unified to use the standard primary branding blue (`bg-primary`). This matches the application's logo/header font branding and maintains clean, consistent card wrappers.
2. **Left Accent Border Highlight**: List and Directory table rows display a left-accented colored border highlighting using the `.record-accent-[type]` class. Loaded customer profiles in `CustomerForm.vue` adopt this left-accented border highlight on their container card.
3. **Record Type & Icon Highlights**: Mapped Record Type text labels (e.g., in lists) and type icons adopt the jewel colors. ID numbers remain standard gray.
4. **Action Highlights**: Quick action buttons for creating new records adopt their corresponding jewel themes (`job`, `credit`, `sheet`, `customer`).
### CSS & Custom Theme Classes
* Dynamic color classes like `text-[type]` (e.g., `text-job`, `text-credit`, `text-sheet`, `text-customer`) and `bg-[type]` are generated automatically by Vuetify based on the active theme's colors configured in `src/main.js`.
* Always use these theme classes instead of hardcoded hex values or Tailwind styling to maintain responsiveness to theme mode (light/dark) switches.
* Table rows with left borders should combine `.record-accent-[type]` and `.accent-border-row` to properly align contents.

---
## 18. Customer Activity Summary (Counts)
When the customer card is rendered at the top of record views (`JobForm.vue`, `CreditForm.vue`, `CustomSheetForm.vue`), it passes the `show-activity` prop to `CustomerForm.vue`.
* **Dynamic Grid Layout**: The `CustomerForm.vue` template dynamically adapts the medium-size viewport (`md`) grid columns:
  * Details column: `:md="showActivity ? (hideNotes ? 6 : 4) : (hideNotes ? 12 : 6)"`
  * Activity column: `:md="hideNotes ? 6 : 4" v-if="showActivity"`
  * Notes column: `:md="showActivity ? 4 : 6" v-if="!hideNotes"`
* **Record Counts Mapping**: The component maps `job_count`, `credit_count`, and `custom_sheet_count` from the backend `GET /customers/:id` response, defaulting to `0` if not present.
* **Preservation on Save**: When executing customer profile edits, the local state counts are explicitly preserved to prevent them from being overwritten if the update response does not return counts.

---
## 19. Non-Existent Record Navigation & Recovery Protocol
When an operator attempts to navigate to a record (Job, Credit, Custom Sheet, Customer) that does not exist in the database (e.g. clicking on a deleted entry from Recently Viewed history):
* **User Feedback**: Display a clear error toast indicating the load failure using `showToast('Failed to load ...', 'error')`.
* **History Cleanup**: Proactively call `removeRecentRecord(type, id)` from `src/store/recentlyViewed.js` to purge the deleted record from the operator's Recently Viewed list.
* **Auto-Navigation Recovery**: Redirect the user away from the empty, half-loaded view immediately by calling `navigateBack()`.
* **Sub-Form Loading Warnings**: In components containing nested lookups (e.g., job forms trying to load details of a customer), failures to load secondary linked models must display a warning toast to notify the operator instead of failing silently.

---
## 20. Admin Panel & Sub-component Refactoring Layout
To keep the Admin settings component clean and maintainable, the local parameters, employee directories, and configuration settings are separated into dedicated subcomponents:
* **Admin Layout Shell**: [Admin.vue](file:///c:/dev/Cibola2-Electron/src/components/Admin.vue) implements a left-aligned sidebar `.admin-sidebar` side-by-side with the content window using CSS flexbox. It displays a navigation list of settings modules: Local Settings, Employees, and Custom Values.
* **Custom Values Grouping**: The three custom values sections (Custom Sheets, Sheet Categories, Gold Credits) are structured as flat, non-collapsible sub-items under a `<v-list-subheader>` to keep them visible at all times, with less indentation (`pl-4`).
* **Dedicated Sub-Components**: All content pages are extracted into individual files under `src/components/admin/`:
  * [LocalSettingsAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/LocalSettingsAdmin.vue): Local parameters (network connection URL, camera configuration, printer routing, and update triggers).
  * [EmployeesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/EmployeesAdmin.vue): Store employee directory table, profile editor, active status toggles, and deletion confirmation dialog.
  * [CustomValuesAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/CustomValuesAdmin.vue): Unified configurations table. It accepts a `section` prop from `Admin.vue` to determine which dynamic table configuration to mount (Custom Sheets, Categories, or Gold Credits multipliers). All database lookup loading and inline table status tools (mark pending, save on blur, up/down category order movements) are self-contained here.

---
## 21. Application Versioning Configuration
To update the version of the application:
1. **Electron Client**: Update the `"version"` field in the client [package.json](file:///c:/dev/Cibola2-Electron/package.json) and [package-lock.json](file:///c:/dev/Cibola2-Electron/package-lock.json).
2. **Backend Server**: Update the `"version"` field in the backend [package.json](file:///c:/dev/cibola2/package.json) and [package-lock.json](file:///c:/dev/cibola2/package-lock.json).

> [!NOTE]
> The renderer fallback version in [LocalSettingsAdmin.vue](file:///c:/dev/Cibola2-Electron/src/components/admin/LocalSettingsAdmin.vue) and the update simulation logic in [notifications.js](file:///c:/dev/Cibola2-Electron/src/store/notifications.js) import and resolve client version parameters dynamically from `package.json` at build time. No manual changes are required in those components.





