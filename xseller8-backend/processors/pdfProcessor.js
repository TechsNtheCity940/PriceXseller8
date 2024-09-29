const fs = require('fs');
const pdfParse = require('pdf-parse');

// Function to process PDF and extract data
async function processPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const data = await pdfParse(dataBuffer);

  const extractedText = data.text;
  const invoiceData = extractInvoiceData(extractedText);

  return invoiceData;
}

// Extract relevant fields from the PDF text
function extractInvoiceData(text) {
  const lines = text.split('\n');
  let invoiceData = {
    companyName: '',
    invoiceDate: '',
    items: []
  };

  lines.forEach(line => {
    if (line.includes('Company:')) {
      invoiceData.companyName = line.replace('Company:', '').trim();
    }
    if (line.includes('Invoice Date:')) {
      invoiceData.invoiceDate = line.replace('Invoice Date:', '').trim();
    }

    // Parse item details (example format: ItemName Quantity UnitCost TotalPrice)
    const itemPattern = /(\w+)\s+(\d+)\s+([\d\.]+)\s+([\d\.]+)/;
    const match = itemPattern.exec(line);
    if (match) {
      invoiceData.items.push({
        itemName: match[1],
        quantity: parseInt(match[2]),
        unitCost: parseFloat(match[3]),
        totalPrice: parseFloat(match[4])
      });
    }
  });

  return invoiceData;
}

module.exports = { processPDF };
