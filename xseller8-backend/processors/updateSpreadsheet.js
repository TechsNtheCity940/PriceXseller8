const XLSX = require('xlsx');
const { TextBlob } = require('textblob'); // Use TextBlob for spell check

const updateSpreadsheet = async (data, outputPath) => {
  try {
    // Load the workbook from the uploaded file
    const workbook = XLSX.readFile(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Assuming we are working with the first sheet

    // Convert the sheet data to JSON for manipulation
    let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Process each row (correct text, sort alphabetically, etc.)
    jsonData = jsonData.map((row) => {
      return row.map((cell) => {
        if (typeof cell === 'string') {
          let correctedText = new TextBlob(cell).correct();  // Correct the text
          return correctedText.charAt(0).toUpperCase() + correctedText.slice(1); // Capitalize
        }
        return cell;
      });
    });

    // Sort the rows alphabetically by the first column (skip the header)
    const header = jsonData[0];
    const sortedData = jsonData.slice(1).sort((a, b) => a[0].localeCompare(b[0]));

    // Reattach the header to sorted data
    const organizedData = [header, ...sortedData];

    // Convert JSON data back to a sheet and save the updated file
    const newSheet = XLSX.utils.aoa_to_sheet(organizedData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Organized Data');

    XLSX.writeFile(newWorkbook, outputPath); // Save the new file to the provided outputPath
    return 'Spreadsheet successfully updated.';
  } catch (error) {
    console.error('Error updating spreadsheet:', error);
    throw new Error('Failed to update spreadsheet.');
  }
};

module.exports = { updateSpreadsheet };
