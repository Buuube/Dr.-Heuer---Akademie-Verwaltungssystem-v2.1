const { getLocationsFromDB } = require('../services/locationService');

async function getLocations(req, res) {
  try {
    const locations = await getLocationsFromDB();
    res.json(locations);
  } catch (err) {
    console.error('getLocations error:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
}

module.exports = { getLocations };
