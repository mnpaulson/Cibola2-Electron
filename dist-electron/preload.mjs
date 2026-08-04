"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, value) => callback(value));
  },
  send: (channel, data) => {
    electron.ipcRenderer.send(channel, data);
  },
  on: (channel, callback) => {
    electron.ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => electron.ipcRenderer.invoke("save-settings", settings),
  getPrinters: () => electron.ipcRenderer.invoke("get-printers"),
  printDocument: (payload) => electron.ipcRenderer.invoke("print-document", payload),
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version"),
  checkForUpdate: () => electron.ipcRenderer.invoke("check-for-update"),
  downloadUpdate: () => electron.ipcRenderer.invoke("download-update"),
  installUpdate: () => electron.ipcRenderer.invoke("install-update"),
  onUpdateChecking: (callback) => {
    const fn = () => callback();
    electron.ipcRenderer.on("update-checking", fn);
    return () => electron.ipcRenderer.removeListener("update-checking", fn);
  },
  onUpdateAvailable: (callback) => {
    const fn = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-available", fn);
    return () => electron.ipcRenderer.removeListener("update-available", fn);
  },
  onUpdateNotAvailable: (callback) => {
    const fn = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-not-available", fn);
    return () => electron.ipcRenderer.removeListener("update-not-available", fn);
  },
  onUpdateError: (callback) => {
    const fn = (_event, err) => callback(err);
    electron.ipcRenderer.on("update-error", fn);
    return () => electron.ipcRenderer.removeListener("update-error", fn);
  },
  onDownloadProgress: (callback) => {
    const fn = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("update-download-progress", fn);
    return () => electron.ipcRenderer.removeListener("update-download-progress", fn);
  },
  onUpdateDownloaded: (callback) => {
    const fn = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-downloaded", fn);
    return () => electron.ipcRenderer.removeListener("update-downloaded", fn);
  },
  onAppNavigateBack: (callback) => {
    const fn = () => callback();
    electron.ipcRenderer.on("app-navigate-back", fn);
    return () => electron.ipcRenderer.removeListener("app-navigate-back", fn);
  },
  onAppNavigateForward: (callback) => {
    const fn = () => callback();
    electron.ipcRenderer.on("app-navigate-forward", fn);
    return () => electron.ipcRenderer.removeListener("app-navigate-forward", fn);
  }
});
