const { connectDB } = require('../db/db');

async function getLocationsFromDB() {
  const pool = await connectDB();
  const result = await pool
    .request()
    .query('SELECT LocationId, Name FROM Location');
  return result.recordset;
}

module.exports = { getLocationsFromDB };
