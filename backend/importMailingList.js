const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getDb, closeDb } = require('./db');

const CSV_PATH = path.resolve(__dirname, 'mailing-list.csv');

async function importMailingList() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Error: mailing-list.csv not found at ${CSV_PATH}`);
    console.error('Please download the Google Sheet as a CSV and place it in the backend directory.');
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error('Database not available. Cannot import mailing list.');
    return;
  }

  const usersCollName = process.env.MONGO_COLL || 'checkins';
  const collection = db.collection(usersCollName);
  const newEntries = [];

  console.log('Starting CSV import...');

  fs.createReadStream(CSV_PATH)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase() // Normalizes headers like '  Emails  ' -> 'emails'
    }))
    .on('data', (row) => {
      const email = row['emails'] || row['email']; // Handle 'Emails' or 'email' column
      const name = row['names'] || row['name'];   // Handle 'Names' or 'name' column

      if (email && email.includes('@')) {
        newEntries.push({
          name: name || '',
          email: email.trim(),
        });
      }
    })
    .on('end', async () => {
      if (newEntries.length === 0) {
        console.log('No new entries to import.');
        await closeDb();
        return;
      }

      console.log(`Found ${newEntries.length} valid entries in CSV. Syncing with database...`);

      const bulkOps = newEntries.map(entry => ({
        updateOne: {
          filter: { email: entry.email },
          update: { $set: { name: entry.name, subscribed: true } }, // Add a 'subscribed' flag
          upsert: true,
        },
      }));

      try {
        const result = await collection.bulkWrite(bulkOps);
        console.log('Database sync complete.');
        console.log(`- ${result.upsertedCount} new members added.`);
        console.log(`- ${result.modifiedCount} existing members updated.`);
      } catch (e) {
        console.error('Error during database sync:', e.message);
      } finally {
        await closeDb();
      }
    });
}

importMailingList();
