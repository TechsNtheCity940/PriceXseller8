const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { processPDF } = require('./processors/pdfProcessor');
const { updateSpreadsheet } = require('./updateSpreadsheet');

const app = express();
app.use(cors());

// Multer setup for file uploads (using memory storage to avoid saving files to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route for processing files and updating the spreadsheet
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  let invoiceData;

  try {
    if (ext === '.pdf') {
      // Process the PDF directly from memory
      invoiceData = await processPDF(req.file.buffer);
    } else {
      return res.status(400).send({ message: 'Unsupported file type' });
    }

    // Update the spreadsheet with extracted data
    updateSpreadsheet(invoiceData);
    res.status(200).send({ message: 'File processed and spreadsheet updated', invoiceData });
  } catch (error) {
    console.error('Error processing the file:', error);  // Log the error on the server
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
