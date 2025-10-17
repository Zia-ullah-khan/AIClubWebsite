const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

// POST /api/checkin
// Body: { name?: string, email?: string, userId?: string, clubId: string, meetingName?: string }
router.post('/api/checkin', (req, res) => {
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
	CHECK_INS.push(record);

	// Persist to JSON file
	try {
		if (!fs.existsSync(STORE_PATH)) {
			fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2));
		}
		fs.writeFileSync(STORE_PATH, JSON.stringify(CHECK_INS, null, 2));
	} catch {}

	return res.status(201).json({ ok: true, record });
});

// GET /api/checkins?clubId=1
router.get('/api/checkins', (req, res) => {
	const { clubId } = req.query;
	const records = clubId ? CHECK_INS.filter((r) => r.clubId === String(clubId)) : CHECK_INS;
	return res.json({ ok: true, records });
});

module.exports = router;
