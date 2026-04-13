const { sql, connectDB } = require('../db/db');

async function getParticipantsFromDB() {
  // TODO: replace with real DB query when database is ready
  await connectDB();
  const result = await sql.query`SELECT * FROM Students`;
  return result.recordset;
}

module.exports = { createParticipantInDB };
