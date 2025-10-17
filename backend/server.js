const express = require('express');
const { CLUB_DATA } = require('./data');
const checkInRouter = require('./checkIn');
const app = express();
const PORT = process.env.PORT || 3001;

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
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.153:3000')
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
app.get('/api/club-data', (req, res) => {
    res.json(CLUB_DATA);
});

// Mount check-in routes
app.use(checkInRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});