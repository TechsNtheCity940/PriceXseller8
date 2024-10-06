const XLSX = require('xlsx');
const path = require('path');

// Paths to different documents
const flashReportPath = path.resolve(__dirname, '../documents/flash_report.xlsx');
const costTrackerPath = path.resolve(__dirname, '../documents/cost_tracker.xlsx');

// Function to update multiple Excel documents with extracted invoice data
function updateSpreadsheet(invoiceData) {
  if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
    console.error('No invoice data provided for spreadsheet update.');
    return;
  }

  try {
    console.log('Updating spreadsheets with the following data:', invoiceData);

    // 1. Update the Flash Report
    updateFlashReport(invoiceData);

    // 2. Update the Cost Tracker (Central Spreadsheet)
    updateCostTracker(invoiceData);

    console.log('Spreadsheets successfully updated.');
  } catch (error) {
    console.error('Error updating the spreadsheets:', error);
    throw new Error('Spreadsheet update failed');
  }
}

// Function to update the Flash Report
function updateFlashReport(invoiceData) {
  try {
    console.log('Updating Flash Report...');

    // Load the Flash Report workbook
    let workbook;
    try {
      workbook = XLSX.readFile(flashReportPath);
    } catch (e) {
      workbook = XLSX.utils.book_new();
      workbook.SheetNames.push('Flash Report');
      workbook.Sheets['Flash Report'] = XLSX.utils.aoa_to_sheet([]);
    }

    const sheet = workbook.Sheets['Flash Report'];

    // Get the current range
    const lastRow = XLSX.utils.decode_range(sheet['!ref']).e.r + 1 || 1;

    // Add a new row with invoice information (Invoice Number, Date, Total Items, Total Price)
    const newFlashRow = [
      invoiceData.invoiceNumber,
      invoiceData.invoiceDate,
      invoiceData.totalItems,
      invoiceData.totalPrice,
    ];

    XLSX.utils.sheet_add_aoa(sheet, [newFlashRow], { origin: `A${lastRow + 1}` });
    XLSX.writeFile(workbook, flashReportPath);

    console.log('Flash Report successfully updated.');
  } catch (error) {
    console.error('Error updating the Flash Report:', error);
    throw new Error('Flash Report update failed');
  }
}

// Function to update the Cost Tracker (Central Spreadsheet)
function updateCostTracker(invoiceData) {
  try {
    console.log('Updating Cost Tracker...');

    // Load the Cost Tracker workbook
    const workbook = XLSX.readFile(costTrackerPath);
    const pricingSheet = workbook.Sheets['Pricing'];

    // Check if the sheets are empty
    if (!pricingSheet) {
      console.error('The "Pricing" sheet is missing in the Cost Tracker.');
      return;
    }

    // Convert the "Pricing" sheet to a JSON object for easier manipulation
    const pricingData = XLSX.utils.sheet_to_json(pricingSheet, { header: 1 });

    // Create a map for quick lookup of existing items in the "Pricing" sheet
    const itemMap = {};
    pricingData.forEach((row, index) => {
      if (row[0] && typeof row[0] === 'string') {
        itemMap[row[0].toLowerCase()] = index; // Map the item number to the row number
      }
    });

    // Add or update items in the "Pricing" sheet
    invoiceData.items.forEach((item) => {
      const itemNumber = item.itemNumber.toLowerCase();

      // Check if the item exists in the pricing sheet
      if (itemMap[itemNumber] !== undefined) {
        // Update existing item price in the "Pricing" sheet
        const rowIndex = itemMap[itemNumber];
        pricingSheet[`E${rowIndex + 1}`] = { v: item.unitCost }; // Update the price column
        console.log(`Updated price for ${item.itemName}: ${item.unitCost}`);
      } else {
        // Add new item to the "Pricing" sheet
        const newRow = [
          item.itemNumber,
          item.itemName,
          item.brand,
          item.packSize,
          item.unitCost,
          item.ordered,
          item.confirmed,
          item.status,
        ];
        XLSX.utils.sheet_add_aoa(pricingSheet, [newRow], { origin: -1 });
        console.log(`Added new item to Pricing: ${item.itemName}, Price: ${item.unitCost}`);
      }
    });

    // Save the updated workbook
    XLSX.writeFile(workbook, costTrackerPath);
    console.log('Cost Tracker successfully updated.');
  } catch (error) {
    console.error('Error updating the Cost Tracker:', error);
    throw new Error('Cost Tracker update failed');
  }
}

module.exports = { updateSpreadsheet };
