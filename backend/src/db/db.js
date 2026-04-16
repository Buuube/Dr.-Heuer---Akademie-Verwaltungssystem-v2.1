const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool = null; // shared pool — created once, reused forever

async function connectDB() {
  if (pool) return pool; // already connected — reuse it
  pool = await sql.connect(config);
  console.log('SQL Server connected');
  return pool;
}

module.exports = { sql, connectDB };
