const { sql, connectDB } = require('../db/db');

async function createCancellationReasonInDB(description) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('Description', sql.NVarChar, description).query(`
      INSERT INTO CancellationReason (Description)
      OUTPUT INSERTED.*
      VALUES (@Description)
    `);
  return result.recordset[0];
}

module.exports = { createCancellationReasonInDB };
