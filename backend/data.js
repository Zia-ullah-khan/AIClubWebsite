const { getDb } = require('./db');

const mission =
  "Empowering students across all disciplines with AI knowledge, skills, and confidence to transform their academic, professional, and personal lives.";

const whyJoin = [
  {
    title: "Study Smarter",
    detail:
      "Use AI tools to save time, master concepts faster, and manage your college workload.",
  },
  {
    title: "Stand Out",
    detail:
      "Build practical, résumé-boosting projects that give you a competitive edge.",
  },
  {
    title: "Lead the Conversation",
    detail:
      "Understand ethical, social, and professional implications of AI in your field.",
  },
];

async function getUpcomingEvents() {
  try {
    const db = await getDb();
    if (!db) return [];
    // Only project the fields we use on the frontend
    const docs = await db
      .collection('events')
      .find({})
      .project({ _id: 1, dateDisplay: 1, date: 1, title: 1, link: 1, startAt: 1 })
      .sort({ startAt: 1 })
      .toArray();
    // Normalize to include string id for frontend routing
    return docs.map((e) => ({
      id: e._id?.toString?.() || String(e._id),
      date: e.dateDisplay || e.date || 'TBA',
      title: e.title,
      link: e.link || '/events',
    }));
  } catch (err) {
    console.error('Failed to load events from DB:', err && err.message ? err.message : err);
    return [];
  }
}

async function getClubData() {
  const upcomingEvents = await getUpcomingEvents();
  return {
    mission,
    whyJoin,
    upcomingEvents,
  };
}

module.exports = { getClubData };