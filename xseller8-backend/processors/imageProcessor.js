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

// Function to convert extracted text to an Excel file
async function saveTextToExcel(extractedText, outputExcelPath) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Data');

    // Split text into lines and further into cells based on common delimiters (e.g., tabs or spaces)
    const lines = extractedText.split('\n');
    lines.forEach((line, rowIndex) => {
      const cells = line.split(/\t|\s{2,}/); // Split by tabs or multiple spaces
      cells.forEach((cell, colIndex) => {
        worksheet.getCell(rowIndex + 1, colIndex + 1).value = cell.trim();
      });
    });

    // Save workbook to file
    await workbook.xlsx.writeFile(outputExcelPath);
    console.log(`Extracted data saved to Excel file: ${outputExcelPath}`);
  } catch (error) {
    console.error('Error saving text to Excel:', error);
  }
}

// Main function to process a PNG file and save data to Excel
async function main() {
  const pngFilePath = "F:/repogit/Xseller8/xseller8-backend/uploads/BEK.png"; // Update with the path to your PNG file
  const outputExcelPath = 'F:/repogit/Xseller8/xseller8-backend/png_output/extracted_data.xlsx'; // Update with the desired output path

  // Step 1: Extract text from the image
  const extractedText = await attemptOcr(pngFilePath);

  if (extractedText) {
    // Step 2: Save the extracted text to an Excel file
    await saveTextToExcel(extractedText, outputExcelPath);
  } else {
    console.error('Failed to extract any text from the image.');
  }
}

// Run the main function
main();