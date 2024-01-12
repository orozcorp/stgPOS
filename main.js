const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { spawn } = require("child_process");
const { MongoClient } = require("mongodb");
const fs = require("fs");

const mongoDataDirectory = path.join(__dirname, "mongodb/data");

function ensureDataDirectoryExists() {
  if (!fs.existsSync(mongoDataDirectory)) {
    fs.mkdirSync(mongoDataDirectory, { recursive: true });
    console.log(`MongoDB data directory created at: ${mongoDataDirectory}`);
  }
}

async function createWindow() {
  try {
    ensureDataDirectoryExists();

    const mainWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    const startUrl = isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../stg-pos-nxt/out/index.html")}`;
    mainWindow.loadURL(startUrl);

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Start MongoDB with the specified data directory
    const mongoProcess = spawn("mongod", ["--dbpath", mongoDataDirectory]);

    mongoProcess.on("close", (code) => {
      console.log(`MongoDB process exited with code ${code}`);
    });

    // Connect to MongoDB
    const client = new MongoClient("mongodb://127.0.0.1:27017");

    await client.connect();
    console.log("Connected to MongoDB!");

    // Do more MongoDB operations as needed

    // Close the MongoDB connection when the app is closed
    app.on("before-quit", async () => {
      await client.close();
      console.log("MongoDB connection closed.");
    });

    // Kill the MongoDB process when the app is closed
    app.on("will-quit", () => {
      mongoProcess.kill();
      console.log("MongoDB process killed.");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

app.on("ready", createWindow);

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
