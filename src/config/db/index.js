
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shorten_url_management',
  password: '22092005',
  port: 5432,
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

