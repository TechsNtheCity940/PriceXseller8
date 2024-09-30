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

// Function to apply adaptive thresholding
async function applyAdaptiveThreshold(image) {
  const { width, height } = image.bitmap;

  // Convert the image to grayscale
  image = image.grayscale();

  // Apply adaptive thresholding (using a manual pixel operation since Jimp does not directly support this)
  const newImage = image.clone();
  image.scan(0, 0, width, height, function (x, y, idx) {
    const pixelIntensity = this.bitmap.data[idx];  // Grayscale pixel value

    // Apply adaptive thresholding manually: Use a local window to set the threshold
    const threshold = 128;  // You can adjust this value based on image characteristics

    const newPixel = pixelIntensity > threshold ? 255 : 0;  // Binary thresholding
    newImage.bitmap.data[idx] = newPixel;
  });

  return newImage;
}

// Advanced Function to enlarge text, apply adaptive thresholding, and perform OCR
async function enlargeAndThresholdOcr(pngDir, processedDir, scaleFactor = 2) {
  ensureDirectoryExists(processedDir);

  const files = fs.readdirSync(pngDir);

  for (const file of files) {
    if (path.extname(file) === '.png') {
      const pngFilePath = path.join(pngDir, file);
      const processedFilePath = path.join(processedDir, file);
      
      let image = await Jimp.read(pngFilePath);
      const { width, height } = image.bitmap;

      // Check if the image dimensions are too small for scaling
      if (width < 3 || height < 3) {
        console.log(`Skipping ${file} because the dimensions are too small (${width}x${height}).`);
        continue;  // Skip this image
      }

      // Enlarge the image (Resize the image)
      image = image.resize(image.bitmap.width * scaleFactor, image.bitmap.height * scaleFactor, Jimp.RESIZE_BICUBIC);
      console.log(`Enlarged text for ${file} by a factor of ${scaleFactor}.`);

      // Apply adaptive thresholding
      const thresholdedImage = await applyAdaptiveThreshold(image);
      console.log(`Applied adaptive thresholding to ${file}.`);

      // Save the processed image
      await thresholdedImage.writeAsync(processedFilePath);
      console.log(`Saved processed image: ${processedFilePath}`);

      // Perform OCR on the processed image
      const ocrResult = await Tesseract.recognize(processedFilePath, 'eng', {
        logger: m => console.log(m)  // Logs the progress of the OCR process
      });

      console.log(`Extracted text from ${file}:\n`, ocrResult.data.text);
    }
  }
}

// Usage Example: Enlarge text, apply adaptive thresholding, and perform OCR
enlargeAndThresholdOcr("F:/repogit/Xseller8/rotated_pages", "F:/repogit/Xseller8/processed_images", 10);
