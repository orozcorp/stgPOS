const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

async function createWindow() {
  try {
    // Create the browser window in full screen.
    const mainWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    // Load the index.html of the app.
    const startUrl = isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../stg-pos-nxt/out/index.html")}`;
    mainWindow.loadURL(startUrl);

    // Open the DevTools automatically if developing
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error(
      "Failed to connect to the online database, trying offline database:",
      error
    );
  }
}

app.on("ready", createWindow);

// Clean up resources when all windows are closed except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
