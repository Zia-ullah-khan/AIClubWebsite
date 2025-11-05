require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

// Event on Nov 6, 2025, 4:00-5:00 PM America/New_York
const startAt = new Date('2025-11-06T16:00:00-05:00');
const endAt = new Date('2025-11-06T17:00:00-05:00');
const dateDisplay = '11/6/25';

const newEvent = {
    date: "NOV 6",
    dateDisplay,
    title: "AI in Education",
    description: "Join us to explore 'AI in Education' with guest speakers Daniel Umana and Joyce Khouri from Montgomery College's Digital Learning Center. Learn how to leverage AI for your studies with tricks, guidance, and interactive demos. The session includes presentations on the latest trends, a Q&A, and discussions on how AI is shaping the future of learning at MC.",
    details: {
        location: "Humanities Building, Room 312",
        time: "4:00 PM – 5:00 PM",
        zoom: "https://montgomerycollege.zoom.us/j/6904289092?pwd=a9FcuvJMjpDSgEQe9nZItYM6mqRsCa.1"
    },
    startAt,
    endAt,
    link: "/events"
};

async function addEvent() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Error: MONGO_URI is not defined in your .env file.');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB_NAME || 'aiclub');
        const eventsCollection = database.collection('events');

        console.log('Inserting new event into the database...');
        const result = await eventsCollection.insertOne(newEvent);
        console.log(`Successfully inserted event with ID: ${result.insertedId}`);

    } catch (err) {
        console.error('An error occurred while adding the event:', err);
    } finally {
        await client.close();
        console.log('Database connection closed.');
    }
}

addEvent();
