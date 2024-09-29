import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import SpreadsheetTable from './components/SpreadsheetTable.jsx';
import Chatbot from './components/Chatbot.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chatLog, setChatLog] = useState('');
  const [rawPDFData, setRawPDFData] = useState([]); // To hold the raw PDF data

  // Add log entries
  const addLog = (log) => {
    setLogs((prevLogs) => [...prevLogs, log]);
    setChatLog(log); // Pass log to chatbot
  };

  // Handle file selection
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    addLog('File selected: ' + event.target.files[0].name);
  };

  // Handle file upload
  const onFileUpload = () => {
    if (!selectedFile) {
      alert('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    addLog('Uploading file...');
    axios
      .post('http://localhost:5000/upload', formData)
      .then((response) => {
        setMessage(response.data.message);
        addLog('File uploaded and processed: ' + response.data.message);
        
        // Set the raw PDF data to display
        setRawPDFData(response.data.extractedData.rawData); 
        loadSpreadsheet();
      })
      .catch((error) => {
        setMessage('Error uploading file');
        addLog('Error uploading file');
      });
  };

  // Fetch and parse the central spreadsheet
  const loadSpreadsheet = () => {
    addLog('Loading spreadsheet data...');
    axios
      .get('http://localhost:5000/download-spreadsheet', { responseType: 'blob' })
      .then((response) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Convert first sheet to JSON
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          // Set spreadsheet data for rendering
          setSpreadsheetData(jsonData);
          addLog('Spreadsheet data loaded and displayed.');
        };
        reader.readAsArrayBuffer(response.data);
      })
      .catch((error) => {
        setMessage('Error loading spreadsheet data');
        addLog('Error loading spreadsheet data');
      });
  };

  return (
    <div className="App">
      {/* Branding Image */}
      <img src="/Xseller8Logo1.png" alt="Techs in the City" className="branding-image" />
      <h2>Automate Your Workload</h2>

      {/* Custom button for file upload */}
      <input type="file" id="file" onChange={onFileChange} />
      <label htmlFor="file">Browse...</label>

      <button onClick={onFileUpload}>Upload and Process File</button>
      <p>{message}</p>

      <div className="content-container">
        {/* Central Spreadsheet */}
        <div className="spreadsheet-container">
          <h3>Central Spreadsheet Data</h3>
          <SpreadsheetTable data={spreadsheetData} />
        </div>

        {/* Info Panel */}
        <div className="info-panel-container">
          <InfoPanel logs={logs} />
        </div>

        {/* Raw PDF Data Display */}
        <div className="raw-data-container">
          <h3>Raw PDF Data Extracted</h3>
          <div className="raw-data">
            {rawPDFData.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {/* Chatbot */}
        <div className="chatbot-container">
          <Chatbot log={chatLog} />
        </div>
      </div>
    </div>
  );
}

export default App;