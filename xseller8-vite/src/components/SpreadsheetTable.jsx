import React, { useState, useEffect } from 'react';

const SpreadsheetTable = ({ data }) => {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Number of rows per page

  // Initialize data or filter data if search query exists
  useEffect(() => {
    if (searchQuery) {
      const filteredData = data.slice(1).filter(row =>
        row.some(cell => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setTableData([data[0], ...filteredData]); // Preserve headers
    } else {
      setTableData(data);
    }
  }, [searchQuery, data]);

  // Handle sorting when a header is clicked
  const handleSort = (columnIndex) => {
    let direction = 'ascending';
    if (sortConfig.key === columnIndex && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnIndex, direction });

    const sortedData = [...tableData.slice(1)].sort((a, b) => {
      if (a[columnIndex] < b[columnIndex]) return direction === 'ascending' ? -1 : 1;
      if (a[columnIndex] > b[columnIndex]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setTableData([tableData[0], ...sortedData]); // Preserve headers
  };

  // Handle pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow + 1, indexOfLastRow + 1); // Exclude header row

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Search filter */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', padding: '5px' }}
      />

      {/* Table */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {tableData[0]?.map((header, index) => (
              <th
                key={index}
                style={{ padding: '10px', backgroundColor: '#f0f0f0', cursor: 'pointer' }}
                onClick={() => handleSort(index)}
              >
                {header} {sortConfig.key === index ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ padding: '10px' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableData[0]?.length} style={{ textAlign: 'center' }}>
                No matching data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        {Array.from({ length: Math.ceil(tableData.length / rowsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            style={{
              padding: '5px 10px',
              margin: '0 5px',
              backgroundColor: currentPage === index + 1 ? '#ddd' : '#fff',
              cursor: 'pointer'
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpreadsheetTable;
