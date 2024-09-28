const fs = require('fs');
const pdfParse = require('pdf-parse');

async function processPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const data = await pdfParse(dataBuffer);

  const extractedData = extractInvoiceData(data.text);
  return extractedData;
}

// Function to extract key invoice data from PDF text
function extractInvoiceData(text) {
  const lines = text.split('\n');
  let invoiceData = {
    supplier: '',
    invoiceDate: '',
    items: []
  };

  lines.forEach(line => {
    // Example pattern matching to extract the supplier and date
    if (line.includes('Supplier:')) {
      invoiceData.supplier = line.replace('Supplier:', '').trim();
    }
    if (line.includes('Invoice Date:')) {
      invoiceData.invoiceDate = line.replace('Invoice Date:', '').trim();
    }

    // Extracting item name, quantity, and price using a simple format
    const itemPattern = /(\w+)\s+(\d+)\s+([\d\.]+)/;
    const match = itemPattern.exec(line);
    if (match) {
      invoiceData.items.push({
        itemName: match[1],
        quantity: parseInt(match[2]),
        price: parseFloat(match[3])
      });
    }
  });

  return invoiceData;
}

module.exports = { processPDF };

