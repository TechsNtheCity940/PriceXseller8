const Tesseract = require('tesseract.js');

// Function to process images (OCR)
async function processImage(filepath) {
  const result = await Tesseract.recognize(filepath, 'eng', {
    logger: (m) => console.log(m),
  });

  console.log('Extracted Text from Image:', result.data.text);
  return result.data.text;
}

// Export the function to be used in server.js
module.exports = { processImage };