const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { attemptOcr, saveTextToExcel } = require('F:/repogit/Xseller8/Xseller8-backend/processes/imageProcessor'); // Updated path
const { updateSpreadsheet } = require('F:/repogit/Xseller8/Xseller8-backend/processes/updateSpreadsheet'); // Updated path
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
  let outputExcelPath;

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

      // Generate output path for Excel file based on the uploaded file name
      outputExcelPath = `./uploads/processed/${path.parse(req.file.originalname).name}_extracted.xlsx`;

      // Ensure the processed folder exists
      if (!fs.existsSync('./uploads/processed')) {
        fs.mkdirSync('./uploads/processed', { recursive: true });
      }

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

      res.status(200).send({ message: 'File processed and spreadsheet updated', outputExcelPath });
    } else {
      res.status(400).send({ message: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('Error processing the file:', error);
    res.status(500).send({ message: 'Error processing file', error });
  }
});

// API endpoint to download the central spreadsheet
app.get('/download-spreadsheet', (req, res) => {
  const file = `${__dirname}/central_spreadsheet.xlsx`;
  res.download(file);  // Send the file to the client
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
