import { app as s, ipcMain as a, BrowserWindow as u } from "electron";
import o from "path";
import { fileURLToPath as I } from "url";
import l from "fs";
const m = o.dirname(I(import.meta.url)), d = o.join(s.getPath("userData"), "settings.json");
function R() {
  try {
    if (l.existsSync(d)) {
      const t = l.readFileSync(d, "utf-8");
      return JSON.parse(t);
    }
  } catch (t) {
    console.error("Failed to read settings:", t);
  }
  return {
    serverURL: "http://localhost:8000",
    camera: { width: "1280", height: "1024" },
    printers: { job: "", credit: "" }
  };
}
function y(t) {
  try {
    return l.writeFileSync(d, JSON.stringify(t, null, 2), "utf-8"), !0;
  } catch (e) {
    return console.error("Failed to write settings:", e), !1;
  }
}
process.env.APP_ROOT = o.join(m, "..");
const p = process.env.VITE_DEV_SERVER_URL, h = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? o.join(process.env.APP_ROOT, "public") : h;
let r = null;
function w() {
  r = new u({
    icon: o.join(process.env.VITE_PUBLIC, "favicon.ico"),
    width: 1280,
    height: 800,
    webPreferences: {
      preload: o.join(m, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), r.webContents.on("did-finish-load", () => {
    r == null || r.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), p ? (r.loadURL(p), r.webContents.openDevTools()) : r.loadFile(o.join(h, "index.html"));
}
a.handle("get-settings", () => R());
a.handle("save-settings", (t, e) => y(e));
a.handle("get-printers", async (t) => {
  try {
    const e = t.sender;
    if (e) {
      console.log("[IPC get-printers] Invoking wc.getPrintersAsync()...");
      const i = await e.getPrintersAsync();
      console.log("[IPC get-printers] Result details:", i);
      const n = i.map((c) => c.name);
      return console.log("[IPC get-printers] Mapped printer names:", n), n;
    }
  } catch (e) {
    console.error("[IPC get-printers] Error occurred:", e);
  }
  return [];
});
a.handle("print-document", async (t, { printerName: e, htmlContent: i }) => {
  try {
    console.log(`[IPC print-document] Initializing print for printer: "${e}"`);
    let n = new u({
      show: !1,
      webPreferences: {
        nodeIntegration: !1,
        contextIsolation: !0
      }
    });
    await n.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(i)}`);
    const c = {
      silent: !0,
      printBackground: !0,
      margins: { marginType: "none" }
    };
    return e && (c.deviceName = e), new Promise((g) => {
      n.webContents.print(c, (P, f) => {
        n.destroy(), n = null, P ? (console.log(`[IPC print-document] Printed successfully on "${e || "Default Printer"}"`), g({ success: !0 })) : (console.error(`[IPC print-document] Print failed. Error type: ${f}`), g({ success: !1, error: f || "Unknown printing error" }));
      });
    });
  } catch (n) {
    return console.error("[IPC print-document] Error during printing:", n), { success: !1, error: n.message };
  }
});
s.on("window-all-closed", () => {
  process.platform !== "darwin" && (s.quit(), r = null);
});
s.on("activate", () => {
  u.getAllWindows().length === 0 && w();
});
s.whenReady().then(w);
export {
  h as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
