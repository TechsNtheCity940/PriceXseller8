const XLSX = require('xlsx');

// Function to update Excel spreadsheet with extracted invoice data
function updateSpreadsheet(invoiceData) {
  if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
    console.error('No invoice data provided for spreadsheet update.');
    return;
  }

  try {
    console.log('Updating spreadsheet with the following data:', invoiceData);
    
    // Load the workbook and get the relevant sheets
    const workbook = XLSX.readFile('central_spreadsheet.xlsx');
    const costSheet = workbook.Sheets['Monthly Costs'];
    const pricingSheet = workbook.Sheets['Pricing'];

    // Convert the "Pricing" sheet to a JSON object for easier manipulation
    const pricingData = XLSX.utils.sheet_to_json(pricingSheet, { header: 1 });
    
    // Create a map for quick lookup of existing items in the "Pricing" sheet
    const itemMap = {};
    pricingData.forEach((row, index) => {
      if (index > 0 && row[0]) {
        itemMap[row[0].toLowerCase()] = index; // Map the item name to the row number
      }
    });

    // Add or update items in the "Pricing" and "Monthly Costs" sheets
    invoiceData.items.forEach((item) => {
      const itemName = item.itemName.toLowerCase();

      // Check if the item exists in the pricing sheet
      if (itemMap[itemName] !== undefined) {
        // Update existing item price in the "Pricing" sheet
        const rowIndex = itemMap[itemName];
        const priceCell = `B${rowIndex + 1}`;
        pricingSheet[priceCell] = { v: item.unitCost };
        console.log(`Updated price for ${item.itemName}: ${item.unitCost}`);
      } else {
        // Add new item to the "Pricing" sheet
        const newRow = [item.itemName, item.unitCost];
        XLSX.utils.sheet_add_aoa(pricingSheet, [newRow], { origin: -1 });
        console.log(`Added new item to Pricing: ${item.itemName}, Price: ${item.unitCost}`);
      }

      // Also add the item to the "Monthly Costs" sheet
      const lastRow = XLSX.utils.decode_range(costSheet['!ref']).e.r + 1;
      const newCostRow = [
        invoiceData.invoiceDate,
        invoiceData.companyName,
        item.itemName,
        item.quantity,
        item.unitCost,
        item.totalPrice,
      ];
      XLSX.utils.sheet_add_aoa(costSheet, [newCostRow], { origin: `A${lastRow + 1}` });
      console.log(`Added row to Monthly Costs: ${newCostRow}`);
    });

    // Save the updated workbook
    XLSX.writeFile(workbook, 'central_spreadsheet.xlsx');
    console.log('Spreadsheet successfully updated.');
  } catch (error) {
    console.error('Error updating the spreadsheet:', error);
    throw new Error('Spreadsheet update failed');
  }
}

module.exports = { updateSpreadsheet };
