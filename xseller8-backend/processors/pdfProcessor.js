// /processors/pdfProcessor.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Function to process PDF
async function processPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const data = await pdfParse(dataBuffer);

  // Extracted text from the PDF
  console.log('PDF Text:', data.text);
  return data.text;
}

// Export the function to make it available in server.js
module.exports = { processPDF };
