// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function getParticipantsFromDB() {
  // TODO: replace mock data with real DB query when database is ready
  // await connectDB();
  // const result = await sql.query`SELECT * FROM Participants`;
  // return result.recordset;

  return [
    {
      id: 1,
      salutation: 0,
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

async function createParticipantInDB(participantData) {
  // TODO: replace with real DB insert
  // await connectDB();
  // const result = await sql.query`
  //   INSERT INTO Participants (Salutation, FirstName, LastName, Email, Phone, Mobile, PostalCodeId, IsEmployed)
  //   OUTPUT INSERTED.*
  //   VALUES (${participantData.salutation}, ${participantData.firstName}, ${participantData.lastName},
  //           ${participantData.email}, ${participantData.phone}, ${participantData.mobile},
  //           ${participantData.postalCodeId}, ${participantData.isEmployed})
  // `;
  // return result.recordset[0];

  return { id: Date.now(), ...participantData };
}

async function updateParticipantInDB(id, participantData) {
  // TODO: replace with real DB update
  // await connectDB();
  // const result = await sql.query`
  //   UPDATE Participants SET FirstName = ${participantData.firstName}, LastName = ${participantData.lastName},
  //   Email = ${participantData.email}, Phone = ${participantData.phone}, Mobile = ${participantData.mobile},
  //   PostalCodeId = ${participantData.postalCodeId}, IsEmployed = ${participantData.isEmployed}
  //   OUTPUT INSERTED.*
  //   WHERE Id = ${id}
  // `;
  // if (result.recordset.length === 0) return null;
  // return result.recordset[0];

  return { id: Number(id), ...participantData };
}

async function deleteParticipantFromDB(id) {
  // TODO: replace with real DB delete
  // await connectDB();
  // check for bookings or absence days — throw a typed error if found
  // const check = await sql.query`
  //   SELECT
  //     (SELECT COUNT(*) FROM Bookings WHERE ParticipantId = ${id}) AS bookings,
  //     (SELECT COUNT(*) FROM AbsenceDay WHERE ParticipantId = ${id}) AS absences
  // `;
  // const { bookings, absences } = check.recordset[0];
  // if (bookings > 0 || absences > 0) {
  //   const err = new Error('Participant has bookings');
  //   err.code = 'HAS_BOOKINGS';
  //   throw err;
  // }
  // await sql.query`DELETE FROM Participants WHERE Id = ${id}`;

  return true;
}

module.exports = {
  getParticipantsFromDB,
  createParticipantInDB,
  updateParticipantInDB,
  deleteParticipantFromDB,
};
