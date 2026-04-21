const express = require('express');
const router = express.Router();
const {
  getModuleSessions,
  createModuleSession,
} = require('../controllers/moduleSessionController');

router.get('/', getModuleSessions);
router.post('/', createModuleSession);

module.exports = router;
