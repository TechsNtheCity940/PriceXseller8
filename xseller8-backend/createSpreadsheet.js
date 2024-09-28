const XLSX = require('xlsx');

// Function to create the initial spreadsheet structure
function createInitialSpreadsheet() {
  // Define the structure of each sheet
  const monthlyCosts = [
    ['Date', 'Supplier', 'Category', 'Item Name', 'Quantity', 'Price', 'Total']
  ];
  const salesData = [
    ['Category', 'Month', 'Sales Total']
  ];
  const pricing = [
    ['Item Name', 'Current Price']
  ];

  // Create a new workbook and add the sheets
  const workbook = XLSX.utils.book_new();
  
  // Add sheets with initial headers
  const costSheet = XLSX.utils.aoa_to_sheet(monthlyCosts);
  XLSX.utils.book_append_sheet(workbook, costSheet, 'Monthly Costs');

  const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Data');

  const pricingSheet = XLSX.utils.aoa_to_sheet(pricing);
  XLSX.utils.book_append_sheet(workbook, pricingSheet, 'Pricing');

  // Write the workbook to a file
  XLSX.writeFile(workbook, 'central_spreadsheet.xlsx');
}

// Call the function to create the initial spreadsheet
createInitialSpreadsheet();
