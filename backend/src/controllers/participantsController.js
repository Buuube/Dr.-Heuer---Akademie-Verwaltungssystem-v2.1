const { getParticipantsFromDB } = require('../services/participantsService');

async function getParticipants(req, res) {
  try {
    const participants = await getStudentsFromDB();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}

module.exports = { getParticipants };
