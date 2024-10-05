// Required libraries
const Tesseract = require('tesseract.js');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Function to attempt OCR using Tesseract
async function attemptOcr(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => console.log(m),  // Logs OCR progress
    });

    const extractedText = result.data.text;
    console.log(`Extracted text for ${imagePath}:`, extractedText.slice(0, 100)); // Show first 100 characters of text
    return extractedText;
  } catch (error) {
    console.error(`Error during OCR for ${imagePath}:`, error);
    return null;
  }
}

// Function to convert extracted text to an Excel file with specified headers
async function saveTextToExcel(extractedText, outputExcelPath, deliveryDate, invoiceTotal) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Data');

    // Add the headers to the first row
    const headers = ['Item#', 'Item Name', 'Brand', 'Pack Size', 'Price', 'Ordered', 'Confirmed Status'];
    worksheet.addRow(headers);

    // Split text into lines and further into cells based on common delimiters (e.g., tabs or spaces)
    const lines = extractedText.split('\n');
    lines.forEach((line, rowIndex) => {
      const cells = line.split(/\t|\s{2,}/); // Split by tabs or multiple spaces
      worksheet.addRow(cells.map(cell => cell.trim())); // Add each row of data
    });

    // Add delivery date and invoice total at the bottom of the sheet
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = 'Delivery Date:';
    worksheet.getCell(`B${lastRow}`).value = deliveryDate || 'Not Available';

    worksheet.getCell(`A${lastRow + 1}`).value = 'Invoice Total:';
    worksheet.getCell(`B${lastRow + 1}`).value = invoiceTotal || 'Not Available';

    // Adjust column widths for better readability
    worksheet.columns.forEach((column) => {
      const maxLength = column.values.reduce((prev, curr) => {
        return Math.max(prev, curr ? curr.toString().length : 0);
      }, 10);
      column.width = maxLength + 2; // Adjust column width
    });

    // Save the workbook to the specified path
    await workbook.xlsx.writeFile(outputExcelPath);
    console.log(`Extracted data saved to Excel file: ${outputExcelPath}`);
  } catch (error) {
    console.error('Error saving text to Excel:', error);
  }
}

// Exporting functions to be used in server.js or other files
module.exports = {
  attemptOcr,
  saveTextToExcel
};
