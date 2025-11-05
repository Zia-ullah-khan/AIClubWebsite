const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { sendEmail } = require('./email');
const { getDb } = require('./db');

function fmtDate(date) {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return date.toISOString();
  }
}

async function main() {
  const to = process.env.TEST_TO;
  if (!to) {
    console.error('No recipient provided. Set TEST_TO in .env.');
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error('DB not available');
    process.exit(1);
  }

  // Find the next upcoming event, starting from the beginning of today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const event = await db.collection('events').find({ startAt: { $gte: startOfDay } }).sort({ startAt: 1 }).limit(1).next();

  if (!event) {
    console.error('No upcoming events found in the database.');
    process.exit(1);
  }

  const subject = `🚀 You're Invited: AI in Education with Special Guests!`;
  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(event.startAt));

  const html = `
    <p>Hey AI enthusiasts!</p>
    <p>We are excited to invite you to our next exciting meeting, this time focusing on <strong>"${event.title}"</strong>!</p>
    <p>
      Join us on <strong>${dayOfWeek} from ${event.details.time}</strong> in the <strong>${event.details.location}</strong>.
      ${event.details.zoom ? `(You can also join us on Zoom: <a href="${event.details.zoom}">Click here</a>).` : ''}
    </p>
    <p>This week, we are thrilled to host two special guest speakers from Montgomery College's Digital Learning Center (Rockville):</p>
    <ul>
      <li><strong>Daniel Umana</strong> (Digital Learning Center Manager)</li>
      <li><strong>Joyce Khouri</strong> (Digital Learning Center Specialist)</li>
    </ul>
    <p>Learn tricks and guidance to leverage AI for your studies and learning process. Come discover how these tools are being used right here at MC and what the future of education looks like.</p>
    <p>Here’s what’s waiting for you:</p>
    <ul>
      <li><strong>Guest Speaker Presentations:</strong> Hear from Daniel and Joyce about the latest trends in educational AI.</li>
      <li><strong>Interactive Demos:</strong> See how AI tools can (and can't) help with studying, writing, and research.</li>
      <li><strong>Group Discussion & Q&A:</strong> Ask our speakers your burning questions and share your own experiences with AI in your classes.</li>
    </ul>
    <p><strong>Snacks Provided!</strong> Bring your curiosity and a friend!</p>
    <p>See you Thursday!</p>
    <hr>
    <p>
      Best Regards,<br>
      Zia Ullah Khan<br>
      Vice President, AI Club
    </p>
    <p>
      <a href="https://www.instagram.com/aiclubmc">Instagram Page</a> | 
      <a href="https://ig.me/j/AbZsn6_3nQ4vZ_jy">Instagram Group Chat</a> | 
      <a href="https://discord.gg/R3CeAWBXks">Discord Server</a>
    </p>
    `;
  const text = `Hey AI enthusiasts! We are excited to invite you to our next exciting meeting, this time focusing on "${event.title}"! Join us on ${dayOfWeek} from ${event.details.time} in ${event.details.location}.`;

  try {
    const info = await sendEmail({ to, subject, text, html });
    console.log(`Reminder for "${event.title}" sent to ${to}. Message ID:`, info.messageId || '(unknown)');
  } catch (e) {
    console.error('Failed to send email:', e && e.message ? e.message : e);
    process.exit(1);
  } finally {
    // Close the database connection if your db.js exposes a close function
    const { closeDb } = require('./db');
    if (closeDb) {
      await closeDb();
    }
  }
}

main();
