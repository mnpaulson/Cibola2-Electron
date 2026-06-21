<template>
  <div class="admin-container">
    <v-card class="admin-main-card mb-6" elevation="2">
      <!-- Card Header -->
      <v-card-item class="admin-header pa-6">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
            <v-icon size="24">mdi-cog</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-bold text-white">System Settings & Defaults</h2>
            <p class="text-caption text-medium-emphasis mb-0">Configure local parameters, manage employees, and customize metal value formulas.</p>
          </div>
        </div>
      </v-card-item>

      <v-divider></v-divider>

      <!-- Tabs Navigation -->
      <v-tabs v-model="activeTab" bg-color="transparent" color="primary" grow align-tabs="start" class="border-b">
        <v-tab value="local" class="text-none font-weight-medium">
          <v-icon start>mdi-laptop</v-icon>
          Local Settings
        </v-tab>
        <v-tab value="employees" class="text-none font-weight-medium">
          <v-icon start>mdi-account-multiple</v-icon>
          Employees
        </v-tab>
        <v-tab value="values" class="text-none font-weight-medium">
          <v-icon start>mdi-database-cog</v-icon>
          Custom Values
        </v-tab>
      </v-tabs>

      <!-- Tabs Content -->
      <v-window v-model="activeTab" class="pa-6">
        
        <!-- Local Settings Tab -->
        <v-window-item value="local" :transition="false" :reverse-transition="false">
          <v-row>
            <v-col cols="12" md="6" class="mx-auto">
              <v-card variant="outlined" class="border-light pa-4">
                <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-network</v-icon>
                  Local Connection & Camera
                </v-card-title>
                <v-card-text class="px-0 pb-0 pt-4">
                  <v-text-field
                    label="Server URL"
                    v-model="localSettings.serverURL"
                    placeholder="e.g. http://localhost:8000"
                    persistent-placeholder
                    prepend-inner-icon="mdi-server"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                    hint="The address of the cibola2 backend service"
                    persistent-hint
                  ></v-text-field>

                  <v-select
                    v-model="localSettings.defaultDeviceId"
                    :items="videoDevices"
                    item-title="label"
                    item-value="deviceId"
                    label="Default Camera"
                    prepend-inner-icon="mdi-webcam"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                    clearable
                    hint="Choose the default camera device for jewelry photography"
                    persistent-hint
                    @update:model-value="onDefaultCameraChanged"
                  ></v-select>

                  <v-row class="mt-2">
                    <v-col cols="6">
                      <v-text-field
                        label="Camera Width"
                        v-model="localSettings.cameraWidth"
                        prepend-inner-icon="mdi-arrow-resize"
                        variant="outlined"
                        density="comfortable"
                        type="number"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        label="Camera Height"
                        v-model="localSettings.cameraHeight"
                        prepend-inner-icon="mdi-arrow-resize"
                        variant="outlined"
                        density="comfortable"
                        type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" class="border-light pa-4 mt-6">
                <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between">
                  <span class="d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-printer</v-icon>
                    Printer Routing
                  </span>
                  <v-btn
                    variant="text"
                    density="comfortable"
                    icon="mdi-refresh"
                    color="primary"
                    size="small"
                    @click="fetchPrinters(true)"
                    title="Refresh system printers"
                  ></v-btn>
                </v-card-title>
                <v-card-text class="px-0 pb-0 pt-4">
                  <v-row class="align-start mb-4">
                    <v-col cols="9">
                      <v-combobox
                        label="Job Ticket Printer"
                        v-model="localSettings.jobPrinter"
                        :items="printerNames"
                        prepend-inner-icon="mdi-file-document-outline"
                        variant="outlined"
                        density="comfortable"
                        clearable
                        hint="Select a printer or type the name manually"
                        persistent-hint
                        no-data-text="No system printers detected. Type to enter manually."
                      ></v-combobox>
                    </v-col>
                    <v-col cols="3" class="pt-1">
                      <v-btn
                        block
                        variant="tonal"
                        color="secondary"
                        height="48"
                        prepend-icon="mdi-printer-eye"
                        @click="handlePrintTestPage(localSettings.jobPrinter, 'Job Ticket')"
                        :disabled="!localSettings.jobPrinter"
                      >
                        Test
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row class="align-start mb-2">
                    <v-col cols="9">
                      <v-combobox
                        label="Gold Credit Receipt Printer"
                        v-model="localSettings.creditPrinter"
                        :items="printerNames"
                        prepend-inner-icon="mdi-receipt-text-outline"
                        variant="outlined"
                        density="comfortable"
                        clearable
                        hint="Select a printer or type the name manually"
                        persistent-hint
                        no-data-text="No system printers detected. Type to enter manually."
                      ></v-combobox>
                    </v-col>
                    <v-col cols="3" class="pt-1">
                      <v-btn
                        block
                        variant="tonal"
                        color="secondary"
                        height="48"
                        prepend-icon="mdi-printer-eye"
                        @click="handlePrintTestPage(localSettings.creditPrinter, 'Gold Credit')"
                        :disabled="!localSettings.creditPrinter"
                      >
                        Test
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row class="align-start mb-2">
                    <v-col cols="9">
                      <v-combobox
                        label="Custom Sheet Printer"
                        v-model="localSettings.customPrinter"
                        :items="printerNames"
                        prepend-inner-icon="mdi-file-document-edit-outline"
                        variant="outlined"
                        density="comfortable"
                        clearable
                        hint="Select a printer or type the name manually"
                        persistent-hint
                        no-data-text="No system printers detected. Type to enter manually."
                      ></v-combobox>
                    </v-col>
                    <v-col cols="3" class="pt-1">
                      <v-btn
                        block
                        variant="tonal"
                        color="secondary"
                        height="48"
                        prepend-icon="mdi-printer-eye"
                        @click="handlePrintTestPage(localSettings.customPrinter, 'Custom Sheet')"
                        :disabled="!localSettings.customPrinter"
                      >
                        Test
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <div class="d-flex justify-end mt-6">
                <v-btn
                  color="primary"
                  size="large"
                  class="text-none px-6 font-weight-medium"
                  prepend-icon="mdi-content-save"
                  :loading="isSavingSettings"
                  @click="handleSaveSettings"
                  elevation="1"
                >
                  Save Settings
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Employees Tab -->
        <v-window-item value="employees" :transition="false" :reverse-transition="false">
          <v-row>
            <!-- Left Panel: Add/Edit Form -->
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="border-light pa-4">
                <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold text-gradient">
                  {{ currentEmployee.id ? 'Edit Employee' : 'Add Employee' }}
                </v-card-title>
                
                <v-card-text class="px-0 pb-0 pt-4">
                  <v-text-field
                    label="Employee Name"
                    v-model="currentEmployee.name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                    hide-details
                    @keyup.enter="handleSaveEmployee"
                  ></v-text-field>

                  <v-select
                    v-if="currentEmployee.id"
                    label="Status"
                    v-model="currentEmployee.active"
                    :items="[
                      { title: 'Active', value: 1 },
                      { title: 'Inactive', value: 0 }
                    ]"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    hide-details
                  ></v-select>

                  <div class="d-flex justify-end gap-2 mt-4">
                    <v-btn
                      v-if="currentEmployee.id"
                      variant="text"
                      color="medium-emphasis"
                      class="text-none mr-2"
                      @click="clearCurrentEmployee"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      class="text-none font-weight-medium"
                      prepend-icon="mdi-check"
                      :loading="isSavingEmployee"
                      @click="handleSaveEmployee"
                    >
                      {{ currentEmployee.id ? 'Update' : 'Add Employee' }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Right Panel: Employee List -->
            <v-col cols="12" md="8">
              <v-card variant="outlined" class="border-light">
                <v-card-title class="px-4 py-3 text-subtitle-1 font-weight-bold d-flex justify-space-between align-center border-b">
                  <div class="d-flex align-center">
                    <span>Store Directory</span>
                    <v-checkbox
                      v-model="hideInactiveEmployees"
                      label="Hide Inactive"
                      hide-details
                      density="compact"
                      color="primary"
                      class="ml-4"
                    ></v-checkbox>
                  </div>
                  <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
                    {{ filteredEmployees.length }} Employees
                  </v-chip>
                </v-card-title>

                <v-table hover density="comfortable">
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold">Name</th>
                      <th class="text-center font-weight-bold">Status</th>
                      <th class="text-right font-weight-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="emp in filteredEmployees" :key="emp.id" class="employee-row">
                      <td class="font-weight-medium">
                        {{ emp.name }}
                        <v-chip v-if="emp.id === 1" size="x-small" color="warning" class="ml-2 font-weight-bold" variant="flat">
                          System Default
                        </v-chip>
                      </td>
                      <td class="text-center">
                        <div class="d-flex justify-center">
                          <v-switch
                            :model-value="emp.active === 1"
                            @update:model-value="toggleEmployeeActive(emp)"
                            color="success"
                            density="compact"
                            hide-details
                            inset
                            :loading="emp.loadingActive"
                            :disabled="emp.id === 1 || emp.loadingActive"
                          ></v-switch>
                        </div>
                      </td>
                      <td class="text-right">
                        <v-btn
                          icon="mdi-pencil-outline"
                          variant="text"
                          color="primary"
                          density="comfortable"
                          class="mr-1"
                          @click="editEmployee(emp)"
                          :disabled="emp.id === 1"
                        ></v-btn>
                        <v-btn
                          color="error"
                          variant="outlined"
                          size="small"
                          class="text-none font-weight-medium rounded-pill"
                          prepend-icon="mdi-trash-can-outline"
                          @click="confirmDeleteEmployee(emp)"
                          :disabled="emp.id === 1"
                        >
                          Delete
                        </v-btn>
                      </td>
                    </tr>
                    <tr v-if="filteredEmployees.length === 0">
                      <td colspan="3" class="text-center py-6 text-medium-emphasis">
                        {{ employees.length === 0 ? 'No employees found. Check connection parameters.' : 'No active employees found matching the filter.' }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Custom Values Tab -->
        <v-window-item value="values" :transition="false" :reverse-transition="false">
          <v-tabs v-model="valuesSubTab" color="secondary" density="comfortable" class="mb-4">
            <v-tab value="custom-sheet" class="text-none">Custom Sheets</v-tab>
            <v-tab value="custom-sheet-categories" class="text-none">Custom Sheet Categories</v-tab>
            <v-tab value="gold-credit" class="text-none">Gold Credits</v-tab>
          </v-tabs>

          <v-window v-model="valuesSubTab">
            <!-- Custom Sheets Config Sub-tab -->
            <v-window-item value="custom-sheet" :transition="false" :reverse-transition="false">
              <div class="d-flex align-center justify-end mb-3">
                <v-checkbox
                  v-model="hideInactiveCustomSheets"
                  label="Hide Inactive"
                  hide-details
                  density="compact"
                  color="primary"
                ></v-checkbox>
              </div>
              <v-card variant="outlined" class="border-light">
                <v-card-text class="pa-0">
                  <v-table hover class="config-table">
                    <thead>
                      <tr>
                        <th class="font-weight-bold" style="width: 17%">Name</th>
                        <th class="font-weight-bold" style="width: 14%">
                          Category
                          <v-tooltip activator="parent" location="bottom">Category headers group estimate parameters (Use 'Extra' for dynamic buttons)</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 10%">
                          Base Price
                          <v-tooltip activator="parent" location="bottom">Static price fallback if no metal calculations are used</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 15%">
                          Metal Type
                          <v-tooltip activator="parent" location="bottom">Set to 'Gold' or 'Plat' to bound calculations to cached metal rates</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 9%">
                          Markup
                          <v-tooltip activator="parent" location="bottom">The markup factor applied to calculations</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 9%">
                          Default Quantity
                          <v-tooltip activator="parent" location="bottom">The default item quantity for estimates</v-tooltip>
                        </th>
                        <th class="font-weight-bold text-center" style="width: 10%">Active</th>
                        <th class="text-right font-weight-bold" style="width: 16%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="val in filteredCustomSheets" :key="val.tempId">
                        <td class="py-1">
                          <v-text-field
                            v-model="val.name"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-combobox
                            v-model="val.value1"
                            :items="categoryNames"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @update:model-value="onComboboxChange(val)"
                          ></v-combobox>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.value2"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-select
                            v-model="val.value3"
                            :items="['Gold', 'Plat', 'Silver']"
                            density="compact"
                            variant="underlined"
                            hide-details
                            clearable
                            placeholder="Select"
                            @update:model-value="onComboboxChange(val)"
                          ></v-select>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.markup"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.default"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <div class="d-flex justify-center">
                            <v-switch
                              :model-value="val.active === 1"
                              @update:model-value="toggleValueActive(val)"
                              color="success"
                              density="compact"
                              hide-details
                              inset
                              :loading="val.saveStatus === 'saving'"
                              :disabled="val.saveStatus === 'saving'"
                            ></v-switch>
                          </div>
                        </td>
                        <td class="text-right py-1">
                          <div class="d-inline-flex align-center justify-end">
                            <v-tooltip location="bottom">
                              <template v-slot:activator="{ props }">
                                <v-icon
                                  v-bind="props"
                                  :color="getStatusColor(val.saveStatus)"
                                  class="mr-3"
                                  size="small"
                                >
                                  {{ getStatusIcon(val.saveStatus) }}
                                </v-icon>
                              </template>
                              <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                            </v-tooltip>
                            <v-btn
                              color="error"
                              variant="outlined"
                              size="small"
                              class="text-none font-weight-medium rounded-pill"
                              prepend-icon="mdi-trash-can-outline"
                              @click="confirmDeleteValue(val)"
                            >
                              Delete
                            </v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredCustomSheets.length === 0">
                        <td colspan="8" class="text-center py-6 text-medium-emphasis">
                          {{ customSheets.length === 0 ? 'No custom sheet items configured.' : 'No active custom sheet items found matching the filter.' }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
              <v-btn
                variant="outlined"
                color="primary"
                class="mt-4 text-none font-weight-medium"
                prepend-icon="mdi-plus"
                @click="newValue(3)"
              >
                New Custom Sheet Item
              </v-btn>
            </v-window-item>

            <!-- Custom Sheet Categories Config Sub-tab -->
            <v-window-item value="custom-sheet-categories" :transition="false" :reverse-transition="false">
              <div class="d-flex align-center justify-end mb-3">
                <v-checkbox
                  v-model="hideInactiveCategories"
                  label="Hide Inactive"
                  hide-details
                  density="compact"
                  color="primary"
                ></v-checkbox>
              </div>
              <v-card variant="outlined" class="border-light">
                <v-card-text class="pa-0">
                  <v-table hover class="config-table">
                    <thead>
                      <tr>
                        <th class="font-weight-bold" style="width: 45%">Category Name</th>
                        <th class="font-weight-bold" style="width: 20%">
                          Order
                          <v-tooltip activator="parent" location="bottom">Set display ordering index of custom sheet categories</v-tooltip>
                        </th>
                        <th class="font-weight-bold text-center" style="width: 15%">Active</th>
                        <th class="text-right font-weight-bold" style="width: 20%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(val, index) in filteredCustomSheetCategories" :key="val.tempId">
                        <td class="py-1">
                          <v-text-field
                            v-model="val.name"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <div class="d-flex align-center" style="gap: 8px;">
                            <v-text-field
                              v-model="val.order"
                              density="compact"
                              variant="underlined"
                              hide-details
                              type="number"
                              style="max-width: 60px;"
                              @input="markPending(val)"
                              @blur="saveIfPending(val)"
                            ></v-text-field>
                            <div class="d-flex flex-column align-center justify-center">
                              <v-btn
                                icon="mdi-chevron-up"
                                variant="text"
                                size="x-small"
                                density="compact"
                                :disabled="index === 0"
                                @click="moveCategory(val, 'up')"
                                class="ma-0 pa-0"
                                style="font-size: 14px; height: 16px; width: 16px;"
                              ></v-btn>
                              <v-btn
                                icon="mdi-chevron-down"
                                variant="text"
                                size="x-small"
                                density="compact"
                                :disabled="index === filteredCustomSheetCategories.length - 1"
                                @click="moveCategory(val, 'down')"
                                class="ma-0 pa-0"
                                style="font-size: 14px; height: 16px; width: 16px;"
                              ></v-btn>
                            </div>
                          </div>
                        </td>
                        <td class="py-1">
                          <div class="d-flex justify-center">
                            <v-switch
                              :model-value="val.active === 1"
                              @update:model-value="toggleValueActive(val)"
                              color="success"
                              density="compact"
                              hide-details
                              inset
                              :loading="val.saveStatus === 'saving'"
                              :disabled="val.saveStatus === 'saving'"
                            ></v-switch>
                          </div>
                        </td>
                        <td class="text-right py-1">
                          <div class="d-inline-flex align-center justify-end">
                            <v-tooltip location="bottom">
                              <template v-slot:activator="{ props }">
                                <v-icon
                                  v-bind="props"
                                  :color="getStatusColor(val.saveStatus)"
                                  class="mr-3"
                                  size="small"
                                >
                                  {{ getStatusIcon(val.saveStatus) }}
                                </v-icon>
                              </template>
                              <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                            </v-tooltip>
                            <v-btn
                              color="error"
                              variant="outlined"
                              size="small"
                              class="text-none font-weight-medium rounded-pill"
                              prepend-icon="mdi-trash-can-outline"
                              @click="confirmDeleteValue(val)"
                            >
                              Delete
                            </v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredCustomSheetCategories.length === 0">
                        <td colspan="4" class="text-center py-6 text-medium-emphasis">
                          {{ customSheetCategories.length === 0 ? 'No custom sheet categories configured.' : 'No active custom sheet categories found matching the filter.' }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
              <v-btn
                variant="outlined"
                color="primary"
                class="mt-4 text-none font-weight-medium"
                prepend-icon="mdi-plus"
                @click="newValue(4)"
              >
                New Category
              </v-btn>
            </v-window-item>

            <!-- Gold Credits Config Sub-tab -->
            <v-window-item value="gold-credit" :transition="false" :reverse-transition="false">
              <v-card variant="outlined" class="border-light">
                <v-card-text class="pa-0">
                  <v-table hover class="config-table">
                    <thead>
                      <tr>
                        <th class="font-weight-bold" style="width: 22%">Name</th>
                        <th class="font-weight-bold" style="width: 18%">
                          Metal Price Multiplier
                          <v-tooltip activator="parent" location="bottom">Multiplied by the spot rate (e.g. 14k = 0.585)</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 12%">
                          Markup
                          <v-tooltip activator="parent" location="bottom">Value factor multiplied to metal price and weight</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 12%">
                          Metal Type
                          <v-tooltip activator="parent" location="bottom">Assigns 'Gold' or 'Platinum' spot prices to evaluate item value</v-tooltip>
                        </th>
                        <th class="font-weight-bold" style="width: 8%">Order</th>
                        <th class="font-weight-bold text-center" style="width: 10%">Active</th>
                        <th class="text-right font-weight-bold" style="width: 18%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="val in goldCredits" :key="val.tempId">
                        <td class="py-1">
                          <v-text-field
                            v-model="val.name"
                            density="compact"
                            variant="underlined"
                            hide-details
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.value1"
                            density="compact"
                            variant="underlined"
                            hide-details
                            type="number"
                            step="0.001"
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.value2"
                            density="compact"
                            variant="underlined"
                            hide-details
                            type="number"
                            step="0.01"
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.value3"
                            density="compact"
                            variant="underlined"
                            hide-details
                            placeholder="Gold or Platinum"
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <v-text-field
                            v-model="val.order"
                            density="compact"
                            variant="underlined"
                            hide-details
                            type="number"
                            @input="markPending(val)"
                            @blur="saveIfPending(val)"
                          ></v-text-field>
                        </td>
                        <td class="py-1">
                          <div class="d-flex justify-center">
                            <v-switch
                              :model-value="val.active === 1"
                              @update:model-value="toggleValueActive(val)"
                              color="success"
                              density="compact"
                              hide-details
                              inset
                              :loading="val.saveStatus === 'saving'"
                              :disabled="val.saveStatus === 'saving'"
                            ></v-switch>
                          </div>
                        </td>
                        <td class="text-right py-1">
                          <div class="d-inline-flex align-center justify-end">
                            <v-tooltip location="bottom">
                              <template v-slot:activator="{ props }">
                                <v-icon
                                  v-bind="props"
                                  :color="getStatusColor(val.saveStatus)"
                                  class="mr-3"
                                  size="small"
                                >
                                  {{ getStatusIcon(val.saveStatus) }}
                                </v-icon>
                              </template>
                              <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                            </v-tooltip>
                            <v-btn
                              color="error"
                              variant="outlined"
                              size="small"
                              class="text-none font-weight-medium rounded-pill"
                              prepend-icon="mdi-trash-can-outline"
                              @click="confirmDeleteValue(val)"
                            >
                              Delete
                            </v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="goldCredits.length === 0">
                        <td colspan="7" class="text-center py-6 text-medium-emphasis">No gold credit items configured.</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
              <v-btn
                variant="outlined"
                color="primary"
                class="mt-4 text-none font-weight-medium"
                prepend-icon="mdi-plus"
                @click="newValue(1)"
              >
                New Gold Credit Item
              </v-btn>
            </v-window-item>


          </v-window>
        </v-window-item>

      </v-window>
    </v-card>

    <!-- Dialog: Delete Employee Confirmation -->
    <v-dialog v-model="employeeDeleteDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-toolbar color="error" dark flat>
          <v-toolbar-title class="font-weight-bold">
            <v-icon start>mdi-alert-circle</v-icon>
            Delete Employee
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="mb-4">
            Are you sure you want to permanently delete employee <strong class="text-error">{{ employeeToDelete?.name }}</strong>?
          </p>
          <v-alert
            color="error"
            variant="tonal"
            icon="mdi-shield-alert-outline"
            class="text-caption font-weight-medium mb-0"
          >
            Any active jobs or gold credits assigned to this employee will be automatically reassigned to <strong>Unassigned</strong>. This action cannot be undone.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-btn
            variant="text"
            color="medium-emphasis"
            class="text-none font-weight-medium px-4"
            @click="employeeDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            class="text-none font-weight-medium px-4"
            prepend-icon="mdi-trash-can"
            @click="handleDeleteEmployee"
          >
            Delete Employee
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Delete Custom Value Item Confirmation -->
    <v-dialog v-model="valueDeleteDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-toolbar color="error" dark flat>
          <v-toolbar-title class="font-weight-bold">
            <v-icon start>mdi-alert-circle</v-icon>
            Delete Configuration Item
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="mb-0">
            Are you sure you want to delete <strong class="text-error">{{ valueToDelete?.name || 'this item' }}</strong> from configuration? This will permanently remove its calculations.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-btn
            variant="text"
            color="medium-emphasis"
            class="text-none font-weight-medium px-4"
            @click="valueDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            class="text-none font-weight-medium px-4"
            prepend-icon="mdi-trash-can"
            @click="handleDeleteValue"
          >
            Delete Item
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { api } from '../utils/api'
import { settingsState, saveSettings, loadSettings } from '../store/settings'
import { showToast } from '../store/toast'
import { refreshMetadata } from '../store/metadata'


// Navigation state
const activeTab = ref('local')
const valuesSubTab = ref('custom-sheet')

// Local Settings State
const localSettings = reactive({
  serverURL: '',
  cameraWidth: '',
  cameraHeight: '',
  defaultDeviceId: '',
  jobPrinter: '',
  creditPrinter: '',
  customPrinter: ''
})
const printerNames = ref([])
const videoDevices = ref([])
const isSavingSettings = ref(false)

// Employees State
const employees = ref([])
const currentEmployee = reactive({
  id: null,
  name: '',
  active: 1
})
const isSavingEmployee = ref(false)
const employeeDeleteDialog = ref(false)
const employeeToDelete = ref(null)
const hideInactiveEmployees = ref(true)

const filteredEmployees = computed(() => {
  if (hideInactiveEmployees.value) {
    return employees.value.filter(emp => emp.active === 1 || emp.justDeactivated)
  }
  return employees.value
})

// Custom Values State
const valuesList = ref([])
const customSheets = ref([])
const customSheetCategories = ref([])
const goldCredits = ref([])
const valueDeleteDialog = ref(false)
const valueToDelete = ref(null)
const hideInactiveCustomSheets = ref(true)
const hideInactiveCategories = ref(true)

const filteredCustomSheets = computed(() => {
  if (hideInactiveCustomSheets.value) {
    return customSheets.value.filter(val => val.active === 1 || !val.id || val.justDeactivated)
  }
  return customSheets.value
})

const filteredCustomSheetCategories = computed(() => {
  if (hideInactiveCategories.value) {
    return customSheetCategories.value.filter(val => val.active === 1 || !val.id || val.justDeactivated)
  }
  return customSheetCategories.value
})

const categoryNames = computed(() => {
  return customSheetCategories.value.map(c => c.name).filter(Boolean)
})

// Snackbar Toast System
const showSnackbar = (text, color = 'success') => {
  showToast(text, color)
}

// ----------------------------------------------------
// Local Settings Methods
// ----------------------------------------------------
const initLocalSettings = () => {
  localSettings.serverURL = settingsState.serverURL
  localSettings.cameraWidth = settingsState.camera.width
  localSettings.cameraHeight = settingsState.camera.height
  localSettings.defaultDeviceId = settingsState.camera.defaultDeviceId || ''
  localSettings.jobPrinter = settingsState.printers.job
  localSettings.creditPrinter = settingsState.printers.credit
  localSettings.customPrinter = settingsState.printers.custom
}

const fetchVideoDevices = async () => {
  try {
    // Request permission first to get labels
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
    tempStream.getTracks().forEach(track => track.stop())
  } catch (err) {
    console.warn('Failed to access camera permission for settings page list:', err)
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    videoDevices.value = devices
      .filter(device => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`
      }))
  } catch (err) {
    console.error('Failed to list video devices in settings:', err)
  }
}

const onDefaultCameraChanged = async (deviceId) => {
  if (!deviceId) return
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 4096 },
        height: { ideal: 2160 }
      }
    })
    
    const track = stream.getVideoTracks()[0]
    if (track) {
      const settings = track.getSettings()
      if (settings.width) {
        localSettings.cameraWidth = String(settings.width)
      }
      if (settings.height) {
        localSettings.cameraHeight = String(settings.height)
      }
    }
    
    stream.getTracks().forEach(t => t.stop())
  } catch (err) {
    console.error('Failed to autodetect camera resolution on settings select:', err)
  }
}

const fetchPrinters = async (showToast = false) => {
  console.log('Renderer: Invoking electronAPI.getPrinters()...')
  if (window.electronAPI && window.electronAPI.getPrinters) {
    try {
      const list = await window.electronAPI.getPrinters()
      console.log('Renderer: electronAPI.getPrinters() returned list:', list)
      printerNames.value = list || []
      if (showToast) {
        showSnackbar(`Found ${printerNames.value.length} system printer(s)`, 'info')
      }
    } catch (err) {
      console.error('Renderer: Failed to query system printers:', err)
      showSnackbar('Failed to query system printers: ' + err.message, 'error')
    }
  } else {
    console.warn('Renderer: window.electronAPI.getPrinters is NOT defined')
    if (showToast) {
      showSnackbar('Printer API not available in this environment', 'warning')
    }
  }
}

const handlePrintTestPage = async (printerName, type) => {
  if (!printerName) {
    showSnackbar('Please select a printer first', 'warning')
    return
  }

  const timestamp = new Date().toLocaleString()
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Test Page</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .info {
            font-size: 12px;
            margin-top: 5px;
          }
          .content {
            font-size: 14px;
            line-height: 1.4;
          }
          .field {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 20px;
            border-top: 2px dashed #000;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="title">CIBOLA II PRINT TEST</p>
          <p class="info">${type} Printer Routing</p>
        </div>
        <div class="content">
          <div class="field"><strong>Status:</strong> SUCCESSFUL</div>
          <div class="field"><strong>Printer:</strong> ${printerName}</div>
          <div class="field"><strong>Timestamp:</strong> ${timestamp}</div>
          <div class="field"><strong>Environment:</strong> Electron Renderer</div>
        </div>
        <div class="footer">
          <p>End of Test Page</p>
        </div>
      </body>
    </html>
  `

  console.log(`Renderer: Requesting print test on printer "${printerName}"...`)
  if (window.electronAPI && window.electronAPI.printDocument) {
    try {
      const response = await window.electronAPI.printDocument({ printerName, htmlContent })
      if (response && response.success) {
        showSnackbar(`Test page printed successfully on "${printerName}"`, 'success')
      } else {
        throw new Error(response?.error || 'Unknown printer failure')
      }
    } catch (err) {
      console.error('Renderer: Print test failed:', err)
      showSnackbar('Print test failed: ' + err.message, 'error')
    }
  } else {
    console.warn('Renderer: window.electronAPI.printDocument is NOT defined')
    showSnackbar('Printing API is not available in this environment', 'warning')
  }
}

const handleSaveSettings = async () => {
  isSavingSettings.value = true
  try {
    // Basic validation / normalization
    let cleanURL = localSettings.serverURL.trim()
    if (cleanURL && !cleanURL.startsWith('http://') && !cleanURL.startsWith('https://')) {
      cleanURL = 'http://' + cleanURL
    }
    localSettings.serverURL = cleanURL

    await saveSettings({
      serverURL: localSettings.serverURL,
      camera: {
        width: localSettings.cameraWidth,
        height: localSettings.cameraHeight,
        defaultDeviceId: localSettings.defaultDeviceId
      },
      printers: {
        job: localSettings.jobPrinter,
        credit: localSettings.creditPrinter,
        custom: localSettings.customPrinter
      }
    })
    showSnackbar('Local settings cached successfully', 'success')
  } catch (err) {
    showSnackbar('Failed to write settings: ' + err.message, 'error')
  } finally {
    isSavingSettings.value = false
  }
}

// ----------------------------------------------------
// Employees Methods
// ----------------------------------------------------
const getEmployees = async () => {
  try {
    const deactivatedStates = {}
    employees.value.forEach(emp => {
      if (emp.id) {
        deactivatedStates[emp.id] = emp.justDeactivated
      }
    })

    const data = await api.get('/employees')
    employees.value = (data || []).map(emp => ({
      ...emp,
      loadingActive: false,
      justDeactivated: deactivatedStates[emp.id] || false
    }))
  } catch (err) {
    console.error('Failed to load employees:', err)
  }
}

const handleSaveEmployee = async () => {
  const name = currentEmployee.name.trim()
  if (!name) {
    showSnackbar('Employee name is required', 'warning')
    return
  }

  isSavingEmployee.value = true
  try {
    if (currentEmployee.id) {
      // Update
      await api.put(`/employees/${currentEmployee.id}`, {
        name,
        active: currentEmployee.active
      })
      showSnackbar('Employee settings updated', 'success')
    } else {
      // Create
      await api.post('/employees', { name })
      showSnackbar('Employee added successfully', 'success')
    }
    clearCurrentEmployee()
    await getEmployees()
  } catch (err) {
    showSnackbar('Failed to save employee: ' + err.message, 'error')
  } finally {
    isSavingEmployee.value = false
  }
}

const toggleEmployeeActive = async (emp) => {
  if (emp.loadingActive) return
  emp.loadingActive = true
  try {
    const newActive = emp.active === 1 ? 0 : 1
    await api.put(`/employees/${emp.id}`, {
      name: emp.name,
      active: newActive
    })
    emp.active = newActive
    if (newActive === 0) {
      emp.justDeactivated = true
    } else {
      emp.justDeactivated = false
    }
    showSnackbar(`Employee ${newActive ? 'activated' : 'deactivated'}`, 'success')
  } catch (err) {
    showSnackbar('Failed to toggle status: ' + err.message, 'error')
  } finally {
    emp.loadingActive = false
  }
}

const editEmployee = (emp) => {
  if (emp.id === 1) return
  currentEmployee.id = emp.id
  currentEmployee.name = emp.name
  currentEmployee.active = emp.active
}

const clearCurrentEmployee = () => {
  currentEmployee.id = null
  currentEmployee.name = ''
  currentEmployee.active = 1
}

const confirmDeleteEmployee = (emp) => {
  if (emp.id === 1) return
  employeeToDelete.value = emp
  employeeDeleteDialog.value = true
}

const handleDeleteEmployee = async () => {
  if (!employeeToDelete.value) return
  try {
    await api.delete(`/employees/${employeeToDelete.value.id}`)
    showSnackbar('Employee removed successfully', 'success')
    if (currentEmployee.id === employeeToDelete.value.id) {
      clearCurrentEmployee()
    }
    await getEmployees()
  } catch (err) {
    showSnackbar('Failed to delete employee: ' + err.message, 'error')
  } finally {
    employeeDeleteDialog.value = false
    employeeToDelete.value = null
  }
}

// ----------------------------------------------------
// Custom Values Methods
// ----------------------------------------------------
const getValues = async () => {
  try {
    const currentStatuses = {}
    const deactivatedStates = {}
    valuesList.value.forEach(v => {
      const key = v.id || v.tempId
      if (key) {
        currentStatuses[key] = v.saveStatus
        deactivatedStates[key] = v.justDeactivated
      }
    })

    // Keep track of unsaved local items
    const unsavedSheets = customSheets.value.filter(v => !v.id)
    const unsavedCategories = customSheetCategories.value.filter(v => !v.id)
    const unsavedCredits = goldCredits.value.filter(v => !v.id)

    const data = await api.get('/values')
    valuesList.value = (data || []).map(v => {
      const tempId = `val-${v.id}`
      return {
        ...v,
        tempId,
        saveStatus: currentStatuses[v.id] || null,
        justDeactivated: deactivatedStates[v.id] || false
      }
    })
    
    // Categorize custom values
    customSheets.value = [
      ...valuesList.value.filter(v => v.type_id === 3),
      ...unsavedSheets
    ]
    goldCredits.value = [
      ...valuesList.value.filter(v => v.type_id === 1),
      ...unsavedCredits
    ]
    
    const dbCategories = valuesList.value.filter(v => v.type_id === 4)
    customSheetCategories.value = [
      ...dbCategories.sort((a, b) => {
        const orderA = a.order !== null && a.order !== undefined && a.order !== '' ? Number(a.order) : -999
        const orderB = b.order !== null && b.order !== undefined && b.order !== '' ? Number(b.order) : -999
        return orderB - orderA
      }),
      ...unsavedCategories
    ]
  } catch (err) {
    console.error('Failed to load values configuration:', err)
  }
}

const toggleValueActive = async (val) => {
  const newActive = val.active === 1 ? 0 : 1
  val.active = newActive
  if (newActive === 0) {
    val.justDeactivated = true
  } else {
    val.justDeactivated = false
  }
  
  if (val.id) {
    await saveValue(val)
  }
}

const markPending = (val) => {
  if (val.saveStatus !== 'saving') {
    val.saveStatus = 'pending'
  }
}

const saveIfPending = async (val) => {
  if (val.saveStatus === 'pending') {
    if (!val.name || !val.name.trim()) {
      val.saveStatus = null
      return
    }
    await saveValue(val)
  }
}

const onComboboxChange = async (val) => {
  markPending(val)
  await saveIfPending(val)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'saving': return 'info'
    case 'saved': return 'success'
    case 'error': return 'error'
    default: return 'medium-emphasis'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return 'mdi-cloud-upload-outline'
    case 'saving': return 'mdi-cloud-sync-outline'
    case 'saved': return 'mdi-check-circle-outline'
    case 'error': return 'mdi-alert-circle-outline'
    default: return 'mdi-cloud-check-outline'
  }
}

const getStatusTooltip = (status) => {
  switch (status) {
    case 'pending': return 'Changes pending (press Tab or click outside to save)'
    case 'saving': return 'Saving changes to database...'
    case 'saved': return 'All changes saved'
    case 'error': return 'Failed to save changes'
    default: return 'Saved'
  }
}

const newValue = (typeId) => {
  const newItem = {
    id: null,
    tempId: `new-${Date.now()}-${Math.random()}`,
    type_id: typeId,
    name: '',
    value1: '',
    value2: '',
    value3: typeId === 1 ? 'Gold' : '', // Default to Gold metal type for credits
    order: '',
    markup: '',
    default: '',
    active: 1,
    saveStatus: null
  }
  
  if (typeId === 1) {
    goldCredits.value.push(newItem)
  } else if (typeId === 3) {
    customSheets.value.push(newItem)
  } else if (typeId === 4) {
    customSheetCategories.value.push(newItem)
  }
}

const saveValue = async (value) => {
  if (!value.name.trim()) {
    showSnackbar('Item name is required', 'warning')
    return
  }

  value.saveStatus = 'saving'
  try {
    const payload = {
      name: value.name.trim(),
      value1: value.value1 !== null && value.value1 !== undefined ? String(value.value1).trim() : null,
      value2: value.value2 !== null && value.value2 !== undefined ? String(value.value2).trim() : null,
      value3: value.value3 !== null && value.value3 !== undefined ? String(value.value3).trim() : null,
      order: value.order !== null && value.order !== undefined ? String(value.order).trim() : null,
      markup: value.markup !== null && value.markup !== undefined ? String(value.markup).trim() : null,
      default: value.default !== null && value.default !== undefined ? String(value.default).trim() : null,
      active: value.active === 0 || value.active === false ? 0 : 1
    }

    if (value.id) {
      await api.put(`/values/${value.id}`, payload)
      value.saveStatus = 'saved'
    } else {
      payload.type_id = value.type_id
      const data = await api.post('/values', payload)
      value.id = data.id // Assign the new row ID from Express
      value.saveStatus = 'saved'
    }

    setTimeout(() => {
      const item = valuesList.value.find(v => v.id === value.id)
      if (item) {
        item.saveStatus = null
      } else {
        value.saveStatus = null
      }
    }, 3000)

    // Sync metadata store cache
    await refreshMetadata()

    // Reload all config values to ensure ordering
    await getValues()
  } catch (err) {
    value.saveStatus = null
    showSnackbar('Failed to write value: ' + err.message, 'error')
  }
}

const confirmDeleteValue = (value) => {
  valueToDelete.value = value
  valueDeleteDialog.value = true
}

const handleDeleteValue = async () => {
  if (!valueToDelete.value) return
  const val = valueToDelete.value
  
  if (!val.id) {
    // Just remove from current local UI array
    if (val.type_id === 1) {
      goldCredits.value = goldCredits.value.filter(v => v !== val)
    } else if (val.type_id === 3) {
      customSheets.value = customSheets.value.filter(v => v !== val)
    } else if (val.type_id === 4) {
      customSheetCategories.value = customSheetCategories.value.filter(v => v !== val)
    }
    valueDeleteDialog.value = false
    valueToDelete.value = null
    return
  }

  try {
    await api.delete(`/values/${val.id}`)
    showSnackbar('Item removed successfully', 'success')
    
    // Sync metadata store cache
    await refreshMetadata()
    
    await getValues()
  } catch (err) {
    showSnackbar('Failed to delete item: ' + err.message, 'error')
  } finally {
    valueDeleteDialog.value = false
    valueToDelete.value = null
  }
}

const moveCategory = async (item, direction) => {
  const filteredList = filteredCustomSheetCategories.value
  const filteredIndex = filteredList.indexOf(item)
  if (filteredIndex === -1) return
  
  const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1
  if (targetFilteredIndex < 0 || targetFilteredIndex >= filteredList.length) return
  
  const targetItem = filteredList[targetFilteredIndex]
  
  // Find their indices in the main list
  const mainList = customSheetCategories.value
  const index = mainList.indexOf(item)
  const targetIndex = mainList.indexOf(targetItem)
  if (index === -1 || targetIndex === -1) return
  
  // Swap their positions in the main list
  mainList[index] = targetItem
  mainList[targetIndex] = item
  
  // Re-assign sequential order numbers (descending)
  mainList.forEach((it, idx) => {
    it.order = mainList.length - idx
  })
  
  // Update the reactive ref array reference to trigger Vue's reactivity
  customSheetCategories.value = [...mainList]
  
  // Save the changes to backend for items that have an id
  try {
    const itemsToSave = [item, targetItem].filter(it => it.id)
    for (const it of itemsToSave) {
      const payload = {
        name: it.name.trim(),
        value1: it.value1 !== null && it.value1 !== undefined ? String(it.value1).trim() : null,
        value2: it.value2 !== null && it.value2 !== undefined ? String(it.value2).trim() : null,
        value3: it.value3 !== null && it.value3 !== undefined ? String(it.value3).trim() : null,
        order: String(it.order),
        markup: it.markup !== null && it.markup !== undefined ? String(it.markup).trim() : null,
        default: it.default !== null && it.default !== undefined ? String(it.default).trim() : null,
        active: it.active === 0 || it.active === false ? 0 : 1
      }
      await api.put(`/values/${it.id}`, payload)
    }
    
    // Sync metadata store cache
    await refreshMetadata()
    // Reload all config values to ensure correct UI ordering
    await getValues()
    
    showSnackbar('Category order updated successfully', 'success')
  } catch (err) {
    showSnackbar('Failed to save category order: ' + err.message, 'error')
  }
}


// ----------------------------------------------------
// Initialization
// ----------------------------------------------------
onMounted(async () => {
  // Ensure settings are loaded
  if (!settingsState.isLoaded) {
    await loadSettings()
  }
  
  initLocalSettings()
  await fetchPrinters()
  await fetchVideoDevices()
})

// Watch active tab to load data lazily (e.g. only get employee data when rendering the employee list)
watch(activeTab, (newTab) => {
  // Clear deactivation flags on tab change
  employees.value.forEach(emp => {
    emp.justDeactivated = false
  })
  valuesList.value.forEach(v => {
    v.justDeactivated = false
  })

  if (newTab === 'employees') {
    getEmployees()
  } else if (newTab === 'values') {
    getValues()
  }
}, { immediate: true })

// Watch hide inactive checkboxes to reset temporary visibility flags when toggled back on
watch(hideInactiveEmployees, (newVal) => {
  if (newVal) {
    employees.value.forEach(emp => {
      emp.justDeactivated = false
    })
  }
})

watch(hideInactiveCustomSheets, (newVal) => {
  if (newVal) {
    customSheets.value.forEach(v => {
      v.justDeactivated = false
    })
  }
})

watch(hideInactiveCategories, (newVal) => {
  if (newVal) {
    customSheetCategories.value.forEach(v => {
      v.justDeactivated = false
    })
  }
})


// Watch settings state to sync local variables if changed elsewhere
watch(() => settingsState.isLoaded, (loaded) => {
  if (loaded) {
    initLocalSettings()
  }
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-main-card {
  border-radius: 16px !important;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(30, 30, 35, 0.6) !important;
  backdrop-filter: blur(10px);
}

.admin-header {
  background: linear-gradient(135deg, rgba(24, 103, 192, 0.15) 0%, rgba(92, 187, 246, 0.05) 100%);
}

.border-light {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.02) !important;
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.text-gradient {
  background: linear-gradient(45deg, #1867C0, #5CBBF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

.employee-row {
  transition: background-color 0.2s ease;
}

.employee-row:hover {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

.config-table :deep(input) {
  text-align: left !important;
}

.config-table :deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  font-size: 0.9rem !important;
}

/* Custom v-window-item transitions disabled for performance */
</style>
