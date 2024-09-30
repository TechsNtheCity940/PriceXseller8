const { rotatePDF } = require('./rotatePDF');
const { extractDataFromRotatedPDF } = require('./extractPDFData');

// Function to process the PDF: rotate it if needed and extract data
async function processPDF(pdfBuffer) {
  try {
    // First, rotate the PDF if necessary
    const rotatedPdfBuffer = await rotatePDF(pdfBuffer);
    console.log('PDF rotation completed.');

    // Next, extract the data from the rotated PDF
    const extractedData = await extractDataFromRotatedPDF(rotatedPdfBuffer);
    
    if (!extractedData || !extractedData.items || extractedData.items.length === 0) {
      console.error('No data extracted from PDF');
      throw new Error('PDF extraction failed or empty data');
    }

    console.log('Data extraction completed.', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDF processing failed');
  }
}

module.exports = { processPDF };
