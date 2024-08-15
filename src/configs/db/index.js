
const Pool = require('pg').Pool;
require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

function connect(){

    pool.connect((err, client, done) => {
        if (err) {
          console.error('Error connecting to the database', err.stack);
        } else {
          console.log('Connected to the database');
        }
    });
}

module.exports = { connect, pool }

