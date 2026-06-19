# Printing Guidelines for Cibola2-Electron

Future agents working on print templates or print buttons in this application MUST adhere to these architectural standards.

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

---

## 4. Selection & Offline Validation
* Validate that a target printer is selected in the local settings before triggering print.
* Provide user feedback (via SnackBar toasts) if printing fails to enqueue, instead of failing silently.

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

## 8. Camera Capture & Jewelry Photography
* For taking photos of jewelry items (e.g., in Jobs or Customer details), do not write direct camera streaming or WebRTC logic in the views.
* Use the reusable dialog component [CameraCapture.vue](file:///c:/dev/Cibola2-Electron/src/components/CameraCapture.vue) which supports webcam permissions, multi-device video input selection (to support external USB macro/inspection scopes), center layout alignment masks, and base64 JPEG export.
* **Image Quality**: Photos captured from the webcam must be saved at the highest possible quality (using `canvas.toDataURL('image/jpeg', 1.0)`) rather than downscaling/compressing the quality to save space.

---

## 9. Customer Lookup & Two-Pronged Search
To avoid sending the entire customer list to the client while keeping search spelling-tolerant:
* **Backend Prefix Search**: `GET /customers?q=...` tokenizes the query and performs prefix & substring queries in SQLite (returning up to 100 candidate records).
* **Frontend Fuzzy Ranking**: The client uses `fuse.js` to fuzzy filter and rank this candidate list as the operator types.
* Do not bypass the candidate limit or query the entire directory for interactive lookups.

---

## 10. Global Tab-Navigation History (Back Button)
The application handles view routing via tab states instead of Vue Router to avoid file loading protocol constraints inside Electron:
* **Navigation Stack**: Store current and past active route states (objects with `tab` and `params`) in `sessionState.navigationHistory`.
* **Utility helpers**: Use `navigateTo(tab, params)` to transition to a tab with optional parameter values (e.g. `activeJobId`, `selectedCustomerId`). Use `navigateBack()` to pop the top route state and restore previous active properties.
* **Avoid Direct State Mutation**: Never mutate global parameters (such as `sessionState.selectedCustomerId = id`) directly for user-initiated transitions. Always invoke `navigateTo(tab, params)`. Directly mutating state without navigating causes the history syncing watcher to overwrite the parameters of the active parent route (e.g., directory lists) in-place.
* **Hoisting Watcher Helper Functions**: In components, when utilizing immediate watchers (`{ immediate: true }`) that depend on setup functions (like `fetchAssociatedHistory` or `fetchDirectory`), those functions **must** be defined above the watcher block in the `<script setup>` tag to prevent Temporal Dead Zone `ReferenceErrors`.
* **Global Back Button**: An arrow-left icon in `App.vue`'s app-bar binds to `navigateBack()` and renders only when `sessionState.navigationHistory.length > 1`.
* **Parameter Syncing**: A reactive watcher in [session.js](file:///c:/dev/Cibola2-Electron/src/store/session.js) automatically synchronizes parameter mutations (such as selecting/saving an entity) into the current history entry.
* **Persistent Directory State**: Directory search queries and pagination page numbers (e.g. `customerSearchQuery`, `jobCurrentPage`) are cached in `sessionState` so lists retain their scroll context when navigating back and forth across different sections.
---

## 11. Date and Timezone Handling
To ensure consistent dates across various timezone configurations:
* **Centralized Utility**: Always use formatting functions in [dates.js](file:///c:/dev/Cibola2-Electron/src/utils/dates.js) (e.g., `formatLocalDate(dateStr, formatType)`) to format dates for display, rather than writing custom parsing/formatting helpers in individual components.
* **Date-only values**: Fields representing calendar dates (e.g., `due_date`) are stored as `YYYY-MM-DD` strings in the SQLite database. When parsing or displaying these values, format them using local component extraction (e.g., splitting by `-` and constructing a date via `new Date(year, monthIndex, day)`) instead of using raw `new Date('YYYY-MM-DD')` which implicitly parses as UTC and causes off-by-one calendar day offsets in negative timezone offsets.
* **HTML5 Date Inputs**: Standard `<v-text-field type="date">` inputs strictly expect the value format `YYYY-MM-DD`. Ensure all values loaded into these inputs from the database are normalized to strip time suffixes (e.g., splitting by space or `'T'`).
* **Timestamp values**: Database created/updated timestamps are saved as UTC string format `YYYY-MM-DD HH:mm:ss`. Normalize them to ISO format (replacing space with `'T'` and appending `'Z'`) before using the Javascript `Date` constructor to guarantee they convert correctly to the client's local timezone.

---

## 12. Drag and Drop Image Uploads
For uploading jewelry or transaction images:
* **Reusable Component**: Always use [ImageDropzone.vue](file:///C:/dev/Cibola2-Electron/src/components/ImageDropzone.vue) for file input and drag-and-drop targets rather than writing custom file drop listeners.
* **Layout Modes**: The component supports two layout modes via props:
  * `:compact="true"`: Renders as a compact square tile, designed to be embedded directly inside a `v-row` grid as the first slot to add more items.
  * `:compact="false"` (default): Renders as a full-width dropzone card, designed to fill empty states.
* **Output Format**: Listen to the `@upload` event, which fires with the base64 JPEG/PNG/WEBP Data URL string representing the loaded image. Use this in exactly the same way as the `@capture` event from the camera component.

---

## 13. Reusable Attached Image Gallery Component
When implementing forms that require uploading or photographing jewelry items (such as credits or custom jobs):
* **Reusable Component**: Always use [AttachedImages.vue](file:///C:/dev/Cibola2-Electron/src/components/AttachedImages.vue) instead of writing inline image grids, lightbox dialogs, delete confirmation overlays, or camera capture triggers.
* **Component Usage**:
  ```html
  <AttachedImages
    ref="attachedImagesRef"
    v-model="job.job_images"
    delete-endpoint="/jobs/images"
    title="Attached Jewelry Photos"
  />
  ```
* **Camera Capture Integration**: If you need to trigger webcam capturing from a button in a parent component (like a footer actions toolbar), define a ref on `<AttachedImages>` and call its exposed `openCamera()` method:
  ```javascript
  attachedImagesRef.value.openCamera()
  ```
* **Props**:
  * `v-model` (`modelValue`): Array of images `{ id: number | null, image: string, note: string }`.
  * `delete-endpoint`: Base API endpoint for database image deletion (e.g. `/jobs/images`).
  * `title`: Optional custom heading text (defaults to `'Attached Jewelry Photos'`).

---

## 14. Reusable Directory Pagination
* **Reusable Component**: Always use [DirectoryPagination.vue](file:///C:/dev/Cibola2-Electron/src/components/DirectoryPagination.vue) to render pagination bars at the bottom of data directories or listings.
* **Component Usage**:
  ```html
  <DirectoryPagination
    v-model="currentPage"
    :total-items="filteredJobs.length"
    :items-per-page="itemsPerPage"
  />
  ```
* **Performance Check**: Use pagination whenever rendering long listing tables (like Customer Directory or Jobs Directory) to avoid performance lag when data volumes grow.

---

## 15. Generic Delete Confirmation Dialogue
* **Reusable Component**: Always use [DeleteConfirmationDialog.vue](file:///C:/dev/Cibola2-Electron/src/components/DeleteConfirmationDialog.vue) when executing permanent or cascading record deletions.
* **Features**:
  * **Input Matching**: Pass `confirm-text-key` to force the operator to type a validation string (like the customer's last name) to enable the delete button.
  * **Checkbox Validation**: Pass `checkbox-label` to require checking a safety acknowledgement checkbox.
* **Component Usage**:
  ```html
  <DeleteConfirmationDialog
    v-model="deleteDialog"
    title="Confirm Deletion"
    warning-message="Are you sure you want to delete this record? This is permanent."
    :confirm-text-key="customer.lname"
    confirm-text-placeholder="Type customer's Last Name to confirm"
    checkbox-label="I understand this cannot be undone"
    :loading="loading"
    @confirm="submitDelete"
  ```

---

## 16. Base64 Asset Embedding in Headless Print Windows
For static assets (such as `logo.png`) that need to render inside the headless print BrowserWindow:
* **Avoid Local File Paths**: Do not use local paths (`file://...`) or relative paths (such as `/logo.png`) in the HTML `src` attributes. Because the print layout is loaded via a sandboxed `data:text/html` URL, the Chromium engine blocks local resource loading due to same-origin policies.
* **Inline Base64 Encoding**: Convert static print assets into base64 Data URLs and export them from dedicated utility modules (such as [logo.js](file:///c:/dev/Cibola2-Electron/src/utils/logo.js)). Import them into form components and embed them directly inside the print HTML string as inline image data.

---

## 17. Reusable Metal Spot Prices Card
For displaying and updating market metal prices (Gold, Platinum, Silver):
* **Reusable Component**: Always use [MetalPricesCard.vue](file:///c:/dev/Cibola2-Electron/src/components/MetalPricesCard.vue) rather than duplicating spot price listings or sync trigger buttons.
* **Display Modes**:
  * **Large Mode (Default)**: A complete, self-contained dashboard/settings card that displays side-by-side spot prices for Gold/Platinum and an expandable row for Silver. Supports manual editing and auto-syncs every 15 minutes.
  * **Small Mode (`small` prop)**: A compact layout designed for embedding inside transactional forms (e.g. `CreditForm.vue`). Uses double data bindings (`v-model:gold`, `v-model:platinum`, `v-model:date`), checks for price staleness (>24 hours), and updates parent values reactively when syncs complete.
* **Sync and Edit protocols**:
  * Syncing calls the backend `/values/sync` route to pull live spot prices from the market.
  * Manual editing is done inline, validating for positive decimal inputs.
  * Both actions trigger `refreshMetadata()` to synchronize the global metadata cache.
  * On mount in Large Mode, the component automatically checks if the prices are more than 15 minutes old (or missing) and triggers a sync if online. Small mode bypasses this automatic sync to avoid overriding existing saved transaction prices.
* **Transactional Form Integration**:
  * Always bind the `:disabled` prop (e.g., `:disabled="disabled"` where `disabled` is true for already saved records) to prevent syncing or editing historical transaction prices.
  * The transactional form should watch `metadataState.metalPrices` to reactively update default spot prices and dates for *new* records if they haven't been manually edited.
  * The form must watch the transaction's spot price fields and trigger a recalculation of all line item values and grand totals when the spot prices change (due to sync, manual overrides, or metadata updates).
* **Offline Handling**: The component monitors `sessionState.connectionStatus` and automatically disables sync and save buttons if the server is offline, displaying a visual alert context warning.

---

## 18. Global Toast Notification System (Unified Snackbar)
To keep user feedback notifications consistent and avoid cluttering views with duplicate snackbar structures:
* **Centralized Store**: The application uses a single global `<v-snackbar>` in `App.vue` that binds to the reactive `toastState` and `showToast` helper from [toast.js](file:///c:/dev/Cibola2-Electron/src/store/toast.js).
* **Usage**:
  * Import `showToast` from `../store/toast` (or the appropriate relative path to the store).
  * Call `showToast('Message text', 'success' | 'error' | 'warning' | 'info')` to trigger a non-blocking toast.
* **No Local Snackbars or Alerts**:
  * Do not define local `<v-snackbar>` markup or local reactive notification variables in individual form or listing components.
  * Avoid native `alert()` popups for user validation warnings or API failures. Route them through `showToast` instead.



