const { MongoClient } = require("mongodb");
require("dotenv").config();

const ONLINE_DB_URI = process.env.MONGODB_URI;
const OFFLINE_DB_URI = process.env.OFFLINE_DB;
const DB_NAME = process.env.DB_NAME;

if (!ONLINE_DB_URI || !OFFLINE_DB_URI) {
  throw new Error("Database URIs are not defined in environment variables");
}

// Caching the database connections
let cachedDb = {
  online: null,
  offline: null,
};

async function connectToDatabase(useOnline = true) {
  const uri = useOnline ? ONLINE_DB_URI : OFFLINE_DB_URI;
  const cacheKey = useOnline ? "online" : "offline";

  if (cachedDb[cacheKey]) {
    return cachedDb[cacheKey];
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(DB_NAME);
    cachedDb[cacheKey] = { client, db };
    return cachedDb[cacheKey];
  } catch (err) {
    console.error(
      `Failed to connect to ${useOnline ? "online" : "offline"} database:`,
      err
    );
    throw err;
  }
}

async function disconnectFromDatabase(useOnline = true) {
  const cacheKey = useOnline ? "online" : "offline";

  if (cachedDb[cacheKey] && cachedDb[cacheKey].client) {
    try {
      await cachedDb[cacheKey].client.close();
      cachedDb[cacheKey] = null;
      console.log(
        `Disconnected from ${useOnline ? "online" : "offline"} database.`
      );
    } catch (err) {
      console.error(
        `Failed to disconnect from ${
          useOnline ? "online" : "offline"
        } database:`,
        err
      );
      throw err;
    }
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
};
