// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function getModulesFromDB(courseId) {
  // TODO: replace mock data with real DB query when database is ready
  // await connectDB();
  // let query = 'SELECT * FROM Modules';
  // if (courseId) query += ` WHERE CourseId = ${Number(courseId)}`;
  // const result = await sql.query(query);
  // return result.recordset;

  const modules = [
    {
      id: 1,
      courseId: 1,
      moduleCode: 'MOD-001',
      title: 'Einführung',
      durationHours: 8,
      costPerUnit: 40.0,
    },
    {
      id: 2,
      courseId: 1,
      moduleCode: 'MOD-002',
      title: 'Vertiefung',
      durationHours: 16,
      costPerUnit: 40.0,
    },
    {
      id: 3,
      courseId: 2,
      moduleCode: 'MOD-003',
      title: 'Excel Basics',
      durationHours: 4,
      costPerUnit: 30.0,
    },
  ];

  // filter by courseId if provided
  if (courseId) {
    return modules.filter((m) => m.courseId === Number(courseId));
  }
  return modules;
}

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

module.exports = {
  getModulesFromDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleFromDB,
};
