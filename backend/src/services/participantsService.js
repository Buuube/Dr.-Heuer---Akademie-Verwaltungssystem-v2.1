// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real query and delete the mock data

// ↓ database connection tools - needed when the real query is uncommented
const { sql, connectDB } = require('../db/db');

// ↓ define database functions here
async function getParticipantsFromDB() {
  // TODO: replace mock data with real DB query when database is ready
  await connectDB(); // open the connection to SQL Server
  const result = await sql.query`SELECT * FROM Participants`; // run the query
  return result.recordset; // return the rows as an array
}
// export functions here so the controller can use them
module.exports = { getParticipantsFromDB };
