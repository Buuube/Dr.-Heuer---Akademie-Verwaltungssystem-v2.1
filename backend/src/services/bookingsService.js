const { sql, connectDB } = require('../db/db');

async function getBookingsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT 
      b.*,
      p.FirstName + ' ' + p.LastName AS ParticipantName,
      (
        SELECT STRING_AGG(bm.ModuleCodeId, ',')
        FROM BookingModule bm
        WHERE bm.BookingId = b.BookingId
      ) AS ModuleCodes
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
    .input('LocationId', sql.Int, bookingData.locationId ?? null)
    .input('Duration', sql.VarChar, bookingData.duration ?? null)
    .input('StartTerm', sql.VarChar, bookingData.startTerm ?? null).query(`
      INSERT INTO Booking (
        ParticipantId, IsSigned, PlannedStartDate, ActualStartDate,
        PlannedEndDate, ActualEndDate, BookingType, EndReason,
        EducationalGoal, MonthlyRate, Remarks, LocationId,
        Duration, StartTerm
      )
      OUTPUT INSERTED.*
      VALUES (
        @ParticipantId, @IsSigned, @PlannedStartDate, @ActualStartDate,
        @PlannedEndDate, @ActualEndDate, @BookingType, @EndReason,
        @EducationalGoal, @MonthlyRate, @Remarks, @LocationId,
        @Duration, @StartTerm
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
    .input('Duration', sql.VarChar, bookingData.duration ?? null)
    .input('StartTerm', sql.VarChar, bookingData.startTerm ?? null).query(`
      UPDATE Booking SET
        PlannedStartDate = @PlannedStartDate,
        ActualStartDate  = @ActualStartDate,
        PlannedEndDate   = @PlannedEndDate,
        ActualEndDate    = @ActualEndDate,
        Remarks          = @Remarks,
        MonthlyRate      = @MonthlyRate,
        LocationId       = @LocationId,
        EducationalGoal  = @EducationalGoal,
        Duration         = @Duration,
        StartTerm        = @StartTerm
      OUTPUT INSERTED.*
      WHERE BookingId = @BookingId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function getBookingByIdFromDB(id) {
  const pool = await connectDB();

  const bookingResult = await pool.request().input('BookingId', sql.Int, id)
    .query(`
      SELECT 
        b.*,
        p.FirstName + ' ' + p.LastName AS ParticipantName,
        l.Name AS LocationName
      FROM Booking b
      LEFT JOIN Participant p ON b.ParticipantId = p.ParticipantId
      LEFT JOIN Location l ON b.LocationId = l.LocationId
      WHERE b.BookingId = @BookingId
    `);

  if (bookingResult.recordset.length === 0) return null;
  const booking = bookingResult.recordset[0];

  const modulesResult = await pool.request().input('BookingId', sql.Int, id)
    .query(`
      SELECT 
        bm.BookingModuleId,
        bm.ModuleCodeId,
        bm.ModuleSessionId,
        bm.AttemptNumber,
        bm.SeatNumber,
        m.Name AS ModuleName,
        m.CourseId,
        c.Name AS CourseName,
        ms.StartDate AS SessionStartDate,
        ms.EndDate AS SessionEndDate
      FROM BookingModule bm
      LEFT JOIN Module m ON bm.ModuleCodeId = m.ModuleCodeId
      LEFT JOIN Course c ON m.CourseId = c.CourseId
      LEFT JOIN ModuleSession ms ON bm.ModuleSessionId = ms.ModuleSessionId
      WHERE bm.BookingId = @BookingId
    `);

  booking.Modules = modulesResult.recordset;
  return booking;
}

async function getBookingsByModuleFromDB(moduleCodeId) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCodeId).query(`
      SELECT 
        b.*,
        p.FirstName + ' ' + p.LastName AS ParticipantName
      FROM Booking b
      JOIN BookingModule bm ON b.BookingId = bm.BookingId
      JOIN Participant p ON b.ParticipantId = p.ParticipantId
      WHERE bm.ModuleCodeId = @ModuleCodeId
        AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
    `);
  return result.recordset;
}

async function addBookingItemsInDB(bookingId, items) {
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

  await pool
    .request()
    .input('BookingId', sql.Int, bookingId)
    .query(`DELETE FROM BookingModule WHERE BookingId = @BookingId`);

  for (const item of items) {
    await pool
      .request()
      .input('BookingId', sql.Int, bookingId)
      .input('ModuleCodeId', sql.VarChar, item.moduleCodeId)
      .input('ModuleSessionId', sql.Int, item.moduleSessionId ?? null)
      .input('AttemptNumber', sql.Int, 0).query(`
        INSERT INTO BookingModule (BookingId, ModuleCodeId, ModuleSessionId, AttemptNumber)
        VALUES (@BookingId, @ModuleCodeId, @ModuleSessionId, @AttemptNumber)
      `);
  }

  return { bookingId: Number(bookingId), addedItems: items };
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
  getBookingByIdFromDB,
  getBookingsByModuleFromDB,
  createBookingInDB,
  updateBookingInDB,
  addBookingItemsInDB,
  deleteBookingFromDB,
};
