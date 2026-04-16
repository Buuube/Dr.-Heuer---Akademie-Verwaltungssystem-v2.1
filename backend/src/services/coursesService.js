// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function getCoursesFromDB() {
  // TODO: replace mock data with real DB query when database is ready
  // await connectDB();
  // const result = await sql.query`SELECT * FROM Courses`;
  // return result.recordset;

  return [
    {
      CourseId: 1,
      ApprovalNumber: 'ZERT-2024-001',
      Name: 'Grundkurs Buchhaltung',
      Advisor: 'Max Mustermann',
      ApprovalStartDate: '2024-01-01',
      ApprovalEndDate: '2026-12-31',
      DailyTeachingHours: 8,
      CostPerTeachingUnit: 45.0,
      TeachingUnitDuration: 45,
    },
    {
      CourseId: 2,
      ApprovalNumber: 'ZERT-2024-002',
      Name: 'Excel für Einsteiger',
      Advisor: 'Erika Musterfrau',
      ApprovalStartDate: '2024-03-01',
      ApprovalEndDate: '2026-03-01',
      DailyTeachingHours: 6,
      CostPerTeachingUnit: 35.0,
      TeachingUnitDuration: 45,
    },
  ];
}

async function createCourseInDB(courseData) {
  // TODO: replace with real DB insert
  // await connectDB();
  // const result = await sql.query`
  //   INSERT INTO Courses (CertificationNumber, Title, CostPerUnit, ApprovalStartDate, ApprovalEndDate)
  //   OUTPUT INSERTED.*
  //   VALUES (${courseData.certificationNumber}, ${courseData.title}, ${courseData.costPerUnit},
  //           ${courseData.approvalStartDate}, ${courseData.approvalEndDate})
  // `;
  // return result.recordset[0];

  return { id: Date.now(), ...courseData };
}

async function updateCourseInDB(id, courseData) {
  // TODO: replace with real DB update
  // await connectDB();
  // const result = await sql.query`
  //   UPDATE Courses SET Title = ${courseData.title}, CostPerUnit = ${courseData.costPerUnit},
  //   ApprovalStartDate = ${courseData.approvalStartDate}, ApprovalEndDate = ${courseData.approvalEndDate}
  //   OUTPUT INSERTED.*
  //   WHERE Id = ${id}
  // `;
  // if (result.recordset.length === 0) return null;
  // return result.recordset[0];

  return { id: Number(id), ...courseData };
}

async function deleteCourseFromDB(id) {
  // TODO: replace with real DB delete
  // await connectDB();
  // check for assigned modules first — throw a typed error if found
  // const check = await sql.query`SELECT COUNT(*) AS cnt FROM Modules WHERE CourseId = ${id}`;
  // if (check.recordset[0].cnt > 0) {
  //   const err = new Error('Course has modules');
  //   err.code = 'HAS_MODULES';
  //   throw err;
  // }
  // await sql.query`DELETE FROM Courses WHERE Id = ${id}`;

  return true;
}

module.exports = {
  getCoursesFromDB,
  createCourseInDB,
  updateCourseInDB,
  deleteCourseFromDB,
};
