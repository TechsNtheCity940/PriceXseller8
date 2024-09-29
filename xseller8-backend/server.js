const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { processPDF } = require('./processors/pdfProcessor');
const { processExcel } = require('./processors/excelProcessor');
const { processCSV } = require('./processors/csvProcessor');
const { processImage } = require('./processors/imageProcessor');
const { updateSpreadsheet } = require('./updateSpreadsheet');

const app = express();
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// File upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const filepath = req.file.path;
  const ext = path.extname(filepath);

  let invoiceData;

  try {
    if (ext === '.pdf') {
      invoiceData = await processPDF(filepath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      invoiceData = processExcel(filepath);
    } else if (ext === '.csv') {
      invoiceData = await new Promise(resolve => processCSV(filepath, resolve));
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      invoiceData = await processImage(filepath);
    } else {
      return res.status(400).send({ message: 'Unsupported file type' });
    }

    // Update the spreadsheet with the extracted invoice data
    updateSpreadsheet(invoiceData);

    // Send response back to the client with extracted data
    res.send({ message: 'File processed and spreadsheet updated', invoiceData });
  } catch (error) {
    res.status(500).send({ message: 'Error processing file', error });
  }
});

app.get('/download-spreadsheet', (req, res) => {
  const file = `${__dirname}/central_spreadsheet.xlsx`;
  res.download(file);  // Set disposition and send it.
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
