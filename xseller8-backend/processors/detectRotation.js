const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

// Function to perform OCR and detect orientation
async function detectOrientation(imagePath) {
  try {
    const ocrResult = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m), // Optional: logs the progress of the OCR process
    });
    
    const orientation = ocrResult.data?.orientation;

    // Check if the orientation data exists
    if (!orientation) {
      console.warn('No orientation data found in OCR result. Assuming 0 degrees.');
      return { deg: 0 };  // Default to 0 degrees if no orientation data
    }

    return orientation;
  } catch (error) {
    console.error('Error detecting orientation:', error);
    throw new Error('Orientation detection failed');
  }
}

// Function to map orientation angles from Tesseract to rotation degrees
function getRotationFromOrientation(orientation) {
  switch (orientation.deg) {
    case 90:
      return -90; // Counterclockwise
    case 270:
      return 90;  // Clockwise
    case 180:
      return 180; // Upside down
    case 0:
    default:
      return 0;   // No rotation needed
  }
}

// Function to rotate and save a PNG image
async function rotatePng(imagePath, rotationDegrees) {
  try {
    const image = await Jimp.read(imagePath);

    if (rotationDegrees !== 0) {
      image.rotate(rotationDegrees);  // Rotate by the required degrees
      await image.writeAsync(imagePath);  // Overwrite the original image with the rotated image
      console.log(`Rotated ${imagePath} by ${rotationDegrees} degrees.`);
    } else {
      console.log(`No rotation needed for ${imagePath}.`);
    }

  } catch (error) {
    console.error('Error rotating image:', error);
    throw new Error('Image rotation failed');
  }
}

// Function to detect orientation and rotate all PNGs in a directory
async function detectAndRotatePngs(pngDir) {
  const files = fs.readdirSync(pngDir);
  
  for (const file of files) {
    if (path.extname(file) === '.png') {
      const pngFilePath = path.join(pngDir, file);
      const orientation = await detectOrientation(pngFilePath);
      const rotationDegrees = getRotationFromOrientation(orientation);
      await rotatePng(pngFilePath, rotationDegrees);
    }
  }
}

// Usage Example for Step 2: Detect and Rotate PNGs
detectAndRotatePngs("F:/repogit/Xseller8/png_output");
