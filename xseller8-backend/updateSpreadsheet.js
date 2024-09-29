const XLSX = require('xlsx');

// Function to update Excel spreadsheet with extracted invoice data
function updateSpreadsheet(invoiceData) {
  console.log('Updating spreadsheet with the following data:', invoiceData);

  const workbook = XLSX.readFile('central_spreadsheet.xlsx');

  // Get relevant sheets
  const costSheet = workbook.Sheets['Monthly Costs'];
  const pricingSheet = workbook.Sheets['Pricing'];

  // Add data to the "Monthly Costs" sheet
  invoiceData.items.forEach(item => {
    const lastRow = XLSX.utils.decode_range(costSheet['!ref']).e.r + 1;

    const newRow = [
      invoiceData.invoiceDate,
      invoiceData.companyName,
      item.itemName,
      item.quantity,
      item.unitCost,
      item.totalPrice
    ];
    console.log(`Adding row to Monthly Costs: ${newRow}`);
    XLSX.utils.sheet_add_aoa(costSheet, [newRow], { origin: `A${lastRow + 1}` });
  });

  // Add data to the "Pricing" sheet with latest item prices
  invoiceData.items.forEach(item => {
    const lastRow = XLSX.utils.decode_range(pricingSheet['!ref']).e.r + 1;
    const newRow = [item.itemName, item.unitCost];
    console.log(`Adding row to Pricing: ${newRow}`);
    XLSX.utils.sheet_add_aoa(pricingSheet, [newRow], { origin: `A${lastRow + 1}` });
  });

  // Save the updated workbook
  XLSX.writeFile(workbook, 'central_spreadsheet.xlsx');
}

module.exports = { updateSpreadsheet };
