// Example fix for parseExtractedData.js
function parseExtractedData(data) {
  data.forEach((item, index) => {
      // Check if the property you're trying to replace is defined
      if (item && typeof item.someProperty === 'string') {
          data[index].someProperty = item.someProperty.replace(/pattern/g, 'replacement');
      } else {
          console.error(`Invalid data at index ${index}:`, item);
      }
  });

  return data;
}

// Function to parse extracted text data from the OCR output
function parseExtractedData(extractedText) {
  const lines = extractedText.split('\n');
  const invoiceData = {
    invoiceNumber: '',
    invoiceDate: '',
    totalPrice: 0,
    items: []
  };

  let currentItem = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();

    // Extract the invoice number (assuming it starts with "Invoice#")
    if (trimmedLine.startsWith('Invoice#')) {
      const parts = trimmedLine.split(/\s+/);
      invoiceData.invoiceNumber = parts[1]; // The invoice number comes after "Invoice#"
    }

    // Extract the delivery date, total items, and total price
    if (trimmedLine.match(/\d{2}\/\d{2}\/\d{4}/)) {
      const parts = trimmedLine.split(/\s+/);
      invoiceData.invoiceDate = parts[0]; // The date is the first part
      invoiceData.totalPrice = parseFloat(parts[3].replace(/[^\d.-]/g, '')); // Total price after "items!" is the 4th part
    }

    // Extract item data (e.g., "BB4043 Mustard Yellow Heinz 1611302 $31.77 2 0 Outof stock")
    const itemRegex = /^[A-Za-z0-9]+\s/;
    if (itemRegex.test(trimmedLine)) {
      const itemParts = trimmedLine.split(/\s+/);
      const item = {
        itemNumber: itemParts[0],
        itemName: itemParts.slice(1, -6).join(' '),
        brand: itemParts[itemParts.length - 6],
        packSize: itemParts[itemParts.length - 5],
        unitCost: parseFloat(itemParts[itemParts.length - 4].replace(/[^\d.-]/g, '')),
        quantity: parseInt(itemParts[itemParts.length - 3], 10),
        confirmed: parseInt(itemParts[itemParts.length - 2], 10),
        status: itemParts[itemParts.length - 1]
      };

      invoiceData.items.push(item);
    }
  });

  return invoiceData;
}

module.exports = { parseExtractedData };
