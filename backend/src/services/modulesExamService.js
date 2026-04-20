const { sql, connectDB } = require('../db/db');

function toDBType(type) {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower === 'intern') return 'Internal';
  if (lower === 'extern') return 'External';
  return lower;
}

function toFrontendType(type) {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower === 'internal') return 'intern';
  if (lower === 'external') return 'extern';
  return lower;
}

async function getExamsByModule(moduleCode) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode).query(`
      SELECT * FROM ModuleExam
      WHERE ModuleCodeId = @ModuleCodeId
      ORDER BY SequenceNumber
    `);
  return result.recordset.map((exam) => ({
    ...exam,
    ExamType: toFrontendType(exam.ExamType),
  }));
}

async function createExam(moduleCode, data) {
  const pool = await connectDB();
  await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, moduleCode)
    .input('ExamType', sql.VarChar, toDBType(data.ExamType))
    .input('SequenceNumber', sql.Int, data.SequenceNumber)
    .input('ExamName', sql.VarChar, data.ExamName)
    .input('MinimumScore', sql.Int, data.MinimumScore ?? null).query(`
      INSERT INTO ModuleExam (ModuleCodeId, ExamType, SequenceNumber, ExamName, MinimumScore)
      VALUES (@ModuleCodeId, @ExamType, @SequenceNumber, @ExamName, @MinimumScore)
    `);
  return { message: 'Exam created' };
}

async function updateExam(examId, data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleExamId', sql.Int, examId)
    .input('ExamType', sql.VarChar, toDBType(data.ExamType))
    .input('SequenceNumber', sql.Int, data.SequenceNumber)
    .input('ExamName', sql.VarChar, data.ExamName)
    .input('MinimumScore', sql.Int, data.MinimumScore ?? null).query(`
      UPDATE ModuleExam SET
        ExamType       = @ExamType,
        SequenceNumber = @SequenceNumber,
        ExamName       = @ExamName,
        MinimumScore   = @MinimumScore
      WHERE ModuleExamId = @ModuleExamId
    `);
  if (result.rowsAffected[0] === 0) return null;
  return { message: 'Exam updated' };
}

async function deleteExam(examId) {
  const pool = await connectDB();
  await pool
    .request()
    .input('ModuleExamId', sql.Int, examId)
    .query(`DELETE FROM ModuleExam WHERE ModuleExamId = @ModuleExamId`);
  return { message: 'Exam deleted' };
}

module.exports = { getExamsByModule, createExam, updateExam, deleteExam };
