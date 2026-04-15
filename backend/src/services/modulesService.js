// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function createModuleInDB(moduleData) {
  // TODO: replace with real DB insert
  // await connectDB();
  // const result = await sql.query`
  //   INSERT INTO Modules (CourseId, ModuleCode, Title, DurationHours, CostPerUnit)
  //   OUTPUT INSERTED.*
  //   VALUES (${moduleData.courseId}, ${moduleData.moduleCode}, ${moduleData.title},
  //           ${moduleData.durationHours}, ${moduleData.costPerUnit})
  // `;
  // return result.recordset[0];

  return { id: Date.now(), ...moduleData };
}

async function updateModuleInDB(id, moduleData) {
  // TODO: replace with real DB update
  // await connectDB();
  // const result = await sql.query`
  //   UPDATE Modules SET Title = ${moduleData.title}, DurationHours = ${moduleData.durationHours},
  //   CostPerUnit = ${moduleData.costPerUnit}
  //   OUTPUT INSERTED.*
  //   WHERE Id = ${id}
  // `;
  // if (result.recordset.length === 0) return null;
  // return result.recordset[0];

  return { id: Number(id), ...moduleData };
}

async function deleteModuleFromDB(id) {
  // TODO: replace with real DB delete
  // await connectDB();
  // check for bookings first — throw a typed error if found
  // const check = await sql.query`SELECT COUNT(*) AS cnt FROM BookingItems WHERE ModuleId = ${id}`;
  // if (check.recordset[0].cnt > 0) {
  //   const err = new Error('Module has bookings');
  //   err.code = 'HAS_BOOKINGS';
  //   throw err;
  // }
  // await sql.query`DELETE FROM Modules WHERE Id = ${id}`;

  return true;
}
async function getModulesFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query('SELECT * FROM Module');
  return result.recordset;
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
