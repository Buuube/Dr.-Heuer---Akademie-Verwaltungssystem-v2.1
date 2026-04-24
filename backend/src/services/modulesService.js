const { sql, connectDB } = require('../db/db');

async function getModulesFromDB(courseId) {
  const pool = await connectDB();
  const request = pool.request();
  let query = `
    SELECT
      Module.ModuleCodeId,
      Module.ExternalModuleCode,
      Module.Name,
      Module.CourseId,
      Module.TeachingFormatId,
      Module.Content,
      Module.EstimatedCost,
      Module.Duration,
      Module.HasInternship,
      Module.DailyTeachingHours,
      Module.IsDeleted,
      Course.Name AS CourseName,
      SUM(CASE WHEN ModuleExam.ExamType = 'Internal' THEN 1 ELSE 0 END) AS InternExamCount,
      SUM(CASE WHEN ModuleExam.ExamType = 'External' THEN 1 ELSE 0 END) AS ExternExamCount
    FROM Module
    LEFT JOIN Course ON Module.CourseId = Course.CourseId
    LEFT JOIN ModuleExam ON ModuleExam.ModuleCodeId = Module.ModuleCodeId AND ModuleExam.IsDeleted = 0
    WHERE Module.IsDeleted = 0
  `;
  if (courseId) {
    request.input('CourseId', sql.Int, Number(courseId));
    query += ` AND Module.CourseId = @CourseId`;
  }
  query += `
    GROUP BY
      Module.ModuleCodeId,
      Module.ExternalModuleCode,
      Module.Name,
      Module.CourseId,
      Module.TeachingFormatId,
      Module.Content,
      Module.EstimatedCost,
      Module.Duration,
      Module.HasInternship,
      Module.DailyTeachingHours,
      Module.IsDeleted,
      Course.Name
  `;
  const result = await request.query(query);
  return result.recordset;
}

async function createModuleInDB(moduleData) {
  const pool = await connectDB();

  const dicklength = await pool
    .request()
    .query('SELECT COUNT(*) AS total FROM Module');

  const total = dicklength.recordset[0].total;
  console.log(total);

  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, String(total))
    .input(
      'ExternalModuleCode',
      sql.VarChar,
      moduleData.ExternalModuleCode ?? null
    )
    .input('Name', sql.VarChar, moduleData.Name ?? null)
    .input('CourseId', sql.Int, moduleData.CourseId)
    .input('TeachingFormatId', sql.Int, moduleData.TeachingFormatId)
    .input('Content', sql.NVarChar, moduleData.Content ?? '')
    .input('EstimatedCost', sql.Decimal, moduleData.EstimatedCost ?? null)
    .input('Duration', sql.VarChar, moduleData.Duration ?? null).query(`
      INSERT INTO Module (ModuleCodeId, ExternalModuleCode, Name, CourseId, TeachingFormatId, Content, EstimatedCost, Duration)
      OUTPUT INSERTED.*
      VALUES (@ModuleCodeId, @ExternalModuleCode, @Name, @CourseId, @TeachingFormatId, @Content, @EstimatedCost, @Duration)
      `);
  return result.recordset[0];
}

async function updateModuleInDB(id, moduleData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, id)
    .input('Name', sql.VarChar, moduleData.Name ?? null)
    .input(
      'ExternalModuleCode',
      sql.VarChar,
      moduleData.ExternalModuleCode ?? null
    )
    .input('CourseId', sql.Int, moduleData.CourseId)
    .input('TeachingFormatId', sql.Int, moduleData.TeachingFormatId)
    .input('Content', sql.NVarChar, moduleData.Content ?? '')
    .input(
      'EstimatedCost',
      sql.Decimal(10, 2),
      moduleData.EstimatedCost ?? null
    )
    .input('Duration', sql.VarChar, moduleData.Duration ?? null)
    .input('HasInternship', sql.Bit, moduleData.HasInternship ?? false)
    .input(
      'DailyTeachingHours',
      sql.Decimal,
      moduleData.DailyTeachingHours ?? null
    ).query(`
        UPDATE Module SET
          Name               = @Name,
          ExternalModuleCode = @ExternalModuleCode,
          CourseId           = @CourseId,
          TeachingFormatId   = @TeachingFormatId,
          Content            = @Content,
          EstimatedCost      = @EstimatedCost,
          Duration           = @Duration,
          HasInternship      = @HasInternship,
          DailyTeachingHours = @DailyTeachingHours
        OUTPUT INSERTED.*
        WHERE ModuleCodeId = @ModuleCodeId
      `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteModuleFromDB(id) {
  const pool = await connectDB();

  // Nur aktive (nicht gelöschte) Buchungen prüfen
  const check = await pool.request().input('ModuleCodeId', sql.VarChar, id)
    .query(`
      SELECT COUNT(*) AS cnt
      FROM BookingModule bm
      JOIN Booking b ON bm.BookingId = b.BookingId
      WHERE bm.ModuleCodeId = @ModuleCodeId
        AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
    `);

  if (check.recordset[0].cnt > 0) {
    const err = new Error('Module has bookings');
    err.code = 'HAS_BOOKINGS';
    throw err;
  }

  await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, id)
    .query(
      `UPDATE Module SET IsDeleted = 1 WHERE ModuleCodeId = @ModuleCodeId`
    );

  return true;
}

async function getExamsFromDB(moduleCode) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .query(
      `SELECT * FROM ModuleExam 
       WHERE ModuleCodeId = @ModuleCodeId 
         AND IsDeleted = 0`
    );
  return result.recordset;
}

async function createExamInDB(moduleCode, examData) {
  const pool = await connectDB();

  const countResult = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .query(
      'SELECT COUNT(*) AS total FROM ModuleExam WHERE ModuleCodeId = @ModuleCodeId'
    );
  const sequence = countResult.recordset[0].total + 1;

  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .input('ExamName', sql.VarChar, examData.ExamName)
    .input('ExamType', sql.VarChar, examData.ExamType)
    .input('MinimumScore', sql.Int, examData.MinimumScore ?? null)
    .input('SequenceNumber', sql.Int, sequence).query(`
      INSERT INTO ModuleExam (ModuleCodeId, ExamName, ExamType, MinimumScore, SequenceNumber)
      OUTPUT INSERTED.*
      VALUES (@ModuleCodeId, @ExamName, @ExamType, @MinimumScore, @SequenceNumber)
    `);
  return result.recordset[0];
}

async function deleteExamFromDB(moduleCode, examId) {
  const pool = await connectDB();
  await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .input('ModuleExamId', sql.Int, examId)
    .query(
      `UPDATE ModuleExam SET IsDeleted = 1 WHERE ModuleExamId = @ModuleExamId AND ModuleCodeId = @ModuleCodeId`
    );
  return true;
}

async function updateExamInDB(moduleCode, examId, examData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .input('ModuleExamId', sql.Int, examId)
    .input('ExamName', sql.VarChar, examData.ExamName)
    .input('ExamType', sql.VarChar, examData.ExamType)
    .input('MinimumScore', sql.Int, examData.MinimumScore ?? null).query(`
        UPDATE ModuleExam SET
          ExamName = @ExamName,
          ExamType = @ExamType,
          MinimumScore = @MinimumScore
        OUTPUT INSERTED.*
        WHERE ModuleExamId = @ModuleExamId AND ModuleCodeId = @ModuleCodeId
      `);
  return result.recordset[0];
}

module.exports = {
  getModulesFromDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleFromDB,
  getExamsFromDB,
  createExamInDB,
  deleteExamFromDB,
  updateExamInDB,
};
