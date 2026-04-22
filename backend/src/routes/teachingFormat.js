const express = require('express');
const router = express.Router();
const {
  getTeachingFormats,
} = require('../controllers/teachingFormatController');

router.get('/', getTeachingFormats);

module.exports = router;
