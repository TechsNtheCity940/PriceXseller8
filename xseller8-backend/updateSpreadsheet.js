const XLSX = require('xlsx');

// Function to update Excel spreadsheet with extracted invoice data
function updateSpreadsheet(invoiceData) {
  const workbook = XLSX.readFile('central_spreadsheet.xlsx');

  // Get relevant sheets for costs and pricing
  const costSheet = workbook.Sheets['Monthly Costs'];
  const pricingSheet = workbook.Sheets['Pricing'];

  // Add data to the "Monthly Costs" sheet
  invoiceData.items.forEach(item => {
    const category = getCategoryForItem(item.itemName);

    // Find the next available row in the "Monthly Costs" sheet
    const lastRow = XLSX.utils.decode_range(costSheet['!ref']).e.r + 1;

    // Append item data to the correct sheet
    const newRow = [
      invoiceData.invoiceDate,
      invoiceData.supplier,
      category,
      item.itemName,
      item.quantity,
      item.price,
      item.quantity * item.price, // Total cost for the item
    ];
    
    XLSX.utils.sheet_add_aoa(costSheet, [newRow], { origin: `A${lastRow + 1}` });
  });

  // Update the "Pricing" sheet with the latest prices
  invoiceData.items.forEach(item => {
    const lastRow = XLSX.utils.decode_range(pricingSheet['!ref']).e.r + 1;
    const newRow = [item.itemName, item.price];

    XLSX.utils.sheet_add_aoa(pricingSheet, [newRow], { origin: `A${lastRow + 1}` });
  });

  // Save the updated workbook
  XLSX.writeFile(workbook, 'central_spreadsheet.xlsx');
}

// Helper function to categorize items (Food, Beverage, Chemical)
function getCategoryForItem(itemName) {
  // You can customize this categorization logic based on your needs
  if (itemName.toLowerCase().includes('food')) {
    return 'Food';
  } else if (itemName.toLowerCase().includes('beverage')) {
    return 'Beverage';
  } else {
    return 'Chemical';
  }
}

module.exports = { updateSpreadsheet };
