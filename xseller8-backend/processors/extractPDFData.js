const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');  // Ensure correct import

// Function to split a multi-page PDF into individual PDFs
async function splitPdfIntoPages(pdfBuffer, outputDir) {
  try {
    // Load the existing PDF document from the buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer);  // Ensure buffer is used correctly
    const numberOfPages = pdfDoc.getPageCount();

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Loop through each page and create a new PDF with just that page
    for (let i = 0; i < numberOfPages; i++) {
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Copy the single page from the original document
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);

      // Save the new PDF with just this page
      const pdfBytes = await newPdfDoc.save();
      const outputFilePath = path.join(outputDir, `page_${i + 1}.pdf`);

      // Write the new PDF file to the specified directory
      fs.writeFileSync(outputFilePath, pdfBytes);
      console.log(`Saved page ${i + 1} as ${outputFilePath}`);
    }

    console.log(`Successfully split ${numberOfPages} pages into individual files.`);
  } catch (error) {
    console.error('Error splitting PDF into individual pages:', error);
  }
}

// Example usage:
// Replace with the correct path to your PDF file and output directory
const inputPdfPath = "D:/GitRepos/PriceXseller8/rotated_pages/invoices.pdf";
const outputDir = 'D:/GitRepos/PriceXseller8/xseller8-backend/png_output';

// Read the PDF file as a buffer
fs.readFile(inputPdfPath, async (err, pdfBuffer) => {
  if (err) {
    console.error('Error reading PDF file:', err);
    return;
  }

  // Call the function to split the PDF
  await splitPdfIntoPages(pdfBuffer, outputDir);  // Ensure the function is called properly
});
