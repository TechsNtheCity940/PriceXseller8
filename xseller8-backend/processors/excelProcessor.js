const XLSX = require('xlsx');

// Function to process Excel files
function processExcel(filepath) {
  try {
    const workbook = XLSX.readFile(filepath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const sheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    const invoiceData = extractInvoiceData(jsonData);

    if (!invoiceData || invoiceData.items.length === 0) {
      console.error('No valid invoice data found in the Excel file.');
      throw new Error('Excel data extraction failed');
    }

    console.log('Excel data extraction successful.', invoiceData);
    return invoiceData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Excel processing failed');
  }
}

// Function to extract key invoice information from Excel data
function extractInvoiceData(data) {
  let invoiceData = {
    supplier: '',
    invoiceDate: '',
    items: []
  };

  data.forEach(row => {
    console.log('Processing row:', row);
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
    } else {
      console.warn('Incomplete row data:', row);
    }
  });

  return invoiceData;
}

module.exports = { processExcel };
