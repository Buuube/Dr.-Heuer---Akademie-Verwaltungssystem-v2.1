// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function createBookingInDB(bookingData) {
  // TODO: replace with real DB insert
  // await connectDB();
  // const result = await sql.query`
  //   INSERT INTO Bookings (ParticipantId, StartDate, EndDate)
  //   OUTPUT INSERTED.*
  //   VALUES (${bookingData.participantId}, ${bookingData.startDate}, ${bookingData.endDate})
  // `;
  // return result.recordset[0];

  return { id: Date.now(), ...bookingData };
}

async function updateBookingInDB(id, bookingData) {
  // TODO: replace with real DB update — updates planned vs actual dates, or session changes
  // await connectDB();
  // const result = await sql.query`
  //   UPDATE Bookings SET StartDate = ${bookingData.startDate}, EndDate = ${bookingData.endDate},
  //   ModuleSessionId = ${bookingData.moduleSessionId}
  //   OUTPUT INSERTED.*
  //   WHERE Id = ${id}
  // `;
  // if (result.recordset.length === 0) return null;
  // return result.recordset[0];

  return { id: Number(id), ...bookingData };
}

// adds modules to an existing booking — either individual moduleIds or a macroPackageId
async function addBookingItemsInDB(bookingId, { moduleIds, macroPackageId }) {
  // TODO: replace with real DB logic
  // await connectDB();
  //
  // if macroPackageId is provided, look up all ModuleCodes in the package
  // then insert one BookingItem row per module:
  // for (const moduleId of resolvedModuleIds) {
  //   await sql.query`INSERT INTO BookingItems (BookingId, ModuleId) VALUES (${bookingId}, ${moduleId})`;
  // }
  //
  // check booking exists first:
  // const booking = await sql.query`SELECT Id FROM Bookings WHERE Id = ${bookingId}`;
  // if (booking.recordset.length === 0) {
  //   const err = new Error('Booking not found');
  //   err.code = 'BOOKING_NOT_FOUND';
  //   throw err;
  // }

  const resolvedModuleIds = moduleIds ?? [];
  return {
    bookingId: Number(bookingId),
    addedModuleIds: resolvedModuleIds,
    macroPackageId: macroPackageId ?? null,
  };
}

async function deleteBookingFromDB(id, cancellationReasonId) {
  // TODO: replace with real DB delete
  // await connectDB();
  //
  // if cancellationReasonId is provided, store it before deleting (or mark as cancelled)
  // if (cancellationReasonId) {
  //   await sql.query`UPDATE Bookings SET CancellationReasonId = ${cancellationReasonId} WHERE Id = ${id}`;
  // }
  // await sql.query`DELETE FROM Bookings WHERE Id = ${id}`;
  //
  // if no row was affected, throw typed error:
  // const err = new Error('Booking not found');
  // err.code = 'BOOKING_NOT_FOUND';
  // throw err;

  return true;
}

module.exports = {
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
};
