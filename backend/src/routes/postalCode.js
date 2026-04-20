const express = require('express');
const router = express.Router();
const { getPostalCode } = require('../controllers/postalCodeController');

router.get('/:code', getPostalCode);

module.exports = router;
