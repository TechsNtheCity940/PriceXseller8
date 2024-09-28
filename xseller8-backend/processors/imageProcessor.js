const Tesseract = require('tesseract.js');

// Function to process image files (OCR)
async function processImage(filepath) {
  const result = await Tesseract.recognize(filepath, 'eng', {
    logger: (m) => console.log(m),  // Logs progress
  });

  const extractedText = result.data.text;
  const invoiceData = extractInvoiceData(extractedText);

  return invoiceData;
}

// Function to extract key invoice information from OCR text
function extractInvoiceData(text) {
  const lines = text.split('\n');
  let invoiceData = {
    supplier: '',
    invoiceDate: '',
    items: []
  };

  lines.forEach(line => {
    // Extract supplier and invoice date (based on patterns or keywords)
    if (line.includes('Supplier:')) {
      invoiceData.supplier = line.replace('Supplier:', '').trim();
    }
    if (line.includes('Invoice Date:')) {
      invoiceData.invoiceDate = line.replace('Invoice Date:', '').trim();
    }

    // Extract items (simplified pattern matching for items, quantities, and prices)
    const itemPattern = /(\w+)\s+(\d+)\s+([\d\.]+)/;  // Example: ItemName 5 10.00
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

module.exports = { processImage };
