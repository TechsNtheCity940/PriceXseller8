const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { attemptOcr, saveTextToExcel } = require('./processors/imageProcessor');
const { updateSpreadsheet } = require('./processors/updateSpreadsheet');
const { parseExtractedData } = require('./processors/parseExtractedData'); // Import the parser
const cors = require('cors');

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    if (ext === '.png' || ext === '.jpg') {
      // Save uploaded file temporarily for OCR
      const tempFilePath = `./uploads/${req.file.originalname}`;
      await fs.promises.writeFile(tempFilePath, req.file.buffer);
      console.log(`File saved temporarily at: ${tempFilePath}`);

      // Perform OCR to extract text
      const extractedText = await attemptOcr(tempFilePath);
      if (!extractedText) {
        return res.status(500).send({ message: 'Failed to extract text from the image' });
      }

      console.log(`Extracted text: ${extractedText.slice(0, 100)}...`); // Log the first 100 characters of extracted text

      // Ensure the processed folder exists
      const processedFolder = './uploads/processed';
      if (!fs.existsSync(processedFolder)) {
        fs.mkdirSync(processedFolder, { recursive: true });
      }

      // Generate output path for Excel file based on the uploaded file name
      const outputExcelPath = `${processedFolder}/${path.parse(req.file.originalname).name}_extracted.xlsx`;
      console.log(`Saving extracted data to: ${outputExcelPath}`);

      // Save extracted text to an Excel file
      await saveTextToExcel(extractedText, outputExcelPath, '2024-10-10', 1200); // Example date and total
      console.log('Text successfully saved to Excel.');

      // Parse the extracted text
      console.log('Parsing extracted text...');
      const invoiceData = parseExtractedData(extractedText);
      console.log('Parsed Invoice Data:', invoiceData);

      // Update the necessary spreadsheets (Flash Report, Cost Tracker, etc.)
      updateSpreadsheet(invoiceData);
      console.log('Spreadsheet successfully updated.');

      // Send the successful response with the path of the processed file
      res.status(200).send({
        message: 'File processed and spreadsheets updated',
        outputExcelPath,
        extractedData: extractedText, // Optionally return the extracted data
      });
    } else {
      res.status(400).send({ message: 'Unsupported file type. Please upload a PNG or JPG file.' });
    }
  } catch (error) {
    console.error('Error processing file:', error.message); // Log the error message
    res.status(500).send({ message: 'Error processing file', error: error.message });
  }
});

// Start the server outside of routes
try {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}
