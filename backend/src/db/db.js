const sql = require('mssql'); // loads mssql

// reads credentials from .env file
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // set to true if using Azure
    trustServerCertificate: true, // allows local SQL Server connections
  },
};

// opens the connection to SQL Server
async function connectDB() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

module.exports = { sql, connectDB }; // makes sql and connectDB available to other files
