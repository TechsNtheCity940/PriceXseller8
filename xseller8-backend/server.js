const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { attemptOcr, saveTextToExcel } = require('./processors/imageProcessor');
const { updateSpreadsheet } = require('./processors/updateSpreadsheet');
const cors = require('cors');

const app = express();
app.use(cors());

// Multer setup for file uploads (using memory storage to avoid saving files to disk)
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
  
      // Perform OCR to extract text
      const extractedText = await attemptOcr(tempFilePath);
  
      if (!extractedText) {
        return res.status(500).send({ message: 'Failed to extract text from the image' });
      }
  
      // Ensure the processed folder exists
      const processedFolder = './uploads/processed';
      if (!fs.existsSync(processedFolder)) {
        fs.mkdirSync(processedFolder, { recursive: true });
      }
  
      // Generate output path for Excel file based on the uploaded file name
      const outputExcelPath = `${processedFolder}/${path.parse(req.file.originalname).name}_extracted.xlsx`;
  
      // Save extracted text to an Excel file
      await saveTextToExcel(extractedText, outputExcelPath, '2024-10-10', 1200); // Example delivery date and invoice total
  
      // Example invoice data based on parsed content (you need to adapt it to your own needs)
      const invoiceData = {
        invoiceDate: '2024-10-10',
        items: [
          {
            itemNumber: '001',
            itemName: 'Sample Item',
            brand: 'Brand A',
            packSize: '6x500ml',
            unitCost: 12.50,
            quantity: 100,
            confirmed: 'Yes',
            status: 'Delivered',
          },
          // Add more items based on the extracted text
        ]
      };
  
      // Update the central spreadsheet
      updateSpreadsheet(invoiceData);
  
      // Send the successful response with the path of the processed file
      res.status(200).send({
        message: 'File processed and spreadsheet updated',
        outputExcelPath,
        extractedData: extractedText, // Optionally return the extracted data
      });
    } else {
      res.status(400).send({ message: 'Unsupported file type. Please upload a PNG or JPG file.' });
    }
  } catch (error) {
    console.error('Error processing file:', error);
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
