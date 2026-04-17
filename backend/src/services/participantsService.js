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
    .input('Salutation', sql.Bit, participantData.Salutation ?? false)
    .input('LastName', sql.VarChar, participantData.LastName || null)
    .input('FirstName', sql.VarChar, participantData.FirstName || null)
    .input('Street', sql.VarChar, participantData.Street || null)
    .input('HouseNumber', sql.VarChar, participantData.HouseNumber || null)
    .input(
      'PostalCodeId',
      sql.Int,
      Number(participantData.PostalCodeId) || null
    )
    .input('DateOfBirth', sql.Date, participantData.DateOfBirth || null)
    .input('PlaceOfBirth', sql.VarChar, participantData.PlaceOfBirth || null)
    .input('Email', sql.VarChar, participantData.Email || null)
    .input('Phone', sql.VarChar, participantData.Phone || null)
    .input('Mobile', sql.VarChar, participantData.Mobile || null)
    .input('Fax', sql.VarChar, participantData.Fax || null)
    .input('IsSelfPayer', sql.Bit, participantData.IsSelfPayer ?? false)
    .input(
      'AgencyCustomerNumber',
      sql.VarChar,
      participantData.AgencyCustomerNumber || null
    )
    .input(
      'EmploymentAgentId',
      sql.Int,
      Number(participantData.EmploymentAgentId) || null
    )
    .input(
      'FirstContactDate',
      sql.Date,
      participantData.FirstContactDate || null
    )
    .input('ContactSource', sql.VarChar, participantData.ContactSource || null)
    .input('IsEmployed', sql.Bit, participantData.IsEmployed ?? false)
    .input(
      'EmploymentStartDate',
      sql.Date,
      participantData.EmploymentStartDate || null
    )
    .input('Employer', sql.VarChar, participantData.Employer || null)
    .input('LocationId', sql.Int, Number(participantData.LocationID) || null)
    .query(`
      INSERT INTO Participant (
        Salutation, LastName, FirstName,
        Street, HouseNumber, PostalCodeId,
        DateOfBirth, PlaceOfBirth,
        Email, Phone, Mobile, Fax,
        IsSelfPayer, AgencyCustomerNumber, EmploymentAgentId,
        FirstContactDate, ContactSource,
        IsEmployed, EmploymentStartDate, Employer, LocationId
      )
      OUTPUT INSERTED.*
      VALUES (
        @Salutation, @LastName, @FirstName,
        @Street, @HouseNumber, @PostalCodeId,
        @DateOfBirth, @PlaceOfBirth,
        @Email, @Phone, @Mobile, @Fax,
        @IsSelfPayer, @AgencyCustomerNumber, @EmploymentAgentId,
        @FirstContactDate, @ContactSource,
        @IsEmployed, @EmploymentStartDate, @Employer, @LocationId
      )
    `);
  return result.recordset[0];
}

async function updateParticipantInDB(id, participantData) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ParticipantId', sql.Int, id)
    .input('Salutation', sql.Bit, participantData.Salutation ?? false)
    .input('LastName', sql.VarChar, participantData.LastName || null)
    .input('FirstName', sql.VarChar, participantData.FirstName || null)
    .input('Street', sql.VarChar, participantData.Street || null)
    .input('HouseNumber', sql.VarChar, participantData.HouseNumber || null)
    .input(
      'PostalCodeId',
      sql.Int,
      Number(participantData.PostalCodeId) || null
    )
    .input('DateOfBirth', sql.Date, participantData.DateOfBirth || null)
    .input('PlaceOfBirth', sql.VarChar, participantData.PlaceOfBirth || null)
    .input('Email', sql.VarChar, participantData.Email || null)
    .input('Phone', sql.VarChar, participantData.Phone || null)
    .input('Mobile', sql.VarChar, participantData.Mobile || null)
    .input('Fax', sql.VarChar, participantData.Fax || null)
    .input('IsSelfPayer', sql.Bit, participantData.IsSelfPayer ?? false)
    .input(
      'AgencyCustomerNumber',
      sql.VarChar,
      participantData.AgencyCustomerNumber || null
    )
    .input(
      'EmploymentAgentId',
      sql.Int,
      Number(participantData.EmploymentAgentId) || null
    )
    .input(
      'FirstContactDate',
      sql.Date,
      participantData.FirstContactDate || null
    )
    .input('ContactSource', sql.VarChar, participantData.ContactSource || null)
    .input('IsEmployed', sql.Bit, participantData.IsEmployed ?? false)
    .input(
      'EmploymentStartDate',
      sql.Date,
      participantData.EmploymentStartDate || null
    )
    .input('Employer', sql.VarChar, participantData.Employer || null)
    .input('LocationId', sql.Int, Number(participantData.LocationID) || null)
    .query(`
      DECLARE @Output TABLE (
        ParticipantId INT, Salutation BIT, LastName VARCHAR(255), FirstName VARCHAR(255),
        Street VARCHAR(255), HouseNumber VARCHAR(50), PostalCodeId INT,
        DateOfBirth DATE, PlaceOfBirth VARCHAR(255), Email VARCHAR(255),
        Phone VARCHAR(50), Mobile VARCHAR(50), Fax VARCHAR(50),
        IsSelfPayer BIT, AgencyCustomerNumber VARCHAR(255), EmploymentAgentId INT,
        FirstContactDate DATE, ContactSource VARCHAR(255),
        IsEmployed BIT, EmploymentStartDate DATE, Employer VARCHAR(255),
        LocationId INT, IsDeleted BIT
      );

      UPDATE Participant SET
        Salutation           = @Salutation,
        LastName             = @LastName,
        FirstName            = @FirstName,
        Street               = @Street,
        HouseNumber          = @HouseNumber,
        PostalCodeId         = @PostalCodeId,
        DateOfBirth          = @DateOfBirth,
        PlaceOfBirth         = @PlaceOfBirth,
        Email                = @Email,
        Phone                = @Phone,
        Mobile               = @Mobile,
        Fax                  = @Fax,
        IsSelfPayer          = @IsSelfPayer,
        AgencyCustomerNumber = @AgencyCustomerNumber,
        EmploymentAgentId    = @EmploymentAgentId,
        FirstContactDate     = @FirstContactDate,
        ContactSource        = @ContactSource,
        IsEmployed           = @IsEmployed,
        EmploymentStartDate  = @EmploymentStartDate,
        Employer             = @Employer,
        LocationId           = @LocationId
      OUTPUT INSERTED.* INTO @Output
      WHERE ParticipantId = @ParticipantId;

      SELECT * FROM @Output;
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}

async function deleteParticipantFromDB(id) {
  const pool = await connectDB();
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
