const path = require('path');
// Load environment variables from backend/.env when running locally
try {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch {}
const { MongoClient } = require('mongodb');

let db = null;
let client = null;


async function initMongo() {
    if (db) return db;

    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'aiclub';
    if (!uri) {
        console.log('MONGO_URI not provided. Database features will be disabled.');
        return null;
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');

        return db;
    } catch (err) {
        console.error('Mongo init error:', err && err.message ? err.message : err);
        db = null;
        return null;
    }
}

async function getDb() {
    return db || await initMongo();
}

async function closeDb() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    }
}

module.exports = { getDb, initMongo, closeDb };
