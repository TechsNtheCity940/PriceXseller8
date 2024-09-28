const fs = require('fs');
const csv = require('csv-parser');

// Function to process CSV files
function processCSV(filepath, callback) {
  const results = [];

  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('CSV Data:', results);
      callback(results);  // Return the results via callback
    });
}

// Export the function to be used in server.js
module.exports = { processCSV };
