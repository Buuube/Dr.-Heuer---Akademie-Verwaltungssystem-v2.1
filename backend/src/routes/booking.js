// Route zur booking
// this file defines which functions handle which HTTP requests for bookings
// it receives requests from server.js and calls the correct controller function

const express = require('express');
const router = express.Router();

const {
  getBookings,
  getBookingById, // ← neu
  createBooking,
  updateBooking,
  addBookingItems,
  deleteBooking,
} = require('../controllers/bookingsController');

router.get('/', getBookings);
router.get('/:id', getBookingById); // ← neu
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/items', addBookingItems);
router.delete('/:id', deleteBooking);

module.exports = router;
