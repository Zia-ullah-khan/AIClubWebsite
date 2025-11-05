const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// In-memory check-in store (per process). For production, replace with a database.
const STORE_PATH = path.join(__dirname, 'checkins.json');
let CHECK_INS = [];
try {
	if (fs.existsSync(STORE_PATH)) {
		const raw = fs.readFileSync(STORE_PATH, 'utf-8');
		CHECK_INS = raw ? JSON.parse(raw) : [];
	}
} catch {
	CHECK_INS = [];
}

// MongoDB connection (optional). Provide MONGO_URI env var to enable.
let mongoClient = null;
let mongoCollection = null;

async function initMongo() {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME || 'aiclub';
	const collName = process.env.MONGO_COLL || 'checkins';
	if (!uri) return;

	try {
		mongoClient = new MongoClient(uri);
		await mongoClient.connect();
		const db = mongoClient.db(dbName);
		mongoCollection = db.collection(collName);
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error('Mongo init error:', err && err.message ? err.message : err);
		mongoClient = null;
		mongoCollection = null;
	}
}

initMongo().catch((e) => console.error('initMongo error', e));

// POST /api/checkin
// Body: { name?: string, email?: string, userId?: string, clubId: string, meetingName?: string }
router.post('/api/checkin', async (req, res) => {
	const { name, email, userId, clubId, meetingName } = req.body || {};

	if (!clubId) {
		return res.status(400).json({ ok: false, error: 'Missing clubId' });
	}

	// Accept either a logged-in userId OR a manual name+email pair
	if (!(userId || (name && email))) {
		return res.status(400).json({ ok: false, error: 'Provide either userId or both name and email' });
	}

	const record = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		timestamp: new Date().toISOString(),
		meeting_name: meetingName || `Meeting Check-In at ${new Date().toLocaleTimeString()}`,
		clubId,
		...(userId ? { userId } : {}),
		...(name ? { name } : {}),
		...(email ? { email } : {}),
	};

	// Try to persist to MongoDB if available
	if (mongoCollection) {
		try {
			const result = await mongoCollection.insertOne(record);
			// attach mongo id for response
			record._id = result.insertedId;
		} catch (err) {
			console.error('Mongo insert error:', err && err.message ? err.message : err);
			// fall through to file persistence
		}
	}

	// keep local store in sync
	CHECK_INS.push(record);
	try {
		if (!fs.existsSync(STORE_PATH)) {
			fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2));
		}
		fs.writeFileSync(STORE_PATH, JSON.stringify(CHECK_INS, null, 2));
	} catch (e) {
		console.error('Failed to write checkins file:', e && e.message ? e.message : e);
	}

	return res.status(201).json({ ok: true, record });
});

// GET /api/checkins?clubId=1
router.get('/api/checkins', async (req, res) => {
	const { clubId } = req.query;
	if (mongoCollection) {
		try {
			const q = clubId ? { clubId: String(clubId) } : {};
			const docs = await mongoCollection.find(q).sort({ timestamp: -1 }).toArray();
			return res.json({ ok: true, records: docs });
		} catch (err) {
			console.error('Mongo query error:', err && err.message ? err.message : err);
			// fall back
		}
	}
	const records = clubId ? CHECK_INS.filter((r) => r.clubId === String(clubId)) : CHECK_INS;
	return res.json({ ok: true, records });
});

module.exports = router;
