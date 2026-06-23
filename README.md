# Cibola2-Electron

Frontend for the Cibola2 application, built with Electron, Vue 3, and Vuetify.

---

# Developer Reference & Feature Specifications

This section documents detailed specifications, UI schemas, data flows, and configuration details for the Cibola2-Electron application.

## 1. Custom Values Configuration (Admin.vue)
Custom configurations are stored in the global `values` database table and categorized using `type_id` values:
* `type_id = 1`: Gold Credits
* `type_id = 2`: Metal Spot Prices
* `type_id = 3`: Custom Sheet values (displays Name, Category combobox, Base Price, Metal Type, Markup, and Default Quantity; Formula and Order columns are hidden).
* `type_id = 4`: Custom Sheet Categories (displays Category Name and display Order, and provides up/down arrow buttons to easily reorder categories and automatically update order values on the backend).

### Auto-Save Protocol
To simplify interaction, manual save buttons are omitted from the Admin tables. Changes are automatically saved to the database upon:
* The `@blur` event for text fields.
* Selection or change events on comboboxes.
* Reactive `@update:model-value` toggles on active/inactive switches.

### Save Status Indicator
A cloud status icon is shown next to the Delete button to indicate state:
* **Pending** (Amber / `mdi-cloud-upload-outline`): Changes made but not yet saved (blur a field to commit).
* **Saving** (Blue / `mdi-cloud-sync-outline`): Save request is actively in-flight.
* **Saved** (Green / `mdi-check-circle-outline`): Save succeeded (held for exactly 3 seconds to avoid rapid flashing).
* **Synced** (Grey / `mdi-cloud-check-outline`): Standard resting state (no pending edits).

### Dedicated Active Columns
The active/inactive `v-switch` is located in a dedicated "Active" column header to the left of "Actions". The "Actions" column contains only the status indicator and the full outlined "Delete" button.

### Inactive Record Filtering & Deactivation Visibility
Inactive employees, custom sheet values, and custom sheet categories can be dynamically hidden in the lists using local "Hide Inactive" checkboxes. To prevent disorientation when an active item is toggled to inactive, a temporary visibility flag (`justDeactivated`) keeps the record visible until the tab is switched, the component is refreshed, or the checkbox is cycled off and on. This is handled via computed lists (`filteredEmployees`, `filteredCustomSheets`, and `filteredCustomSheetCategories`).

### Category Reordering Under Filters
When reordering categories with `moveCategory(item, direction)` while inactive categories are hidden, the swap operation finds the adjacent visible item from the filtered list, swaps their positions in the main categories list, and updates order numbers sequentially.

### Performance Optimization (No Tab Animations)
To avoid interface lag and maintain fast view switching when loading values tables, all sliding and opacity transition animations on `<v-window-item>` elements are disabled. Always include `:transition="false"` and `:reverse-transition="false"` props on configuration windows, and do not introduce custom CSS transitions that slow down DOM updates.

---

## 2. Collapsible Navigation Sidebar (Rail Mode)
* **Collapse Mechanism**: The navigation sidebar behaves as a collapsible rail. Instead of fully hiding the sidebar, it shrinks to show only the navigation icons and allow for direct navigation.
* **State Control**: The sidebar's state is managed using the reactive reference `isRail` in `App.vue`, which is bound to the `v-model:rail` property of the `v-navigation-drawer`. The drawer has the `permanent` prop so that it is never fully hidden.
* **Toggle Buttons**:
  1. A chevron toggle button is located at the bottom of the navigation drawer (defined in the `append` slot of `v-navigation-drawer`). To align the divider above this button with the top of the `FormBottomNavigation` component, the append container (`.drawer-append`) is set to `64px` in height with the `v-divider` at the top and the collapse list vertically centered via flex utilities.
  2. The app-bar menu icon (`v-app-bar-nav-icon`) also toggles the `isRail` state.
* **Layout Adjustments**:
  * The top logo list item uses a dynamic class `:class="isRail ? 'px-2 py-4' : 'pa-4'"` to align the avatar nicely in both expanded and collapsed (rail) states.

---

## 3. Unified Customer History and Records List
When rendering related historical records (Jobs, Credits, and Custom Sheets) under a selected customer profile (e.g., in `CustomerManager.vue`):
* **No Tab Navigation**: Related records are combined into a single unified table list.
* **Column Setup & Order**:
  1. **Id**: prefixed with `#` (header label `Id`).
  2. **Record Type**: displays `Job`, `Credit`, or `Custom Sheet` (header label `Record Type`).
  3. **Details**: custom rendered details based on the item type (header label `Details`).
  4. **Created**: displays the formatted local creation date (header label `Created`).
* **Details Column Formatting**:
  * **Jobs**: Display only the estimate. If the estimate is 0 or missing, display `'No Estimate'`. Do not display the job's due date in this list.
  * **Credits**: Display the payout amount. If the credit value is 0 or missing, display `'No Final Credit'`.
  * **Custom Sheets**: Display the custom design sheet's name.

---

## 4. Recently Viewed Records Dashboard Component
* **Reactive Store**: The global recently viewed records state and tracking are managed in `src/store/recentlyViewed.js`.
* **Automatic Tracking**: The store contains a reactive watcher that monitors `sessionState` parameter changes (`activeTab`, `selectedCustomerId`, `activeJobId`, `activeCreditId`, `activeSheetId`). Whenever a valid, saved record is opened (ID > 0) in its respective tab, the store automatically fetches the record's details (using `api.get`) and adds or moves it to the top of the history list.
* **LocalStorage Persistence**: The history is automatically saved to and loaded from `localStorage` under the key `recently_viewed_records` so it persists across reloads/restarts.
* **Details and Formats**: The cached recently viewed records match the fields and logic of `CustomerManager.vue` related records list:
  * `id`: Record ID.
  * `type`: `'job' | 'credit' | 'sheet' | 'customer'`.
  * `typeName`: Display name of the type.
  * `details`:
    * Jobs: `Estimate: $XX.XX` (or `'No Estimate'`).
    * Credits: `Payout: $XX.XX` (or `'No Final Credit'`).
    * Custom Sheets: Custom sheet name.
    * Customers: Customer's full name.
  * `customerName`: Customer's full name (for jobs, credits, sheets).
  * `thumbnail`: For jobs, a path to the first attached image (or `null` if none) to render a 36x36 thumbnail.
  * `created_at`: The creation date of the record.
* **Component Rendering**: Render the `<RecentlyViewed />` widget from `RecentlyViewed.vue` on the dashboard. The table columns must be in this order:
  1. **Preview**: 36x36 cover image of the job thumbnail, or a type-colored avatar displaying the type-specific icon if no thumbnail image exists.
  2. **Type**: Displays the type name text (e.g. Job, Credit, Customer, Custom Sheet).
  3. **Record**: Displays the record ID (prefixed with `#`).
  4. **Details**: Custom rendered details for each item.
  5. **Created**: Displays the formatted local creation date.
* **Save/Update Hook**: Whenever a record is saved or updated, call `refreshRecentRecord(type, id)` to fetch the latest details and update the history cache.

---

## 5. Recently Created Records Dashboard Component
* **Component File**: [RecentlyCreated.vue](file:///c:/dev/Cibola2-Electron/src/components/RecentlyCreated.vue)
* **API Invocations**: Fetches the newest records from the backend (`GET /jobs`, `GET /goldcredits`, `GET /customsheets`, `GET /customers`), normalizes them into a unified format, combines them, sorts by `created_at` descending, and slices the top 10.
* **Thumbnail Loading**: For any `job` in the top 10, a nested request is sent to `GET /jobs/:id` to pull full details and populate `thumbnail` with the first attached image (if any).
* **Auto-Refresh**: Automatically refreshes its database records list every 5 minutes on mount. The interval is cleared on unmount.
* **Manual Refresh**: Includes a refresh icon button in the header that triggers `fetchRecords` on click and displays a loading spinner.

---

## 6. User Feedback Integration
* **API Endpoint**: `POST /feedback` (e.g. `http://localhost:8000/feedback`).
* **Request Payload**:
  * `message`: The text description entered by the user (required).
  * `type`: Category (`'Bug Report' | 'Feature Request' | 'General Suggestion' | 'Other'`).
  * `employeeName`: The name of the selected employee (defaults to `'Unassigned'`).
  * `page`: Deserialized friendly name or active state context resolved dynamically from `sessionState.activeTab` and active params (e.g., `'Job Form (ID: 15)'`, `'Customers Directory'`).
* **Trigger Button**: Implemented as a message icon button (`mdi-comment-text-outline`) in the top-right of the application app-bar next to notification and display/theme mode toggles in [App.vue](file:///c:/dev/Cibola2-Electron/src/App.vue).
* **Notifications**: Upon success, trigger the global snackbar toast using `showToast('Thank you! Your feedback has been sent directly to the development team.', 'success')` and close the modal. On error, show the error alert inside the dialog container without closing.

---

## 7. Application Automatic Updates
* **Target Repository**: Configured in `package.json` under `"build.publish"`. The `"repo"` MUST target `"Cibola2-Electron"` (the client repository) rather than `"cibola2"` (the backend repository) to query and pull the correct installer releases.
* **Auto-updater Instance**: Configured in `electron/main.js` using `electron-updater`'s `autoUpdater` with `autoDownload = false` (explicit click to download required) and `autoInstallOnAppQuit = true`.
* **Event & IPC Wrapper Bridge**:
  * Events forwarded from `autoUpdater` to the renderer: `'update-checking'`, `'update-available'`, `'update-not-available'`, `'update-error'`, `'update-download-progress'`, and `'update-downloaded'`.
  * Exposed via `window.electronAPI` context bridge in `electron/preload.mjs`.
* **Admin Section & Simulation Mode**:
  * Located in the Local Settings tab of `src/components/Admin.vue`.
  * Includes a "Simulate" switch to mock update checks, release notes formatting (HTML), download progress increments, and restart triggers in development mode.
  * Live mode checks real GitHub release headers, downloads the update file to the user's local app update cache, and invokes `quitAndInstall()` to complete the installation process.

---

## 8. Custom Sheets Estimates
* **Estimate Values Pricing Schema**: The database stores estimate items (`est_values`) using pricing columns: `basePrice` (metal spot price or base labor/stone rate), `priceModifier` (karat purity multiplier or 1.0 for non-metal), and `markup` (multiplier factor). The client calculates the final unit price per item (Price Per) as: `basePrice * priceModifier * markup`. The `discount` field is unused on the frontend and set to `0`. The legacy `pricePer` field is deprecated and not supported by the backend.
* **Metal Spot Prices Integration**: Integrate `MetalPricesCard` in `small` mode. To preserve historical pricing, do not watch local spot prices to automatically trigger calculations on existing items. Instead, expose an explicit update button (`Update Estimates to Newest Spot Prices`) that updates local spot variables from cached metadata and calls `recalculateItem()` on all metal price items, resetting any manual overrides. Inform the operator that the displayed spot prices are historical creation values.
* **Payload Sanitation**: Always strip client-side temporary identifiers (like `clientId-X` strings) from estimate IDs and estimate values before posting/putting payloads to SQLite.
* **Custom Sheet Image Attachments**: Custom design sheets support attaching design jewelry photos or drawings. Use `<AttachedImages>` component inside the custom sheet form, binding to `sheet.custom_images` with `delete-endpoint="/customsheets/images"`. Trigger camera captures via `attachedImagesRef.value.openCamera()`.
* **Custom Sheet Printing**: Printing custom sheet estimates uses a dedicated Custom Sheet Printer configured in local settings (`settingsState.printers.custom`), falling back to a headless window layout with base64 embedded assets. If the custom sheet has attached images, they will render in a grid layout (`.images-grid`) at the bottom of the printed page.
* **Inactive Categories and Options Filtering**: To prevent cluttering the form, categories explicitly marked inactive (`active !== 1`) and individual options marked inactive (`active === 0`) must be filtered out from option selection and list headers on the form. However, if a loaded custom sheet estimate already uses an inactive category or option, it must be merged back into the visible form options to ensure the saved data displays correctly.
