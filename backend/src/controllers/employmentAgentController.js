const {
  getEmploymentAgentsFromDB,
} = require('../services/employmentAgentService');

async function getEmploymentAgents(req, res) {
  try {
    const agents = await getEmploymentAgentsFromDB();
    res.json(agents);
  } catch (err) {
    console.error('getEmploymentAgents error:', err);
    res.status(500).json({ error: `${err}` });
  }
}

module.exports = { getEmploymentAgents };
