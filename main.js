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

let mongoProcess; // Declare mongoProcess at a higher scope
let client; // Declare MongoClient at a higher scope

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
    mongoProcess = spawn("mongod", ["--dbpath", mongoDataDirectory]);

    mongoProcess.stdout.on("data", (data) => {
      console.log(`MongoDB stdout: ${data}`);
    });

    mongoProcess.stderr.on("data", (data) => {
      console.error(`MongoDB stderr: ${data}`);
    });

    mongoProcess.on("close", (code) => {
      console.log(`MongoDB process exited with code ${code}`);
    });

    // Attempt to connect to MongoDB
    client = new MongoClient("mongodb://127.0.0.1:27017", {
      serverSelectionTimeoutMS: 5000,
    });
    await connectWithRetry(client);

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
    console.error("Failed to create window:", error);
  }
}

async function connectWithRetry(client, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      console.log(
        `Attempting to connect to MongoDB, try ${retries + 1}/${maxRetries}`
      );
      await client.connect();
      console.log("Connected to MongoDB!");
      break;
    } catch (error) {
      console.error(`Retry ${retries + 1}/${maxRetries} failed:`, error);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 seconds before retrying
    }
  }
  if (retries === maxRetries) {
    console.error("Failed to connect to MongoDB after maximum retries.");
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
