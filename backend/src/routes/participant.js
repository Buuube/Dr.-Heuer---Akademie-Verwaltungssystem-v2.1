//route to participant
const express = require('express');
const router = express.Router();
const { getParticipants } = require('../controllers/participantsController');

router.get('/', getParticipants);

module.exports = router;
