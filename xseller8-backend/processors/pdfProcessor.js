const { rotatePDF } = require('./rotatePDF');  // Adjust path for rotatePDF.js
const { extractDataFromRotatedPDF } = require('./extractPDFData');  // Adjust path for extractPDFData.js

// Function to process the PDF: rotate it if needed and extract data
async function processPDF(pdfBuffer) {
  try {
    // First, rotate the PDF if necessary
    const rotatedPdfBuffer = await rotatePDF(pdfBuffer);
    console.log('PDF rotation completed.');

    // Next, extract the data from the rotated PDF
    const extractedData = await extractDataFromRotatedPDF(rotatedPdfBuffer);
    console.log('Data extraction completed.');

    return extractedData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDF processing failed');
  }
}

module.exports = { processPDF };
