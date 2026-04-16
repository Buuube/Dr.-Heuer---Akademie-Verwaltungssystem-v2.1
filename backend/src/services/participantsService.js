const { sql, connectDB } = require('../db/db');

async function getParticipantsFromDB() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT 
      p.*,
      pc.Code AS PostalCode,
      pc.City,
      l.Name AS LocationName
    FROM Participant p
    LEFT JOIN PostalCode pc ON p.PostalCodeId = pc.PostalCodeId
    LEFT JOIN Location l ON p.LocationId = l.LocationId
    WHERE p.IsDeleted = 0 OR p.IsDeleted IS NULL
  `);
  return result.recordset;
}

async function createParticipantInDB(participantData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('Salutation', sql.Bit, participantData.salutation ?? null)
    .input('LastName', sql.VarChar, participantData.lastName)
    .input('FirstName', sql.VarChar, participantData.firstName ?? null)
    .input('Street', sql.VarChar, participantData.street)
    .input('HouseNumber', sql.VarChar, participantData.houseNumber)
    .input('PostalCodeId', sql.Int, participantData.postalCodeId)
    .input('DateOfBirth', sql.Date, participantData.dateOfBirth)
    .input('PlaceOfBirth', sql.VarChar, participantData.placeOfBirth ?? null)
    .input('Email', sql.VarChar, participantData.email ?? null)
    .input('Phone', sql.VarChar, participantData.phone ?? null)
    .input('Mobile', sql.VarChar, participantData.mobile ?? null)
    .input('Fax', sql.VarChar, participantData.fax ?? null)
    .input('IsSelfPayer', sql.Bit, participantData.isSelfPayer ?? false)
    .input(
      'AgencyCustomerNumber',
      sql.VarChar,
      participantData.agencyCustomerNumber ?? null
    )
    .input(
      'EmploymentAgentId',
      sql.Int,
      participantData.employmentAgentId ?? null
    )
    .input('IsEmployed', sql.Bit, participantData.isEmployed ?? false)
    .input('Employer', sql.VarChar, participantData.employer ?? null)
    .input('LocationId', sql.Int, participantData.locationId ?? null).query(`
      INSERT INTO Participant (
        Salutation, LastName, FirstName, Street, HouseNumber, PostalCodeId,
        DateOfBirth, PlaceOfBirth, Email, Phone, Mobile, Fax,
        IsSelfPayer, AgencyCustomerNumber, EmploymentAgentId,
        IsEmployed, Employer, LocationId
      )
      OUTPUT INSERTED.*
      VALUES (
        @Salutation, @LastName, @FirstName, @Street, @HouseNumber, @PostalCodeId,
        @DateOfBirth, @PlaceOfBirth, @Email, @Phone, @Mobile, @Fax,
        @IsSelfPayer, @AgencyCustomerNumber, @EmploymentAgentId,
        @IsEmployed, @Employer, @LocationId
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
