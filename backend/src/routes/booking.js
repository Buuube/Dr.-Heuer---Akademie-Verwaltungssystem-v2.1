const express = require('express');
const router = express.Router();

const {
  getBookings,
  getBookingById,
  getBookingsByModule,
  createBooking,
  updateBooking,
  addBookingItems,
  deleteBooking,
} = require('../controllers/bookingsController');

router.get('/', getBookings);
router.get('/by-module/:moduleCodeId', getBookingsByModule);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/items', addBookingItems);
router.delete('/:id', deleteBooking);

module.exports = router;
