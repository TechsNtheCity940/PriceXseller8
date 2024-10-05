const XLSX = require('xlsx');
const fs = require('fs');

// Function to update Excel spreadsheet with extracted invoice data
function updateSpreadsheet(invoiceData) {
  if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
    console.error('No invoice data provided for spreadsheet update.');
    return;
  }

  try {
    console.log('Updating spreadsheet with the following data:', invoiceData);

    // Check if the central spreadsheet file exists, otherwise create a new one
    const filePath = 'central_spreadsheet.xlsx';
    let workbook, sheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      sheet = workbook.Sheets['Running Log'];
    } else {
      workbook = XLSX.utils.book_new();
      sheet = XLSX.utils.aoa_to_sheet([
        ['ITEM #', 'ITEM NAME', 'BRAND', 'PACK/SIZE', 'PRICE', 'ORDERED', 'CONFIRMED', 'STATUS']
      ]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Running Log');
    }

    // Convert the current sheet to JSON format for easier manipulation
    const existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Create a map to easily update existing items by their name or item #
    const itemMap = {};
    existingData.forEach((row, index) => {
      if (index > 0 && row[1]) { // Assuming the second column is the "ITEM NAME"
        itemMap[row[1].toLowerCase()] = index; // Map the item name to its row index
      }
    });

    // Track total cost of the invoice for the invoice total
    let invoiceTotal = 0;

    // Process each item from the new invoice data
    invoiceData.items.forEach((item) => {
      const itemName = item.itemName.toLowerCase();
      invoiceTotal += item.unitCost * item.quantity;

      if (itemMap[itemName] !== undefined) {
        // Update existing item price and other details
        const rowIndex = itemMap[itemName];
        sheet[`E${rowIndex + 1}`] = { v: item.unitCost }; // Update "PRICE" column
        sheet[`F${rowIndex + 1}`] = { v: item.quantity }; // Update "ORDERED" column
        sheet[`G${rowIndex + 1}`] = { v: item.confirmed }; // Update "CONFIRMED" column
        sheet[`H${rowIndex + 1}`] = { v: item.status };    // Update "STATUS" column
        console.log(`Updated item: ${item.itemName}`);
      } else {
        // Add a new row for a new item
        const newRow = [
          item.itemNumber, 
          item.itemName, 
          item.brand, 
          item.packSize, 
          item.unitCost, 
          item.quantity, 
          item.confirmed, 
          item.status
        ];
        XLSX.utils.sheet_add_aoa(sheet, [newRow], { origin: -1 });
        console.log(`Added new item: ${item.itemName}`);
      }
    });

    // Add the delivery date and invoice total at the end of the sheet
    const lastRowIndex = XLSX.utils.decode_range(sheet['!ref']).e.r + 1;
    sheet[`A${lastRowIndex + 2}`] = { v: 'Delivery Date:' };
    sheet[`B${lastRowIndex + 2}`] = { v: invoiceData.invoiceDate };

    sheet[`A${lastRowIndex + 3}`] = { v: 'Invoice Total:' };
    sheet[`B${lastRowIndex + 3}`] = { v: invoiceTotal };

    // Save the updated workbook back to the file
    XLSX.writeFile(workbook, filePath);
    console.log('Spreadsheet successfully updated.');
  } catch (error) {
    console.error('Error updating the spreadsheet:', error);
    throw new Error('Spreadsheet update failed');
  }
}

module.exports = { updateSpreadsheet };
