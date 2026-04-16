const { sql, connectDB } = require('../db/db');

async function getPostalCodeByCodeFromDB(code) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('Code', sql.Char, code)
    .query(`SELECT * FROM PostalCode WHERE Code = @Code`);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

module.exports = { getPostalCodeByCodeFromDB };
