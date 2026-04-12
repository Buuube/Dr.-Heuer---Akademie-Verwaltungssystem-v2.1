const { sql, connectDB } = require('../db/db');

async function getStudentsFromDB() {
  // TODO: replace with real DB query when database is ready
  // await connectDB();
  // const result = await sql.query`SELECT * FROM Students`;
  // return result.recordset;

  return [
    { id: 1, name: 'Anna Schmidt' },
    { id: 2, name: 'Max Müller' },
    { id: 3, name: 'Elena Petrov' }
  ];
}

module.exports = { getStudentsFromDB };