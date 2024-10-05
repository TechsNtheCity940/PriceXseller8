const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { tryPreprocessingAndExtract } = require('./processors/imageProcessor');
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
    if (ext === '.png') {
      // Save the uploaded file to disk temporarily for processing
      const tempFilePath = `./uploads/${req.file.originalname}`;
      await fs.promises.writeFile(tempFilePath, req.file.buffer);

      // Extract data from the PNG file using OCR
      const extractedText = await tryPreprocessingAndExtract(tempFilePath);

      if (!extractedText) {
        return res.status(500).send({ message: 'Failed to extract text from the image' });
      }

      // Convert extracted text to JSON-like structure
      const lines = extractedText.split('\n');
      invoiceData = lines.map(line => {
        const cells = line.split(/\t|\s{2,}/);
        return {
          itemName: cells[0]?.trim(),
          itemCost: parseFloat(cells[1]?.trim()) || 0,
        };
      }).filter(item => item.itemName);
    } else {
      return res.status(400).send({ message: 'Unsupported file type' });
    }

    // Update the spreadsheet with extracted data
    updateSpreadsheet({ items: invoiceData });
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