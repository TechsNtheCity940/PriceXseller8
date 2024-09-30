const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// Helper function to ensure the output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Advanced Function to enlarge text and perform OCR on images in `rotated_pages` directory
async function advancedEnlargeTextAndOcr(pngDir, processedDir, scaleFactor = 2) {
  ensureDirectoryExists(processedDir);

  const files = fs.readdirSync(pngDir);

  for (const file of files) {
    if (path.extname(file) === '.png') {
      const pngFilePath = path.join(pngDir, file);
      const processedFilePath = path.join(processedDir, file);
      
      let image = await Jimp.read(pngFilePath);

      // Advanced Enlarge text (Resize the image)
      // Applying bicubic interpolation for smoother resizing and better text clarity
      image = image.resize(image.bitmap.width * scaleFactor, image.bitmap.height * scaleFactor, Jimp.RESIZE_BICUBIC);
      console.log(`Enlarged text for ${file} by a factor of ${scaleFactor} using bicubic interpolation.`);

      // Save the enlarged image
      await image.writeAsync(processedFilePath);
      console.log(`Saved enlarged image: ${processedFilePath}`);

      // Perform OCR on the enlarged image
      const ocrResult = await Tesseract.recognize(processedFilePath, 'eng', {
        logger: m => console.log(m)  // Logs the progress of the OCR process
      });

      console.log(`Extracted text from ${file}:\n`, ocrResult.data.text);
    }
  }
}

// Usage Example: Enlarge text and perform OCR
advancedEnlargeTextAndOcr("F:/repogit/Xseller8/rotated_pages", "F:/repogit/Xseller8/processed_images", 2);
