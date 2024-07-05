
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();




async function fetchJobsFromAdzuna() {
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/gb/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        results_per_page: 50,
       
        where: 'UK',
      },
    });
 
    return response.data.results;
 
  } catch (error) {
    console.error('Error fetching jobs from Adzuna:', error);
    return [];
  }
}



const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});



// Fetch jobs from Jooble


// Normalize and store job data
async function storeJobs(jobs) {
  for (const job of jobs) {
    const { title, description, location, company, salary_min, salary_max, contract_time, contract_type ,category } = job;
    const companyName = company?.display_name || job.company;

    const jobTitle = title || 'Unknown Title';
    const jobDescription = description || 'No description available';
    const jobLocation = location?.display_name || job.location || 'Unknown Location';
    const jobCompanyName = companyName || 'Unknown Company';
    const jobSalary = salary_min || salary_max || job.salary || null;
    const jobType = contract_time || contract_type || 'Unknown Type';
    const Category= category.label|| 'unknwon category'

    // Check if the company exists in the Organization table
    const [rows] = await pool.execute('SELECT id FROM Organization WHERE name = ?', [companyName]);
console.log(rows)

    if (rows.length > 0) {
      const companyId = rows[0].id;

      // Insert the job into the Job table
      await pool.execute(
        'INSERT INTO Job (title, description, location, companyId, salary, jobType, category) VALUES (?, ?, ?, ?, ?, ?,?)',
        [jobTitle, jobDescription, jobLocation, companyId, jobSalary, jobType, Category]

        
      );
    }
  }
}

// Main function to fetch and store jobs
async function fetchAndStoreJobs() {
  try {
    // Fetch jobs from multiple APIs concurrently
    const adzunaJobs = await
      fetchJobsFromAdzuna()
  
console.log(adzunaJobs)
    // Normalize and store the jobs from each API
    await storeJobs(adzunaJobs);
   

    console.log('Jobs fetched and inserted successfully!');
  } catch (error) {
    console.error('Error fetching jobs: ' + error.message);
  }
}

fetchAndStoreJobs();
