var docparser = require('docparser-node');
var fs = require('fs');
var path = require('path');

var client = new docparser.Client("a1e5fc808e8152ab2993a6cef876079ff6a5e992");

const pdfDirectory = 'D:/GitRepos/PriceXseller8/xseller8-backend/png_output'; // Directory of PDF files
const outputDirectory = 'D:/GitRepos/PriceXseller8/preprocessed'; // Directory to save parsed text files
const parserId = 'jgayjghwfeqe'; // Replace with your actual Docparser parser ID

// Ensure output directory exists
if (!fs.existsSync(outputDirectory)){
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// Authenticate client
client.ping()
  .then(function() {
    console.log('Authentication succeeded!');
    processPdfs();
  })
  .catch(function(err) {
    console.error('Authentication failed!', err);
  });

// Process all PDF files in the directory
function processPdfs() {
  fs.readdir(pdfDirectory, (err, files) => {
    if (err) {
      return console.error('Unable to read the directory:', err);
    }
    files.forEach(file => {
      if (path.extname(file) === '.pdf') { // Ensure it's a PDF file
        const filePath = path.join(pdfDirectory, file);
        uploadAndParseFile(filePath, file);
      }
    });
  });
}

// Function to upload and parse a PDF file
function uploadAndParseFile(filePath, fileName) {
  client.uploadFileByPath(parserId, filePath, { remote_id: path.basename(filePath) })
    .then(function(result) {
      console.log(`File uploaded successfully: ${filePath}`);
      getParsedResults(fileName);
    })
    .catch(function(err) {
      console.error(`Error uploading file: ${filePath}`, err);
    });
}

// Function to get parsed results for the parser and save them to a file
function getParsedResults(fileName) {
  client.getResultsByParser(parserId, { format: 'object' })
    .then(function(result) {
      const outputFilePath = path.join(outputDirectory, `${path.basename(fileName, '.pdf')}.txt`);
      const parsedText = JSON.stringify(result, null, 2); // Save as JSON formatted text
      fs.writeFile(outputFilePath, parsedText, (err) => {
        if (err) {
          console.error('Error writing the parsed result to file:', err);
        } else {
          console.log(`Parsed data saved successfully: ${outputFilePath}`);
        }
      });
    })
    .catch(function(err) {
      console.error('Error fetching parsed results:', err);
    });
}
