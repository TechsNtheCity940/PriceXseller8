const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');  // Import Jimp (use 'require' for CommonJS, 'import' for ES Modules)

// Helper function to ensure the output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to manually rotate PNGs and save them to the `rotated_pages` directory
async function rotatePngFiles(pngDir, rotatedDir, rotations) {
  ensureDirectoryExists(rotatedDir);

  const files = fs.readdirSync(pngDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotationDegrees = rotations[i];  // Use manual input for rotation degrees

    if (path.extname(file) === '.png') {
      const pngFilePath = path.join(pngDir, file);
      try {
        const image = await Jimp.read(pngFilePath);  // Read the image using Jimp
        await image.rotate(rotationDegrees).writeAsync(path.join(rotatedDir, file));  // Rotate and save the image
        console.log(`Rotated ${file} by ${rotationDegrees} degrees and saved to ${rotatedDir}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }
}

// Usage Example: Manually rotate images and save them
const rotations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 180, 0, 0, 0];  // Example rotation for each image (add manually)
rotatePngFiles("F:/repogit/Xseller8/rotated_pages", "F:/repogit/Xseller8/rotated_pages", rotations);
              