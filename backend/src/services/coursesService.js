const { sql, connectDB } = require('../db/db');

async function getCoursesFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT *
    FROM Course
  `);
  return result.recordset;
}

async function createCourseInDB(courseData) {
  const pool = await connectDB();

  const result = await pool
    .request()
    .input('ApprovalNumber', sql.VarChar, courseData.ApprovalNumber)
    .input('Name', sql.VarChar, courseData.Name)
    .input('Advisor', sql.VarChar, courseData.Advisor || null)
    .input('ApprovalStartDate', sql.Date, courseData.ApprovalStartDate || null)
    .input('ApprovalEndDate', sql.Date, courseData.ApprovalEndDate || null)
    .input(
      'CostPerTeachingUnit',
      sql.Decimal(10, 2),
      courseData.CostPerTeachingUnit
        ? parseFloat(courseData.CostPerTeachingUnit)
        : null
    )
    .input(
      'TeachingUnitDuration',
      sql.Int,
      courseData.TeachingUnitDuration
        ? parseInt(courseData.TeachingUnitDuration)
        : null
    )
    .input(
      'DailyTeachingHours',
      sql.Decimal(5, 2),
      courseData.DailyTeachingHours
        ? parseFloat(courseData.DailyTeachingHours)
        : null
    ).query(`
      INSERT INTO Course (
        ApprovalNumber, Name, Advisor,
        ApprovalStartDate, ApprovalEndDate,
        CostPerTeachingUnit, TeachingUnitDuration, DailyTeachingHours
      )
      OUTPUT INSERTED.*
      VALUES (
        @ApprovalNumber, @Name, @Advisor,
        @ApprovalStartDate, @ApprovalEndDate,
        @CostPerTeachingUnit, @TeachingUnitDuration, @DailyTeachingHours
      )
    `);

  return result.recordset[0];
}

async function updateCourseInDB(id, courseData) {
  const pool = await connectDB();

  const result = await pool
    .request()
    .input('CourseId', sql.Int, id)
    .input('ApprovalNumber', sql.VarChar, courseData.ApprovalNumber)
    .input('Name', sql.VarChar, courseData.Name)
    .input('Advisor', sql.VarChar, courseData.Advisor)
    .input('ApprovalStartDate', sql.Date, courseData.ApprovalStartDate)
    .input('ApprovalEndDate', sql.Date, courseData.ApprovalEndDate)
    .input(
      'CostPerTeachingUnit',
      sql.Decimal(10, 2),
      courseData.CostPerTeachingUnit
    )
    .input('TeachingUnitDuration', sql.Int, courseData.TeachingUnitDuration)
    .input(
      'DailyTeachingHours',
      sql.Decimal(5, 2),
      courseData.DailyTeachingHours
    ).query(`
      UPDATE Course SET
        ApprovalNumber = @ApprovalNumber,
        Name = @Name,
        Advisor = @Advisor,
        ApprovalStartDate = @ApprovalStartDate,
        ApprovalEndDate = @ApprovalEndDate,
        CostPerTeachingUnit = @CostPerTeachingUnit,
 
        TeachingUnitDuration = @TeachingUnitDuration,
        DailyTeachingHours = @DailyTeachingHours
      OUTPUT INSERTED.*
      WHERE CourseId = @CourseId
    `);

  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteCourseFromDB(id) {
  const pool = await connectDB();

  // check for assigned modules first — throw a typed error if found
  const check = await pool
    .request()
    .input('CourseId', sql.Int, id)
    .query(`SELECT COUNT(*) AS cnt FROM Module WHERE CourseId = @CourseId`);

  if (check.recordset[0].cnt > 0) {
    const err = new Error('Course has modules');
    err.code = 'HAS_MODULES';
    throw err;
  }

  // soft delete — set IsDeleted = 1 instead of removing the row
  await pool
    .request()
    .input('CourseId', sql.Int, id)
    .query(`UPDATE Course SET IsDeleted = 1 WHERE CourseId = @CourseId`);

  return true;
}

module.exports = {
  getCoursesFromDB,
  createCourseInDB,
  updateCourseInDB,
  deleteCourseFromDB,
};
