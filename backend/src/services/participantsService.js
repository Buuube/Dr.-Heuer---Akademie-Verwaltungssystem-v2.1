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
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ParticipantId', sql.Int, id)
    .input('LastName', sql.VarChar, participantData.lastName)
    .input('FirstName', sql.VarChar, participantData.firstName ?? null)
    .input('Street', sql.VarChar, participantData.street)
    .input('HouseNumber', sql.VarChar, participantData.houseNumber)
    .input('PostalCodeId', sql.Int, participantData.postalCodeId)
    .input('Email', sql.VarChar, participantData.email ?? null)
    .input('Phone', sql.VarChar, participantData.phone ?? null)
    .input('Mobile', sql.VarChar, participantData.mobile ?? null)
    .input('Fax', sql.VarChar, participantData.fax ?? null)
    .input('IsSelfPayer', sql.Bit, participantData.isSelfPayer ?? false)
    .input('IsEmployed', sql.Bit, participantData.isEmployed ?? false)
    .input('Employer', sql.VarChar, participantData.employer ?? null)
    .input('LocationId', sql.Int, participantData.locationId ?? null).query(`
      UPDATE Participant SET
        LastName             = @LastName,
        FirstName            = @FirstName,
        Street               = @Street,
        HouseNumber          = @HouseNumber,
        PostalCodeId         = @PostalCodeId,
        Email                = @Email,
        Phone                = @Phone,
        Mobile               = @Mobile,
        Fax                  = @Fax,
        IsSelfPayer          = @IsSelfPayer,
        IsEmployed           = @IsEmployed,
        Employer             = @Employer,
        LocationId           = @LocationId
      OUTPUT INSERTED.*
      WHERE ParticipantId = @ParticipantId
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteParticipantFromDB(id) {
  const pool = await connectDB();
  // DB-Trigger TR_Participant_PreventDelete übernimmt die Integritätsprüfung
  // Er wirft einen Fehler wenn Bookings oder AbsenceDays existieren
  const result = await pool
    .request()
    .input('ParticipantId', sql.Int, id)
    .query(
      `UPDATE Participant SET IsDeleted = 1 WHERE ParticipantId = @ParticipantId`
    );
  if (result.rowsAffected[0] === 0) {
    const err = new Error('Participant not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return true;
}

module.exports = {
  getParticipantsFromDB,
  createParticipantInDB,
  updateParticipantInDB,
  deleteParticipantFromDB,
};
