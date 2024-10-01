const fs = require('fs');
const path = require('path');
const { PDFDocument, degrees } = require('pdf-lib');  // Use pdf-lib to manipulate PDF files

// Helper function to ensure the output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to manually rotate PDFs and save them to the `rotated_pages` directory
async function rotatePdfFiles(pdfDir, rotatedDir, rotations) {
  ensureDirectoryExists(rotatedDir);

  const files = fs.readdirSync(pdfDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotationDegrees = rotations[i];  // Use manual input for rotation degrees

    if (path.extname(file) === '.pdf') {
      const pdfFilePath = path.join(pdfDir, file);
      try {
        // Read the PDF file
        const pdfBuffer = fs.readFileSync(pdfFilePath);

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // Rotate each page by the specified rotation degrees
        const numberOfPages = pdfDoc.getPageCount();
        for (let j = 0; j < numberOfPages; j++) {
          const page = pdfDoc.getPage(j);
          page.setRotation(degrees(rotationDegrees));
        }

        // Save the rotated PDF
        const rotatedPdfBytes = await pdfDoc.save();
        const outputFilePath = path.join(rotatedDir, file);
        fs.writeFileSync(outputFilePath, rotatedPdfBytes);

        console.log(`Rotated ${file} by ${rotationDegrees} degrees and saved to ${rotatedDir}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }
}

// Example usage: Manually rotate PDFs and save them
const rotations = [-90, 180, -90, -90, -90, -90, -90, -90, 180, -90, -90, -90, -90, 90, -90, -90, -90, -90, 90, 90, 90, 90, 90];  // Rotation degrees for each PDF
rotatePdfFiles("D:/GitRepos/PriceXseller8/xseller8-backend/png_output", "D:/GitRepos/PriceXseller8/rotated_pages", rotations);
