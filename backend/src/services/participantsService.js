// this file contains the functions that talk to the database
// the controller calls these functions and waits for the data
// when the database is ready, uncomment the real queries and delete the mock data

const { sql, connectDB } = require('../db/db');

async function getParticipantsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT p.*, pc.Code AS PostalCode, pc.City
    FROM Participant p
    JOIN PostalCode pc ON p.PostalCodeId = pc.PostalCodeId
    WHERE p.IsDeleted = 0 OR p.IsDeleted IS NULL
  `);
  return result.recordset;
}

async function createParticipantInDB(participantData) {
  const pool = await connectDB(); // open the connection

  const result = await pool
    .request()
    .input('Salutation', sql.Bit, participantData.salutation) // 0 = Herr, 1 = Frau
    .input('LastName', sql.VarChar, participantData.lastName) // required field
    .input('FirstName', sql.VarChar, participantData.firstName) // optional in DB but usually provided
    .input('Street', sql.VarChar, participantData.street) // required field
    .input('HouseNumber', sql.VarChar, participantData.houseNumber) // required field
    .input('PostalCodeId', sql.Int, participantData.postalCodeId) // FK to PostalCode table
    .input('DateOfBirth', sql.Date, participantData.dateOfBirth) // required field
    .input('PlaceOfBirth', sql.VarChar, participantData.placeOfBirth) // optional
    .input('Email', sql.VarChar, participantData.email) // optional
    .input('Phone', sql.VarChar, participantData.phone) // optional
    .input('Mobile', sql.VarChar, participantData.mobile) // optional
    .input('IsEmployed', sql.Bit, participantData.isEmployed) // optional, 0 or 1
    .query(`
      INSERT INTO Participant (
        Salutation, LastName, FirstName,
        Street, HouseNumber, PostalCodeId,
        DateOfBirth, PlaceOfBirth,
        Email, Phone, Mobile, IsEmployed
      )
      OUTPUT INSERTED.*
      VALUES (
        @Salutation, @LastName, @FirstName,
        @Street, @HouseNumber, @PostalCodeId,
        @DateOfBirth, @PlaceOfBirth,
        @Email, @Phone, @Mobile, @IsEmployed
      )
    `);
  // OUTPUT INSERTED.* returns the full created row including the auto-generated ParticipantId

  return result.recordset[0]; // return the newly created participant row
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

// export functions here so the controller can use them
module.exports = {
  getParticipantsFromDB,
  createParticipantInDB,
  updateParticipantInDB,
  deleteParticipantFromDB,
};
