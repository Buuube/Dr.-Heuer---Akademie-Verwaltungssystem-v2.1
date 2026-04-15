const { sql, connectDB } = require('../db/db');

async function createBookingInDB(bookingData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ParticipantId', sql.Int, bookingData.participantId)
    .input('IsSigned', sql.Bit, bookingData.isSigned ?? false)
    .input('PlannedStartDate', sql.Date, bookingData.plannedStartDate)
    .input('PlannedEndDate', sql.Date, bookingData.plannedEndDate)
    .input('BookingType', sql.VarChar, bookingData.bookingType)
    .input('EndReason', sql.VarChar, bookingData.endReason ?? '').query(`
      INSERT INTO Booking (ParticipantId, IsSigned, PlannedStartDate, PlannedEndDate, BookingType, EndReason)
      OUTPUT INSERTED.*
      VALUES (@ParticipantId, @IsSigned, @PlannedStartDate, @PlannedEndDate, @BookingType, @EndReason)
    `);
  return result.recordset[0];
}

async function updateBookingInDB(id, bookingData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('BookingId', sql.Int, id)
    .input('PlannedStartDate', sql.Date, bookingData.plannedStartDate)
    .input('ActualStartDate', sql.Date, bookingData.actualStartDate)
    .input('PlannedEndDate', sql.Date, bookingData.plannedEndDate)
    .input('ActualEndDate', sql.Date, bookingData.actualEndDate)
    .input('Remarks', sql.NVarChar, bookingData.remarks)
    .input('MonthlyRate', sql.Decimal, bookingData.monthlyRate)
    .input('LocationId', sql.Int, bookingData.locationId).query(`
      UPDATE Booking SET
        PlannedStartDate = @PlannedStartDate,
        ActualStartDate = @ActualStartDate,
        PlannedEndDate = @PlannedEndDate,
        ActualEndDate = @ActualEndDate,
        Remarks = @Remarks,
        MonthlyRate = @MonthlyRate,
        LocationId = @LocationId
      OUTPUT INSERTED.*
      WHERE BookingId = @BookingId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function addBookingItemsInDB(bookingId, { moduleIds, macroPackageId }) {
  const pool = await connectDB();

  // verify booking exists first
  const check = await pool
    .request()
    .input('BookingId', sql.Int, bookingId)
    .query(`SELECT BookingId FROM Booking WHERE BookingId = @BookingId`);
  if (check.recordset.length === 0) {
    const err = new Error('Booking not found');
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  // insert one BookingModule row per moduleId
  const resolvedModuleIds = moduleIds ?? [];
  for (const moduleCodeId of resolvedModuleIds) {
    await pool
      .request()
      .input('BookingId', sql.Int, bookingId)
      .input('ModuleCodeId', sql.VarChar, moduleCodeId)
      .input('AttemptNumber', sql.Int, 1).query(`
        INSERT INTO BookingModule (BookingId, ModuleCodeId, AttemptNumber)
        VALUES (@BookingId, @ModuleCodeId, @AttemptNumber)
      `);
  }

  return {
    bookingId: Number(bookingId),
    addedModuleIds: resolvedModuleIds,
    macroPackageId: macroPackageId ?? null,
  };
}

async function deleteBookingFromDB(id, cancellationReasonId) {
  const pool = await connectDB();

  if (cancellationReasonId) {
    await pool
      .request()
      .input('BookingId', sql.Int, id)
      .input('CancellationReasonId', sql.Int, cancellationReasonId).query(`
        UPDATE Booking SET CancellationReasonId = @CancellationReasonId
        WHERE BookingId = @BookingId
      `);
  }

  // soft delete — sets IsDeleted flag instead of removing the row
  const result = await pool.request().input('BookingId', sql.Int, id).query(`
      UPDATE Booking SET IsDeleted = 1
      WHERE BookingId = @BookingId
    `);

  if (result.rowsAffected[0] === 0) {
    const err = new Error('Booking not found');
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  return true;
}

async function getBookingsFromDB() {
  const pool = await connectDB();
  const result = await pool
    .request()
    .query('SELECT * FROM Booking WHERE IsDeleted = 0 OR IsDeleted IS NULL');
  return result.recordset;
}

module.exports = {
  getBookingsFromDB,
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
};
