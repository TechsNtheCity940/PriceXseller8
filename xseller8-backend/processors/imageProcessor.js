const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const poppler = require('pdf-poppler');
const ExcelJS = require('exceljs');

// Function to apply basic preprocessing to the image
async function basicPreprocessImage(filepath) {
  try {
    const image = await Jimp.read(filepath);

    // Convert to grayscale
    image.grayscale();

    // Apply binary thresholding for better OCR accuracy
    image.threshold({ max: 200 });

    const processedImagePath = filepath.replace('.png', '_basic_preprocessed.png');
    await image.writeAsync(processedImagePath);

    return processedImagePath; // Return path to the preprocessed image
  } catch (error) {
    console.error('Error during basic preprocessing:', error);
    throw new Error('Basic preprocessing failed');
  }
}

// Function to apply advanced preprocessing techniques
async function advancedPreprocessImage(filepath) {
  try {
    const image = await Jimp.read(filepath);

    // Convert to grayscale
    image.grayscale();

    // Apply sharpening
    image.convolute([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);  // Sharpen the image

    // Boost contrast
    image.contrast(1);  // Increase contrast more aggressively

    // Apply more aggressive thresholding
    image.threshold({ max: 128 });

    const processedImagePath = filepath.replace('.png', '_advanced_preprocessed.png');
    await image.writeAsync(processedImagePath);

    return processedImagePath; // Return path to the advanced preprocessed image
  } catch (error) {
    console.error('Error during advanced preprocessing:', error);
    throw new Error('Advanced preprocessing failed');
  }
}

// Function to apply different preprocessing methods until text is extracted
async function tryPreprocessingAndExtract(filepath) {
  try {
    // First try with basic preprocessing
    const basicProcessedPath = await basicPreprocessImage(filepath);
    let text = await attemptOcr(basicProcessedPath);

    // If basic preprocessing fails, try advanced preprocessing
    if (!text || text.trim() === '') {
      console.log(`Basic preprocessing failed for ${filepath}, trying advanced preprocessing...`);
      const advancedProcessedPath = await advancedPreprocessImage(filepath);
      text = await attemptOcr(advancedProcessedPath);
    }

    if (!text || text.trim() === '') {
      console.error(`Text extraction failed for ${filepath} after all attempts.`);
      return null;
    }

    return text;
  } catch (error) {
    console.error(`Error trying preprocessing for ${filepath}:`, error);
    return null;
  }
}

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

  // Step 1: Preprocess the image and extract text
  const extractedText = await tryPreprocessingAndExtract(pngFilePath);

  if (extractedText) {
    // Step 2: Save the extracted text to an Excel file
    await saveTextToExcel(extractedText, outputExcelPath);
  } else {
    console.error('Failed to extract any text from the image.');
  }
}

// Run the main function
main();