const pdf = require('pdf-parse');

async function processPDF(fileBuffer) {
  try {
    // Parse the PDF content
    const data = await pdf(fileBuffer);

    // Split the text by new lines
    const allText = data.text.split('\n');

    // Initialize an object to hold all extracted data
    let extractedData = {
      companyName: '',
      invoiceDate: '',
      items: [],   // Stores every line as an item
      rawData: []  // Store the entire PDF raw data for now
    };

    // Iterate through all the lines of the PDF and extract everything
    allText.forEach((line) => {
      // For now, push all lines into rawData
      extractedData.rawData.push(line);

      // Optionally: You could add logic to recognize key information like:
      if (line.toLowerCase().includes('invoice date')) {
        extractedData.invoiceDate = line.split(':')[1].trim();
      }

      if (line.toLowerCase().includes('company name')) {
        extractedData.companyName = line.split(':')[1].trim();
      }

      // Assuming line contains items if it doesn't match invoice or company
      extractedData.items.push(line); // Push everything into items for now
    });

    return extractedData;

  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDF processing failed');
  }
}

module.exports = processPDF;
