// this file defines which functions handle which HTTP requests for participants
// it receives requests from server.js and calls the correct controller function

const express = require('express');
const router = express.Router();

const {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} = require('../controllers/participantsController');

router.get('/', getParticipants);
router.post('/', createParticipant);
router.put('/:id', updateParticipant);
router.delete('/:id', deleteParticipant);

module.exports = router;
