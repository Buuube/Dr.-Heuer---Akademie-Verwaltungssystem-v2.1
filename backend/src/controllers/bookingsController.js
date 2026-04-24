const {
  getBookingsFromDB,
  getBookingByIdFromDB,
  getBookingsByModuleFromDB,
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
} = require('../services/bookingsService');

async function getBookings(req, res) {
  try {
    const bookings = await getBookingsFromDB();
    res.json(bookings);
  } catch (err) {
    console.error('getBookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await getBookingByIdFromDB(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('getBookingById error:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
}

async function getBookingsByModule(req, res) {
  try {
    const { moduleCodeId } = req.params;
    const bookings = await getBookingsByModuleFromDB(moduleCodeId);
    res.json(bookings);
  } catch (err) {
    console.error('getBookingsByModule error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings for module' });
  }
}

async function createBooking(req, res) {
  try {
    const bookingData = req.body;
    const newBooking = await createBookingInDB(bookingData);
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('createBooking error:', err);
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

async function addBookingItems(req, res) {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const result = await addBookingItemsInDB(id, items);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.error('addBookingItems error:', err);
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
  getBookingById,
  getBookingsByModule,
  createBooking,
  updateBooking,
  addBookingItems,
  deleteBooking,
};
