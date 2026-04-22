const { getRoomsFromDB } = require('../services/roomService');

async function getRooms(req, res) {
  try {
    const rooms = await getRoomsFromDB();
    res.json(rooms);
  } catch (err) {
    console.error('getRooms error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

module.exports = { getRooms };
