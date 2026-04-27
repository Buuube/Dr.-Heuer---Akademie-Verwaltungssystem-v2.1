const express = require('express');
const router = express.Router();
const {
  createCancellationReason,
} = require('../controllers/cancellationReasonController');

router.post('/', createCancellationReason);

module.exports = router;
