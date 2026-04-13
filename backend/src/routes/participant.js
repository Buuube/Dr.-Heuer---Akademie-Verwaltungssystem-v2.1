// this file defines which functions handle which HTTP requests for participants
// it receives requests from server.js and calls the correct controller function
// currently only handles GET requests - POST, PUT, DELETE will be added when the database is ready

const express = require('express');

// a router is a mini version of the express app - it only handles routes for one specific topic
const router = express.Router();

// ↓ import controller functions here
const { getParticipants } = require('../controllers/participantsController');

// routes connect a URL + request type to a controller function
// router.get means "when someone requests data from this URL, run this function"
// router.post would mean "when someone sends new data to this URL, run this function"
router.get('/', getParticipants);

// make this router available to server.js which mounts it at /api/participants
module.exports = router;