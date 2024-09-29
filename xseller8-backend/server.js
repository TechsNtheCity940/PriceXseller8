const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { processPDF } = require('./processors/pdfProcessor');
const { updateSpreadsheet } = require('./updateSpreadsheet');

const app = express();
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
  }
});
const upload = multer({ storage });

// Upload route for processing files and updating the spreadsheet
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
    } else {
      return res.status(400).send({ message: 'Unsupported file type' });
    }

    updateSpreadsheet(invoiceData);
    res.send({ message: 'File processed and spreadsheet updated', invoiceData });
  } catch (error) {
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
