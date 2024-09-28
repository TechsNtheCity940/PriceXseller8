const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Import file processing functions
const { processPDF } = require('./processors/pdfProcessor');
const { processExcel } = require('./processors/excelProcessor');
const { processCSV } = require('./processors/csvProcessor');
const { processImage } = require('./processors/imageProcessor');

// Initialize the Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
  },
});

const upload = multer({ storage });

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const filepath = req.file.path;
  const ext = path.extname(filepath);

  if (ext === '.pdf') {
    processPDF(filepath).then((text) => {
      res.send({ message: 'PDF processed', text });
    });
  } else if (ext === '.xlsx' || ext === '.xls') {
    const data = processExcel(filepath);
    res.send({ message: 'Excel processed', data });
  } else if (ext === '.csv') {
    processCSV(filepath, (data) => {
      res.send({ message: 'CSV processed', data });
    });
  } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    processImage(filepath).then((text) => {
      res.send({ message: 'Image processed (OCR)', text });
    });
  } else {
    res.status(400).send({ message: 'Unsupported file type' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
