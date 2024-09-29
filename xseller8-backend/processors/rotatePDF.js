const { degrees, PDFDocument } = require('pdf-lib');

// Function to rotate the PDF pages
async function rotatePDF(fileBuffer) {
  try {
    // Load the PDF using PDF-Lib
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();

    // Rotate pages if needed
    pages.forEach((page, index) => {
      const rotationAngle = page.getRotation().angle;
      console.log(`Page ${index + 1} rotation: ${rotationAngle} degrees`);

      if (rotationAngle === 90 || rotationAngle === 270) {
        console.log(`Rotating page ${index + 1} by ${rotationAngle} degrees`);
        page.setRotation(degrees(0)); // Rotate the page back to 0 degrees
      }
    });

    // Save the rotated PDF back to a buffer
    const rotatedPdfBytes = await pdfDoc.save();

    return rotatedPdfBytes;  // Return the rotated PDF as a buffer
  } catch (error) {
    console.error('Error rotating PDF:', error);
    throw error;
  }
}

module.exports = { rotatePDF };
