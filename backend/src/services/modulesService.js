const { sql, connectDB } = require('../db/db');

async function getModulesFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT m.*, c.Name AS CourseName
    FROM Module m
    LEFT JOIN Course c ON m.CourseId = c.CourseId
    WHERE m.IsDeleted = 0 OR m.IsDeleted IS NULL
  `);
  return result.recordset;
}

async function createModuleInDB(moduleData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleData.moduleCodeId)
    .input('Name', sql.VarChar, moduleData.name ?? null)
    .input('CourseId', sql.Int, moduleData.courseId)
    .input('TeachingFormatId', sql.Int, moduleData.teachingFormatId)
    .input('Content', sql.NVarChar, moduleData.content ?? '')
    .input('EstimatedCost', sql.Decimal, moduleData.estimatedCost ?? null)
    .input('Duration', sql.VarChar, moduleData.duration ?? null).query(`
      INSERT INTO Module (ModuleCodeId, Name, CourseId, TeachingFormatId, Content, EstimatedCost, Duration)
      OUTPUT INSERTED.*
      VALUES (@ModuleCodeId, @Name, @CourseId, @TeachingFormatId, @Content, @EstimatedCost, @Duration)
    `);
  return result.recordset[0];
}

async function updateModuleInDB(id, moduleData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, id)
    .input('Name', sql.VarChar, moduleData.name ?? null)
    .input('EstimatedCost', sql.Decimal, moduleData.estimatedCost ?? null)
    .input('Duration', sql.VarChar, moduleData.duration ?? null)
    .input('Content', sql.NVarChar, moduleData.content ?? '').query(`
      UPDATE Module SET
        Name          = @Name,
        EstimatedCost = @EstimatedCost,
        Duration      = @Duration,
        Content       = @Content
      OUTPUT INSERTED.*
      WHERE ModuleCodeId = @ModuleCodeId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteModuleFromDB(id) {
  const pool = await connectDB();
  const check = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, id)
    .query(
      `SELECT COUNT(*) AS cnt FROM BookingModule WHERE ModuleCodeId = @ModuleCodeId`
    );
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

async function updateExamInDB(moduleCode, examId, examData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .input('ModuleExamId', sql.Int, examId)
    .input('ExamName', sql.VarChar, examData.examName)
    .input('ExamType', sql.VarChar, examData.examType).query(`
      UPDATE ModuleExam SET
        ExamName = @ExamName,
        ExamType = @ExamType
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
  updateExamInDB,
};
