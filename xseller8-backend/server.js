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
      // Image processing logic...
    } else if (ext === '.xlsx') {
      const tempFilePath = `./uploads/${req.file.originalname}`;
      await fs.promises.writeFile(tempFilePath, req.file.buffer);

      // Load and process the Excel file here (using updateSpreadsheet for instance)
      const extractedData = await parseExtractedData(tempFilePath);
      const outputExcelPath = `./uploads/processed/${path.parse(req.file.originalname).name}_organized.xlsx`;

      // Ensure the processed folder exists
      const processedFolder = './uploads/processed';
      if (!fs.existsSync(processedFolder)) {
        fs.mkdirSync(processedFolder, { recursive: true });
      }

      // Organize and save the processed Excel file
      await updateSpreadsheet(extractedData, outputExcelPath);

      res.status(200).send({
        message: 'Excel file processed and organized',
        outputExcelPath,
        extractedData: { rawData: extractedData }, // Send processed data back to the frontend
      });
    } else {
      res.status(400).send({ message: 'Unsupported file type. Please upload an Excel, PNG, or JPG file.' });
    }
  } catch (error) {
    console.error('Error processing file:', error.message);
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
