const XLSX = require('xlsx');

// Function to process Excel files
function processExcel(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheetName = workbook.SheetNames[0]; // Use the first sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  const invoiceData = extractInvoiceData(jsonData);

  return invoiceData;
}

// Function to extract key invoice information from Excel data
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

module.exports = { processExcel };
