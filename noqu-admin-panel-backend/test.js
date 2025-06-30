const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'noqu_database',
  password: ']CC?VPoG}YOn',
  database: 'noqu_db',
  port: 3306
});

const email = 'admin@noqu.co.in';
const plainPassword = 'Welcome@noqu';
const role = 'admin';

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err;

  connection.query(
    'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
    [email, hash, role],
    (err, results) => {
      if (err) throw err;
      console.log('✅ Admin created');
      connection.end();
    }
  );
});
