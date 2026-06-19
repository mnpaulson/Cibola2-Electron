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
  printDocument: (payload) => electron.ipcRenderer.invoke("print-document", payload)
});
