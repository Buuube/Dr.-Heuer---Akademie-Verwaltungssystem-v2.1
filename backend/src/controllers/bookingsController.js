// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back
// it never talks to the database directly — that is the service's job

const {
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
  getBookingsFromDB,
} = require('../services/bookingsService');

async function createBooking(req, res) {
  try {
    const bookingData = req.body;
    const newBooking = await createBookingInDB(bookingData);
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('createBooking error:', err); // ← hinzufügen
    res.status(500).json({ error: 'Failed to create booking' });
  }
}

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    const updatedBooking = await updateBookingInDB(id, bookingData);
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
}

async function getBookings(req, res) {
  try {
    const bookings = await getBookingsFromDB();
    res.json(bookings);
  } catch (err) {
    console.error('getBookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

// POST /api/bookings/:id/items
// body: { moduleIds: [1, 2, 3] } for manual selection
// body: { macroPackageId: 7 }    for automated package selection
async function addBookingItems(req, res) {
  try {
    const { id } = req.params;
    const { moduleIds, macroPackageId } = req.body;
    const result = await addBookingItemsInDB(id, { moduleIds, macroPackageId });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(500).json({ error: 'Failed to add booking items' });
  }
}

async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const { cancellationReasonId } = req.body;
    await deleteBookingFromDB(id, cancellationReasonId);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(500).json({ error: 'Failed to delete booking' });
  }
}

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  addBookingItems,
  deleteBooking,
};
