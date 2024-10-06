const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { attemptOcr, saveTextToExcel } = require('./processors/imageProcessor');
const { updateSpreadsheet } = require('./processors/updateSpreadsheet');
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
      const tempFilePath = `./uploads/${req.file.originalname}`;
      await fs.promises.writeFile(tempFilePath, req.file.buffer);
  
      const extractedText = await attemptOcr(tempFilePath);
  
      if (!extractedText) {
        return res.status(500).send({ message: 'Failed to extract text from the image' });
      }
  
      const processedFolder = './uploads/processed';
      if (!fs.existsSync(processedFolder)) {
        fs.mkdirSync(processedFolder, { recursive: true });
      }
  
      const outputExcelPath = `${processedFolder}/${path.parse(req.file.originalname).name}_extracted.xlsx`;
      await saveTextToExcel(extractedText, outputExcelPath, '2024-10-10', 1200);
  
      const invoiceData = parseExtractedData(extractedText);
      updateSpreadsheet(invoiceData);
  
      res.status(200).send({
        message: 'File processed and spreadsheets updated',
        outputExcelPath,
        extractedData: extractedText,
      });
    } else {
      res.status(400).send({ message: 'Unsupported file type. Please upload a PNG or JPG file.' });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send({ message: 'Error processing file', error: error.message });
  }
});
