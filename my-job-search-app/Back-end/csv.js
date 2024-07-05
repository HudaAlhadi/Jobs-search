const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function cleanAndInsertOrganizations() {
  fs.createReadStream('D:\Sponsor.csv')
    .pipe(csv())
    .on('data', async (row) => {
      let organizationName = row['Organisation Name'].trim();
      organizationName = organizationName.replace(/^[^a-zA-Z]+/, ''); // Remove leading non-alphabetic characters

      try {
        await pool.execute('INSERT INTO Organization (name) VALUES (?)', [organizationName]);
      } catch (error) {
        console.error('Error inserting organization:', error);
      }
    })
    .on('end', () => {
      console.log('CSV file successfully processed and organizations inserted.');
    });
}

cleanAndInsertOrganizations();