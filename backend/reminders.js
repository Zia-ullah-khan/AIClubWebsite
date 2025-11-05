const { getDb } = require('./db');
const { sendEmail } = require('./email');
const cron = require('node-cron');

function fmtDate(date) {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return date.toISOString();
  }
}

async function sendAnnouncementEmail(event, users) {
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
    <p>
      This is an automated message sent to all AI Club members. If you wish to contact us, please create a new email thread. Thanks!
    </p>
    `;
  const text = `Hey AI enthusiasts! We are excited to invite you to our next exciting meeting, this time focusing on "${event.title}"! Join us on ${dayOfWeek} from ${event.details.time} in ${event.details.location}.`;

  // Send one-by-one to keep things simple and avoid exposing the mailing list
  for (const user of users) {
    try {
      await sendEmail({ to: user.email, subject, html, text });
    } catch (e) {
      console.error('Failed to send to', user.email, e && e.message ? e.message : e);
    }
  }
}

async function sendWeeklyReminders() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Only run on Monday (1) and Thursday (4)
  if (dayOfWeek !== 1 && dayOfWeek !== 4) {
    return;
  }

  // Find the next event happening on or after today
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const event = await db.collection('events').find({ startAt: { $gte: startOfDay } }).sort({ startAt: 1 }).limit(1).next();

  if (!event) return; // No upcoming events

  const reminders = db.collection('reminders');
  const reminderType = dayOfWeek === 1 ? 'monday-announcement' : 'thursday-reminder';

  const alreadySent = await reminders.findOne({ eventId: event._id, type: reminderType });
  if (alreadySent) return;

  // Logic to ensure we only send for the current week's event
  const eventDate = new Date(event.startAt);
  const msInDay = 1000 * 60 * 60 * 24;
  const daysUntilEvent = (eventDate.getTime() - now.getTime()) / msInDay;

  // If it's Monday, send if the event is within the next ~6 days (Mon-Sun)
  // If it's Thursday, send if the event is within the next ~3 days (Thu-Sun)
  const shouldSend = 
    (dayOfWeek === 1 && daysUntilEvent < 6) || 
    (dayOfWeek === 4 && daysUntilEvent < 3);

  if (!shouldSend) return;

  const usersCollName = process.env.MONGO_COLL || 'checkins';
  const users = await db.collection(usersCollName).find({ email: { $exists: true, $ne: '' } }).toArray();
  if (users.length === 0) return;

  await sendAnnouncementEmail(event, users);

  await reminders.insertOne({ eventId: event._id, type: reminderType, sentAt: new Date() });
  console.log(`Sent ${reminderType} for event ${event.title}`);
}

async function sendWednesdayReminder() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  // Find the next event happening on or after today
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const event = await db.collection('events').find({ startAt: { $gte: startOfDay } }).sort({ startAt: 1 }).limit(1).next();

  if (!event) return; // No upcoming events

  const reminders = db.collection('reminders');
  const reminderType = 'wednesday-reminder';

  // Check if a reminder for this event has already been sent this week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Go back to the last Sunday
  weekStart.setHours(0, 0, 0, 0);

  const alreadySent = await reminders.findOne({ eventId: event._id, type: reminderType, sentAt: { $gte: weekStart } });
  if (alreadySent) return;

  const usersCollName = process.env.MONGO_COLL || 'checkins';
  const users = await db.collection(usersCollName).find({ email: { $exists: true, $ne: '' } }).toArray();
  if (users.length === 0) return;

  await sendAnnouncementEmail(event, users);

  await reminders.insertOne({ eventId: event._id, type: reminderType, sentAt: new Date() });
  console.log(`Sent ${reminderType} for event ${event.title}`);
}

async function sendHourlyReminder() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const until = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now

  const events = await db.collection('events').find({ startAt: { $gte: now, $lte: until } }).toArray();
  if (events.length === 0) return;

  const reminders = db.collection('reminders');
  const usersCollName = process.env.MONGO_COLL || 'checkins';
  const users = await db.collection(usersCollName).find({ email: { $exists: true, $ne: '' } }).toArray();

  for (const ev of events) {
    const alreadySent = await reminders.findOne({ eventId: ev._id, type: 'hourly-reminder' });
    if (alreadySent) continue;

    await sendAnnouncementEmail(ev, users);

    await reminders.insertOne({ eventId: ev._id, type: 'hourly-reminder', sentAt: new Date() });
    console.log(`Sent 1-hour reminder for event ${ev.title}`);
  }
}

function scheduleReminders() {
  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await sendWeeklyReminders();
      await sendHourlyReminder();
    } catch (e) {
      console.error('Reminder job failed:', e && e.message ? e.message : e);
    }
  });

  // Schedule for every Wednesday at 1:30 PM
  cron.schedule('30 14 * * 3', async () => {
    try {
      await sendWednesdayReminder();
    } catch (e) {
      console.error('Wednesday reminder job failed:', e && e.message ? e.message : e);
    }
  });

  console.log('Reminder scheduler started (every 30 minutes)');
  console.log('Added Wednesday 1:30 PM reminder schedule.');
}

module.exports = { scheduleReminders, sendWeeklyReminders, sendHourlyReminder, sendWednesdayReminder };
