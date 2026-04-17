const { sql, connectDB } = require('../db/db');

async function getBookingsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT 
      b.*,
      p.FirstName + ' ' + p.LastName AS ParticipantName
    FROM Booking b
    LEFT JOIN Participant p ON b.ParticipantId = p.ParticipantId
    WHERE b.IsDeleted = 0 OR b.IsDeleted IS NULL
  `);
  return result.recordset;
}

async function createBookingInDB(bookingData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ParticipantId', sql.Int, bookingData.participantId)
    .input('IsSigned', sql.Bit, bookingData.isSigned ?? false)
    .input('PlannedStartDate', sql.Date, bookingData.plannedStartDate)
    .input(
      'ActualStartDate',
      sql.Date,
      bookingData.actualStartDate ?? bookingData.plannedStartDate
    )
    .input('PlannedEndDate', sql.Date, bookingData.plannedEndDate)
    .input(
      'ActualEndDate',
      sql.Date,
      bookingData.actualEndDate ?? bookingData.plannedEndDate
    )
    .input('BookingType', sql.VarChar, bookingData.bookingType ?? '')
    .input('EndReason', sql.VarChar, bookingData.endReason ?? '')
    .input('EducationalGoal', sql.VarChar, bookingData.educationalGoal ?? null)
    .input('MonthlyRate', sql.Decimal, bookingData.monthlyRate ?? null)
    .input('Remarks', sql.NVarChar, bookingData.remarks ?? null)
    .input('LocationId', sql.Int, bookingData.locationId ?? null).query(`
      INSERT INTO Booking (
        ParticipantId, IsSigned, PlannedStartDate, ActualStartDate,
        PlannedEndDate, ActualEndDate, BookingType, EndReason,
        EducationalGoal, MonthlyRate, Remarks, LocationId
      )
      OUTPUT INSERTED.*
      VALUES (
        @ParticipantId, @IsSigned, @PlannedStartDate, @ActualStartDate,
        @PlannedEndDate, @ActualEndDate, @BookingType, @EndReason,
        @EducationalGoal, @MonthlyRate, @Remarks, @LocationId
      )
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
    .input('Remarks', sql.NVarChar, bookingData.remarks ?? null)
    .input('MonthlyRate', sql.Decimal, bookingData.monthlyRate ?? null)
    .input('LocationId', sql.Int, bookingData.locationId ?? null)
    .input('EducationalGoal', sql.VarChar, bookingData.educationalGoal ?? null)
    .query(`
      UPDATE Booking SET
        PlannedStartDate = @PlannedStartDate,
        ActualStartDate  = @ActualStartDate,
        PlannedEndDate   = @PlannedEndDate,
        ActualEndDate    = @ActualEndDate,
        Remarks          = @Remarks,
        MonthlyRate      = @MonthlyRate,
        LocationId       = @LocationId,
        EducationalGoal  = @EducationalGoal
      OUTPUT INSERTED.*
      WHERE BookingId = @BookingId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function addBookingItemsInDB(bookingId, { moduleIds, macroPackageId }) {
  const pool = await connectDB();
  const check = await pool
    .request()
    .input('BookingId', sql.Int, bookingId)
    .query(`SELECT BookingId FROM Booking WHERE BookingId = @BookingId`);
  if (check.recordset.length === 0) {
    const err = new Error('Booking not found');
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }
  const resolvedModuleIds = moduleIds ?? [];
  for (const moduleCodeId of resolvedModuleIds) {
    await pool
      .request()
      .input('BookingId', sql.Int, bookingId)
      .input('ModuleCodeId', sql.VarChar, moduleCodeId)
      .input('AttemptNumber', sql.Int, 0).query(`
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
  const result = await pool
    .request()
    .input('BookingId', sql.Int, id)
    .query(`UPDATE Booking SET IsDeleted = 1 WHERE BookingId = @BookingId`);
  if (result.rowsAffected[0] === 0) {
    const err = new Error('Booking not found');
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }
  return true;
}

module.exports = {
  getBookingsFromDB,
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
};
