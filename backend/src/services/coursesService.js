const { sql, connectDB } = require('../db/db');

async function getCoursesFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query('SELECT * FROM Course');
  return result.recordset;
}

async function createCourseInDB(courseData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('CertificationNumber', sql.VarChar, courseData.certificationNumber)
    .input('Title', sql.NVarChar, courseData.title)
    .input('CostPerUnit', sql.Decimal, courseData.costPerUnit)
    .input('ApprovalStartDate', sql.Date, courseData.approvalStartDate)
    .input('ApprovalEndDate', sql.Date, courseData.approvalEndDate).query(`
      INSERT INTO Course (CertificationNumber, Title, CostPerUnit, ApprovalStartDate, ApprovalEndDate)
      OUTPUT INSERTED.*
      VALUES (@CertificationNumber, @Title, @CostPerUnit, @ApprovalStartDate, @ApprovalEndDate)
    `);
  return result.recordset[0];
}

async function updateCourseInDB(id, courseData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('CourseId', sql.Int, id)
    .input('Title', sql.NVarChar, courseData.title)
    .input('CostPerUnit', sql.Decimal, courseData.costPerUnit)
    .input('ApprovalStartDate', sql.Date, courseData.approvalStartDate)
    .input('ApprovalEndDate', sql.Date, courseData.approvalEndDate).query(`
      UPDATE Course SET
        Title = @Title,
        CostPerUnit = @CostPerUnit,
        ApprovalStartDate = @ApprovalStartDate,
        ApprovalEndDate = @ApprovalEndDate
      OUTPUT INSERTED.*
      WHERE CourseId = @CourseId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteCourseFromDB(id) {
  const pool = await connectDB();
  const check = await pool
    .request()
    .input('CourseId', sql.Int, id)
    .query(`SELECT COUNT(*) AS cnt FROM Module WHERE CourseId = @CourseId`);
  if (check.recordset[0].cnt > 0) {
    const err = new Error('Course has modules');
    err.code = 'HAS_MODULES';
    throw err;
  }
  await pool
    .request()
    .input('CourseId', sql.Int, id)
    .query(`DELETE FROM Course WHERE CourseId = @CourseId`);
  return true;
}

module.exports = {
  getCoursesFromDB,
  createCourseInDB,
  updateCourseInDB,
  deleteCourseFromDB,
};
