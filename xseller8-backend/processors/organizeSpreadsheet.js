const XLSX = require('xlsx');
const TextBlob = require('textblob');  // Assuming you have a spell-checking library like TextBlob

// Helper function to correct spelling and capitalization
const correctText = (text) => {
    const blob = new TextBlob(text);
    const correctedText = blob.correct();
    return correctedText.charAt(0).toUpperCase() + correctedText.slice(1);
};

// Function to organize the workbook based on sheet names
const organizeSpreadsheet = async (fileBuffer, outputPath) => {
    try {
        // Load the workbook from the uploaded file buffer
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        // Correct spelling in the sheet names
        let sheetNames = workbook.SheetNames.map((sheetName) => correctText(sheetName));

        // Sort the sheet names alphabetically
        sheetNames.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        // Create a new workbook with sorted sheets
        const newWorkbook = XLSX.utils.book_new();

        // Add sheets back in the sorted order
        sheetNames.forEach((sortedSheetName) => {
            // Copy the sheet from the original workbook to the new workbook
            const originalSheet = workbook.Sheets[sortedSheetName];
            XLSX.utils.book_append_sheet(newWorkbook, originalSheet, sortedSheetName);
        });

        // Write the updated workbook to the output path
        XLSX.writeFile(newWorkbook, outputPath);
        return outputPath;
    } catch (error) {
        throw new Error('Error organizing spreadsheet: ' + error.message);
    }
};

module.exports = { organizeSpreadsheet };
