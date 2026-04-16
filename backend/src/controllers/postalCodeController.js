const { getPostalCodeByCodeFromDB } = require('../services/postalCodeService');

async function getPostalCode(req, res) {
  try {
    const { code } = req.params;
    const postalCode = await getPostalCodeByCodeFromDB(code);
    if (!postalCode) {
      return res.status(404).json({ error: 'Postal code not found' });
    }
    res.json(postalCode);
  } catch (err) {
    console.error('getPostalCode error:', err);
    res.status(500).json({ error: 'Failed to fetch postal code' });
  }
}

module.exports = { getPostalCode };
