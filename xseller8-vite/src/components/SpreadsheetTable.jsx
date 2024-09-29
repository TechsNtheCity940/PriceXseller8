import React from 'react';

const SpreadsheetTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  return (
    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {data[0].map((header, index) => (
            <th key={index} style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(1).map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} style={{ padding: '10px' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SpreadsheetTable;
