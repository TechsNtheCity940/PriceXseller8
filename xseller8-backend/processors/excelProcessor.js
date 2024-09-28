const XLSX = require('xlsx');

// Function to process Excel files
function processExcel(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheetName = workbook.SheetNames[0]; // Get the first sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON format
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  console.log('Excel Data:', jsonData);

  return jsonData;
}

// Export the function to be used in server.js
module.exports = { processExcel };
