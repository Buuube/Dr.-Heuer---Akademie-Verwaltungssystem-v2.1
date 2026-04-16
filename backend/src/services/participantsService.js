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
  const pool = await connectDB();

  const result = await pool
    .request()
    .input('Salutation', sql.Bit, participantData.Salutation)
    .input('LastName', sql.VarChar, participantData.LastName)
    .input('FirstName', sql.VarChar, participantData.FirstName)
    .input('Street', sql.VarChar, participantData.Street)
    .input('HouseNumber', sql.VarChar, participantData.HouseNumber)
    .input('PostalCodeId', sql.Int, participantData.PostalCodeId || 3)
    .input('DateOfBirth', sql.Date, participantData.DateOfBirth)
    .input('PlaceOfBirth', sql.VarChar, participantData.PlaceOfBirth)
    .input('Email', sql.VarChar, participantData.Email)
    .input('Phone', sql.VarChar, participantData.Phone)
    .input('Mobile', sql.VarChar, participantData.Mobile)
    .input('Fax', sql.VarChar, participantData.Fax)
    .input('IsSelfPayer', sql.Bit, participantData.IsSelfPayer)
    .input(
      'AgencyCustomerNumber',
      sql.VarChar,
      participantData.AgencyCustomerNumber
    )
    .input(
      'EmploymentAgentId',
      sql.Int,
      participantData.EmploymentAgentId
        ? Number(participantData.EmploymentAgentId)
        : null
    )
    .input(
      'FirstContactDate',
      sql.Date,
      participantData.FirstContactDate || null
    )
    .input('ContactSource', sql.VarChar, participantData.ContactSource)
    .input('IsEmployed', sql.Bit, participantData.IsEmployed)
    .input(
      'EmploymentStartDate',
      sql.Date,
      participantData.EmploymentStartDate || null
    )
    .input('Employer', sql.VarChar, participantData.Employer).query(`
      INSERT INTO Participant (
        Salutation, LastName, FirstName,
        Street, HouseNumber, PostalCodeId,
        DateOfBirth, PlaceOfBirth,
        Email, Phone, Mobile, Fax,
        IsSelfPayer, AgencyCustomerNumber, EmploymentAgentId,
        FirstContactDate, ContactSource,
        IsEmployed, EmploymentStartDate, Employer
      )
      OUTPUT INSERTED.*
      VALUES (
        @Salutation, @LastName, @FirstName,
        @Street, @HouseNumber, @PostalCodeId,
        @DateOfBirth, @PlaceOfBirth,
        @Email, @Phone, @Mobile, @Fax,
        @IsSelfPayer, @AgencyCustomerNumber, @EmploymentAgentId,
        @FirstContactDate, @ContactSource,
        @IsEmployed, @EmploymentStartDate, @Employer
      )
    `);

  return result.recordset[0];
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
