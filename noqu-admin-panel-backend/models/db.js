const mysql = require('mysql2');
const util = require('util');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection
db.query('SELECT 1', (err) => {
  if (err) console.error('Error connecting to database:', err);
  else console.log('Connected to the database');
});

// Create a duplicate version for async/await usage only
const dbAsync = {
  ...db,
  query: util.promisify(db.query).bind(db),
};

module.exports = { db, dbAsync };
