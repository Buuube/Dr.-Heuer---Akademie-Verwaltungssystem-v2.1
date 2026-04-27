const {
  createCancellationReasonInDB,
} = require('../services/cancellationReasonService');

async function createCancellationReason(req, res) {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description ist erforderlich' });
    }
    const reason = await createCancellationReasonInDB(description);
    res.status(201).json(reason);
  } catch (err) {
    console.error('createCancellationReason error:', err);
    res.status(500).json({ error: 'Failed to create cancellation reason' });
  }
}

module.exports = { createCancellationReason };
