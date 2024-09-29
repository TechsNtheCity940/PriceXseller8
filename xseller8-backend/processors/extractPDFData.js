const pdf = require('pdf-parse');

// Function to extract data from the rotated PDF
async function extractDataFromRotatedPDF(rotatedPdfBuffer) {
  try {
    // Parse the rotated PDF using pdf-parse
    const data = await pdf(rotatedPdfBuffer);

    // Split the PDF text by newlines for easier processing
    const allText = data.text.split('\n');

    // Example of extracted data
    const extractedData = {
      companyName: '',
      invoiceDate: '',
      items: [],
      rawData: allText,  // Store all raw text data for now
    };

    // Simple logic to extract data (customize as needed)
    allText.forEach((line) => {
      if (line.toLowerCase().includes('company name')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          extractedData.companyName = parts[1].trim();
        }
      } else if (line.toLowerCase().includes('invoice date')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          extractedData.invoiceDate = parts[1].trim();
        }
      }
      // Add additional data extraction logic here (for item descriptions, prices, etc.)
    });

    return extractedData;
  } catch (error) {
    console.error('Error extracting data from rotated PDF:', error);
    throw error;
  }
}

module.exports = { extractDataFromRotatedPDF };
