const { connectDB } = require('../db/db');

async function getRoomsFromDB() {
  const pool = await connectDB();
  const result = await pool
    .request()
    .query('SELECT RoomId, Description FROM Room');
  return result.recordset;
}

module.exports = { getRoomsFromDB };
