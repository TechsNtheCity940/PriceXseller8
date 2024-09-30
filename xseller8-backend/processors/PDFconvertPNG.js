const fs = require('fs');
const path = require('path');
const pdf2png = require('pdf-poppler');

// Helper function to ensure the output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to convert PDF to PNG images (one PNG per page)
async function convertPdfToPngs(pdfFilePath, outputDir) {
  ensureDirectoryExists(outputDir);
  const opts = {
    format: 'png', // Output format
    out_dir: outputDir, // Directory to save images
    out_prefix: path.basename(pdfFilePath, path.extname(pdfFilePath)), // Prefix for output files
    page: null // Convert all pages
  };

  try {
    // Convert all pages to PNGs
    const result = await pdf2png.convert(pdfFilePath, opts);
    console.log('Successfully converted PDF to PNG pages:', result);
    return result;  // Return array of generated PNG file paths
  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
    throw new Error('PDF to PNG conversion failed');
  }
}

// Usage Example for Step 1: Convert PDF to PNGs
convertPdfToPngs("F:/repogit/PDFinvoices/invoices 9.24.22.pdf", "F:/repogit/Xseller8/png_output");
