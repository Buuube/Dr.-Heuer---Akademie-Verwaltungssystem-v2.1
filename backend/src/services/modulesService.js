const { sql, connectDB } = require('../db/db');

async function getModulesFromDB(courseId) {
  const pool = await connectDB();
  const request = pool.request();

  let query = `
    SELECT
      ModuleCodeId        AS ModuleCode,
      ExternalModuleCode,
      Name,
      CourseId,
      TeachingFormatId,
      Content,
      EstimatedCost,
      Duration,
      HasInternship
    FROM Module
    WHERE (IsDeleted = 0 OR IsDeleted IS NULL)
  `;

  if (courseId) {
    request.input('CourseId', sql.Int, Number(courseId));
    query += ` AND CourseId = @CourseId`;
  }

  const result = await request.query(query);
  return result.recordset;
}

async function createModule(data) {
  const pool = await connectDB();
  await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, data.ModuleCode)
    .input('ExternalModuleCode', sql.VarChar, data.ExternalModuleCode ?? null)
    .input('Name', sql.VarChar, data.Name)
    .input('CourseId', sql.Int, data.CourseId)
    .input('TeachingFormatId', sql.Int, data.TeachingFormatId ?? null)
    .input('Content', sql.NVarChar(sql.MAX), data.Content ?? '')
    .input('EstimatedCost', sql.Decimal(10, 2), data.EstimatedCost ?? null)
    .input('Duration', sql.VarChar, data.Duration ?? null)
    .input('HasInternship', sql.Bit, data.HasInternship ?? 0).query(`
      INSERT INTO Module (
        ModuleCodeId, ExternalModuleCode, Name,
        CourseId, TeachingFormatId,
        Content, EstimatedCost, Duration, HasInternship
      ) VALUES (
        @ModuleCodeId, @ExternalModuleCode, @Name,
        @CourseId, @TeachingFormatId,
        @Content, @EstimatedCost, @Duration, @HasInternship
      )
    `);
  return { message: 'Module created', ModuleCode: data.ModuleCode };
}

async function updateModule(code, data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, code)
    .input('ExternalModuleCode', sql.VarChar, data.ExternalModuleCode ?? null)
    .input('Name', sql.VarChar, data.Name)
    .input('CourseId', sql.Int, data.CourseId)
    .input('TeachingFormatId', sql.Int, data.TeachingFormatId ?? null)
    .input('Content', sql.NVarChar(sql.MAX), data.Content ?? '')
    .input('EstimatedCost', sql.Decimal(10, 2), data.EstimatedCost ?? null)
    .input('Duration', sql.VarChar, data.Duration ?? null)
    .input('HasInternship', sql.Bit, data.HasInternship ?? 0).query(`
      UPDATE Module SET
        ExternalModuleCode = @ExternalModuleCode,
        Name               = @Name,
        CourseId           = @CourseId,
        TeachingFormatId   = @TeachingFormatId,
        Content            = @Content,
        EstimatedCost      = @EstimatedCost,
        Duration           = @Duration,
        HasInternship      = @HasInternship
      WHERE ModuleCodeId = @ModuleCodeId
    `);
  if (result.rowsAffected[0] === 0) return null;
  return { message: 'Module updated', ModuleCode: code };
}

async function deleteModule(code) {
  const pool = await connectDB();

  const check = await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, code)
    .query(
      `SELECT COUNT(*) AS cnt FROM BookingModule WHERE ModuleCodeId = @ModuleCodeId`
    );

  if (check.recordset[0].cnt > 0) {
    const err = new Error('Module has bookings');
    err.code = 'HAS_BOOKINGS';
    throw err;
  }

  await pool
    .request()
    .input('ModuleCodeId', sql.VarChar, code)
    .query(
      `UPDATE Module SET IsDeleted = 1 WHERE ModuleCodeId = @ModuleCodeId`
    );

  return { message: 'Module deleted', ModuleCode: code };
}

module.exports = { getModulesFromDB, createModule, updateModule, deleteModule };
