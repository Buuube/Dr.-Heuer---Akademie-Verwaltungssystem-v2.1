const {
  getModuleSessionsFromDB,
  createModuleSessionInDB,
} = require('../services/moduleSessionService');

async function getModuleSessions(req, res) {
  try {
    const { moduleCodeId, startDate, endDate } = req.query;
    if (!moduleCodeId || !startDate || !endDate) {
      return res
        .status(400)
        .json({
          error: 'moduleCodeId, startDate und endDate sind Pflichtfelder',
        });
    }
    const sessions = await getModuleSessionsFromDB({
      moduleCodeId,
      startDate,
      endDate,
    });
    res.json(sessions);
  } catch (err) {
    console.error('getModuleSessions error:', err);
    res.status(500).json({ error: 'Failed to fetch module sessions' });
  }
}

async function createModuleSession(req, res) {
  try {
    const session = await createModuleSessionInDB(req.body);
    res.status(201).json(session);
  } catch (err) {
    console.error('createModuleSession error:', err);
    res.status(500).json({ error: 'Failed to create module session' });
  }
}

module.exports = { getModuleSessions, createModuleSession };
