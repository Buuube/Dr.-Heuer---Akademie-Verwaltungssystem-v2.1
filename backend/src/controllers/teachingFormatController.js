const {
  getTeachingFormatsFromDB,
} = require('../services/teachingFormatService');

async function getTeachingFormats(req, res) {
  try {
    const formats = await getTeachingFormatsFromDB();
    res.json(formats);
  } catch (err) {
    console.error('getTeachingFormats error:', err);
    res.status(500).json({ error: 'Failed to fetch teaching formats' });
  }
}

module.exports = { getTeachingFormats };
