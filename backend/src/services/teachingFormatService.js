const { sql, connectDB } = require('../db/db');

async function getTeachingFormatsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query('SELECT * FROM TeachingFormat');
  return result.recordset;
}

module.exports = { getTeachingFormatsFromDB };
