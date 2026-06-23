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

* **[CameraCapture.vue](file:///c:/dev/Cibola2-Electron/src/components/CameraCapture.vue)**: Handles webcam permissions, multi-device selection, alignment masks, exports base64 JPEG at maximum resolution (`canvas.toDataURL('image/jpeg', 1.0)`), and defaults the camera light/torch to ON with an interactive UI toggle and fallback constraints for compatibility with older camera hardware.
* **[ImageDropzone.vue](file:///C:/dev/Cibola2-Electron/src/components/ImageDropzone.vue)**: Supports drag-and-drop or file input uploads, emitting the base64 data URL. Supports `:compact` mode for grid embedding.
* **[AttachedImages.vue](file:///C:/dev/Cibola2-Electron/src/components/AttachedImages.vue)**: Embedded image gallery with lightboxes, description note inputs, camera/upload triggers, and database delete capabilities.
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

## 16. Server Address Initialization & Startup Request Guarding
* **Guarding Requests Until Settings Load**: To prevent sending network requests (e.g., fetching metadata) to the default port (`localhost:8000`) before settings are retrieved from Electron IPC, all API client calls must wait for settings initialization.
* **API Client Delay**: The client wrapper in [api.js](file:///c:/dev/Cibola2-Electron/src/utils/api.js) automatically awaits `settingsState.isLoaded = true` using a Vue reactive watcher before resolving request URLs.
* **Heartbeat Watcher Guard**: Any watchers on `settingsState.serverURL` in `App.vue` that trigger `startHeartbeat` must be guarded with `settingsState.isLoaded` to avoid triggering connection attempts or preflight checks against default ports on startup.


