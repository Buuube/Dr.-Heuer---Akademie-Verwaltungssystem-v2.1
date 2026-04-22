const { sql, connectDB } = require('../db/db');

async function getModuleSessionsFromDB({ moduleCodeId, startDate, endDate }) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCodeId)
    .input('StartDate', sql.Date, startDate)
    .input('EndDate', sql.Date, endDate).query(`
      SELECT *
      FROM ModuleSession
      WHERE ModuleCodeId = @ModuleCodeId
        AND StartDate >= @StartDate
        AND EndDate <= @EndDate
        AND (IsDeleted = 0 OR IsDeleted IS NULL)
    `);
  return result.recordset;
}

async function createModuleSessionInDB(sessionData) {
  const pool = await connectDB();

  // DailyTeachingHours berechnen aus Start- und Endzeit
  const start = sessionData.teachingStartTime; // "08:00"
  const end = sessionData.teachingEndTime; // "16:00"
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const dailyHours = (eh * 60 + em - (sh * 60 + sm)) / 60;

  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, sessionData.moduleCodeId)
    .input('StartDate', sql.Date, sessionData.startDate)
    .input('EndDate', sql.Date, sessionData.endDate)
    .input('TeachingStartTime', sql.VarChar, sessionData.teachingStartTime)
    .input('TeachingEndTime', sql.VarChar, sessionData.teachingEndTime)
    .input('RoomId', sql.Int, sessionData.roomId)
    .input('Cost', sql.Decimal, sessionData.cost)
    .input('RegistrationDeadline', sql.Date, sessionData.registrationDeadline)
    .input('DailyTeachingHours', sql.Decimal, dailyHours).query(`
      INSERT INTO ModuleSession (
        ModuleCodeId, StartDate, EndDate,
        TeachingStartTime, TeachingEndTime,
        RoomId, Cost, RegistrationDeadline, DailyTeachingHours
      )
      OUTPUT INSERTED.*
      VALUES (
        @ModuleCodeId, @StartDate, @EndDate,
        @TeachingStartTime, @TeachingEndTime,
        @RoomId, @Cost, @RegistrationDeadline, @DailyTeachingHours
      )
    `);
  return result.recordset[0];
}

module.exports = {
  getModuleSessionsFromDB,
  createModuleSessionInDB,
};
