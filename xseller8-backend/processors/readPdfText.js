const fs = require('fs');
const pdfParse = require('pdf-parse');

// Function to extract and display the text content from a PDF
function readPdfText(pdfFilePath) {
  // Read the PDF file into a buffer
  const pdfBuffer = fs.readFileSync(pdfFilePath);

  // Parse the PDF buffer using pdf-parse
  pdfParse(pdfBuffer)
    .then((data) => {
      console.log('PDF text content:');
      console.log(data.text);  // Output the text content of the PDF
    })
    .catch((error) => {
      console.error('Error reading PDF file:', error);
    });
}

// Run the function, replace 'sample.pdf' with the path to your PDF file
readPdfText("D:/GitRepos/PriceXseller8/xseller8-backend/png_output/page_6.pdf");
