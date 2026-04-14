// Route zur booking
// this file defines which functions handle which HTTP requests for bookings
// it receives requests from server.js and calls the correct controller function

const express = require('express');
const router = express.Router();

const {
  createBooking,
  updateBooking,
  addBookingItems,
  deleteBooking,
} = require('../controllers/bookingsController');

router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/items', addBookingItems); // add modules (single or package) to a booking
router.delete('/:id', deleteBooking);

module.exports = router;
