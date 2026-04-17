const { connectDB } = require('../db/db');

async function getEmploymentAgentsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT * FROM EmploymentAgent
  `);
  return result.recordset;
}

module.exports = { getEmploymentAgentsFromDB };
