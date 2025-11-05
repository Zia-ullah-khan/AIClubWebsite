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
let mongoCollection = null; // users collection
let mongoDb = null; // db handle for accessing other collections (events)

async function initMongo() {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME || 'aiclub';
	const collName = process.env.MONGO_COLL || 'checkins';
	if (!uri) return;

	try {
		mongoClient = new MongoClient(uri);
		await mongoClient.connect();
	const db = mongoClient.db(dbName);
	mongoDb = db;
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
	const { name, email } = req.body || {};

	if (!email || !name) {
		return res.status(400).json({ ok: false, error: 'Missing required fields: email, name' });
	}

	if (!mongoCollection) {
		return res.status(503).json({ ok: false, error: 'Database service is not available.' });
	}

	const now = new Date();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0); // Start of today in local time

	// Resolve the active event based on current time window
	let activeEvent = null;
	try {
		activeEvent = await mongoDb
			.collection('events')
			.findOne({ startAt: { $lte: now }, endAt: { $gte: now } });
	} catch (e) {
		console.error('Failed to resolve active event:', e && e.message ? e.message : e);
	}

	if (!activeEvent) {
		return res.status(409).json({ ok: false, error: 'No active event is scheduled at this time.' });
	}

	try {
		const user = await mongoCollection.findOne({ email });

		const newMeetingRecord = {
			meeting_id: activeEvent._id,
			meeting_name: activeEvent.title || 'Meeting',
			time_checked_in: now.toISOString(),
		};

		if (user) {
			// User exists, prevent duplicate check-in for the same meeting (by id)
			const hasCheckedInForMeeting = user.meetings && user.meetings.some(
				(m) => String(m.meeting_id) === String(activeEvent._id)
			);

			if (hasCheckedInForMeeting) {
				return res.status(409).json({ ok: false, error: 'You have already checked in for this meeting.' });
			}

			// Add new check-in to existing user
			const result = await mongoCollection.updateOne(
				{ _id: user._id },
				{ $push: { meetings: newMeetingRecord } }
			);

			if (result.modifiedCount === 1) {
				return res.status(200).json({ ok: true, message: 'Check-in successful.' });
			} else {
				throw new Error('Failed to update user check-in.');
			}
		} else {
			// New user, create a new document
			const newUser = {
				name,
				email,
				account_created: new Date().toISOString(),
				meetings: [newMeetingRecord],
			};
			const result = await mongoCollection.insertOne(newUser);
			return res.status(201).json({ ok: true, record: { _id: result.insertedId, ...newUser } });
		}
	} catch (err) {
		console.error('Mongo operation error:', err.message);
		return res.status(500).json({ ok: false, error: 'An internal server error occurred.' });
	}
});

// GET /api/checkins (now returns user data)
router.get('/api/checkins', async (req, res) => {
	if (mongoCollection) {
		try {
			const users = await mongoCollection.find({}).sort({ account_created: -1 }).toArray();
			return res.json({ ok: true, records: users });
		} catch (err) {
			console.error('Mongo query error:', err && err.message ? err.message : err);
			return res.status(500).json({ ok: false, error: 'Failed to retrieve records.' });
		}
	}
	// Fallback to file-based store is no longer compatible with the new schema.
	return res.status(503).json({ ok: false, error: 'Database service is not available.' });
});

module.exports = router;
