const fs = require('fs');
const csv = require('csv-parser');

// Function to process CSV files
function processCSV(filepath, callback) {
  const results = [];

  // Stream the CSV file and parse it
  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const invoiceData = extractInvoiceData(results);
      callback(invoiceData);
    });
}

// Function to extract key invoice information from CSV data
function extractInvoiceData(data) {
  let invoiceData = {
    supplier: '',
    invoiceDate: '',
    items: []
  };

  data.forEach(row => {
    // Assuming that rows have 'Supplier', 'Invoice Date', 'Item', 'Quantity', 'Price' columns
    if (row['Supplier']) {
      invoiceData.supplier = row['Supplier'];
    }
    if (row['Invoice Date']) {
      invoiceData.invoiceDate = row['Invoice Date'];
    }
    if (row['Item'] && row['Quantity'] && row['Price']) {
      invoiceData.items.push({
        itemName: row['Item'],
        quantity: parseInt(row['Quantity']),
        price: parseFloat(row['Price'])
      });
    }
  });

  return invoiceData;
}

module.exports = { processCSV };
