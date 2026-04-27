const { connectDB } = require('../db/db');

async function getPostalCode(req, res) {
  const { code } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT PostalCodeId AS Id, Code, City
      FROM PostalCode
      WHERE Code = '${code}'
    `);
    if (result.recordset.length === 0) return res.status(404).json(null);
    res.json(result.recordset[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getPostalCode };
