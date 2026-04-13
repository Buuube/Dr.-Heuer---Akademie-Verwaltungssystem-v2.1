// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real query and delete the mock data

// ↓ database connection tools - needed when the real query is uncommented
const { sql, connectDB } = require('../db/db');

// ↓ define database functions here
async function getParticipantsFromDB() {
  // TODO: replace mock data with real DB query when database is ready
  // await connectDB(); // open the connection to SQL Server
  // const result = await sql.query`SELECT * FROM Participants`; // run the query
  // return result.recordset; // return the rows as an array

  // mock data - matches the exact structure the frontend expects
  // delete this return block when the real query above is uncommented
  return [
    {
      id: 1,
      salutation: 0, // 0 = Herr, 1 = Frau
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@example.com',
      phone: '0211 123456',
      mobile: '0175 123456',
      postalCodeId: '40210',
      isEmployed: true,
    },
    {
      id: 2,
      salutation: 1,
      firstName: 'Max',
      lastName: 'Müller',
      email: 'max.mueller@example.com',
      phone: '0211 654321',
      mobile: '0175 654321',
      postalCodeId: '40213',
      isEmployed: false,
    },
    {
      id: 3,
      salutation: 0,
      firstName: 'Elena',
      lastName: 'Petrov',
      email: 'elena.petrov@example.com',
      phone: '0211 111222',
      mobile: '0175 111222',
      postalCodeId: '40219',
      isEmployed: true,
    },
  ];
}

// ↓ export functions here so the controller can use them
module.exports = { getParticipantsFromDB };