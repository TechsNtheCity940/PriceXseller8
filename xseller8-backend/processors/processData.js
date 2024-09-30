const XLSX = require('xlsx');
const { processPDF } = require('./pdfProcessor');
const { processExcel } = require('./excelProcessor');
const { updateSpreadsheet } = require('./updateSpreadsheet');

async function processData(pdfBuffer, excelFilePath) {
  try {
    // Process the PDF and Excel data
    const pdfData = await processPDF(pdfBuffer);
    const excelData = processExcel(excelFilePath);

    // Combine the extracted data
    const combinedData = {
      items: [...pdfData.items, ...excelData.items],
      invoiceDate: excelData.invoiceDate || pdfData.invoiceDate,
      companyName: excelData.supplier || pdfData.supplier,
    };

    // Write combined data to a temporary spreadsheet
    const tempWorkbook = XLSX.utils.book_new();
    const tempSheet = XLSX.utils.json_to_sheet(combinedData.items);
    XLSX.utils.book_append_sheet(tempWorkbook, tempSheet, 'ExtractedData');
    XLSX.writeFile(tempWorkbook, 'temp_data.xlsx');
    console.log('Temporary data written to temp_data.xlsx.');

    // Finally, update the central spreadsheet
    updateSpreadsheet(combinedData);
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

module.exports = { processData };
