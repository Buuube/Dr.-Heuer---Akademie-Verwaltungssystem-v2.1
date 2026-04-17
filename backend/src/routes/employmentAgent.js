const express = require('express');
const router = express.Router();
const {
  getEmploymentAgents,
} = require('../controllers/employmentAgentController');

router.get('/', getEmploymentAgents);

module.exports = router;
