require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { sendRemindersForWindow } = require('./reminders');

(async () => {
  try {
    await sendRemindersForWindow(24);
    await sendRemindersForWindow(1);
    console.log('Reminder run complete.');
  } catch (e) {
    console.error('Reminder run failed:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
