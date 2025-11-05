const express = require('express');
const { getClubData } = require('./data');
const checkInRouter = require('./checkIn');
const app = express();
const PORT = process.env.PORT || 3001;
const { getDb } = require('./db');
const { ObjectId } = require('mongodb');
const { scheduleReminders } = require('./reminders');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Basic CORS for local dev (Next.js dev server on 3000)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.153:3000,https://aiclubwebsite.fly.dev,http://aiclubwebsite.fly.dev')
        .split(',')
        .map((s) => s.trim());
    if (origin && allowed.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.get('/', (req, res) => {
    res.send('Server is running');
});
app.get('/api/club-data', async (req, res) => {
    try {
        const data = await getClubData();
        res.json(data);
    } catch (e) {
        console.error('Error building club data:', e && e.message ? e.message : e);
        res.status(500).json({ ok: false, error: 'Failed to load club data' });
    }
});

// Get a single event by id
app.get('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        if (!db) return res.status(503).json({ ok: false, error: 'Database unavailable' });
        const ev = await db.collection('events').findOne({ _id: new ObjectId(id) });
        if (!ev) return res.status(404).json({ ok: false, error: 'Event not found' });
        // Normalize id to string for client
        ev.id = ev._id.toString();
        res.json({ ok: true, event: ev });
    } catch (e) {
        console.error('Error fetching event:', e && e.message ? e.message : e);
        res.status(400).json({ ok: false, error: 'Invalid event id' });
    }
});

// Mount check-in routes
app.use(checkInRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        if (process.env.ENABLE_REMINDERS === 'true') {
            scheduleReminders();
        }
    } catch (e) {
        console.error('Failed to start reminder scheduler:', e && e.message ? e.message : e);
    }
});