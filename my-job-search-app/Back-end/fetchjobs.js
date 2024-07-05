const axios = require('axios');

export async function fetchJobsFromAdzuna() {
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


