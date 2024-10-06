import React, { useState, useEffect, useRef } from 'react';
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
  const [rawData, setRawData] = useState([]);
  const canvasRef = useRef(null);

  const addLog = (log, type = 'info') => {
    setLogs((prevLogs) => [...prevLogs, { message: log, type }]);
    setChatLog(log); // Pass log to chatbot
  };

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    addLog(`File selected: ${event.target.files[0].name}`, 'info');
  };

  const onFileUpload = () => {
    if (!selectedFile) {
      alert('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    addLog('Uploading file...', 'info');

    axios
      .post('http://localhost:5000/upload', formData)
      .then((response) => {
        setMessage(response.data.message);
        addLog(`File uploaded and processed: ${response.data.message}`, 'success');

        if (response.data.extractedData && Array.isArray(response.data.extractedData.rawData)) {
          setRawData(response.data.extractedData.rawData);
          addLog('Raw data successfully extracted and displayed.', 'success');
        } else {
          addLog('No raw data extracted.', 'error');
        }

        loadSpreadsheet();
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        setMessage('Error uploading file');
        addLog(`Error uploading file: ${error.message}`, 'error');
      });
  };

  const loadSpreadsheet = () => {
    addLog('Loading spreadsheet data...', 'info');
    axios
      .get('http://localhost:5000/download-spreadsheet', { responseType: 'blob' })
      .then((response) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length === 0) {
              throw new Error('Spreadsheet is empty or data is invalid.');
            }

            setSpreadsheetData(jsonData);
            addLog('Spreadsheet data successfully loaded and displayed.', 'success');
          } catch (error) {
            console.error('Error processing spreadsheet:', error);
            addLog(`Error processing spreadsheet: ${error.message}`, 'error');
          }
        };
        reader.readAsArrayBuffer(response.data);
      })
      .catch((error) => {
        console.error('Error loading spreadsheet:', error);
        setMessage('Error loading spreadsheet data');
        addLog(`Error loading spreadsheet data: ${error.message}`, 'error');
      });
  };

  const downloadSpreadsheet = () => {
    addLog('Downloading the updated spreadsheet...', 'info');
    axios({
      url: 'http://localhost:5000/download-spreadsheet',
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'updated_spreadsheet.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        addLog('Spreadsheet successfully downloaded.', 'success');
      })
      .catch((error) => {
        console.error('Error downloading the spreadsheet:', error);
        addLog(`Error downloading spreadsheet: ${error.message}`, 'error');
      });
  };

  return (
    <div className="App">
      {/* Branding Section */}
      <header className="branding-header">
        <img src="/Xseller8Logo2.png" alt="Xseller8 Logo" className="branding-image" />
        <h2>Xseller8 Your Day</h2>
        <p>Automate your workload and Xseller8 your tasks.</p>
      </header>

      {/* File Upload Section */}
      <section className="file-upload-section">
        <div className="file-drop-area">
          <input type="file" id="file" onChange={onFileChange} className="file-input" />
          <label htmlFor="file" className="file-label">
            <div className="upload-icon">&#8682;</div>
            <span>Drag and drop your file here, or click to browse</span>
          </label>
        </div>
        <button onClick={onFileUpload} className="upload-button">Upload and Process File</button>
        <p className="status-message">{message}</p>
      </section>

      {/* Data Panels */}
      <section className="data-panels">
        <div className="panel spreadsheet-container">
          <h3>Central Spreadsheet Data</h3>
          <SpreadsheetTable data={spreadsheetData} />
        </div>
        <div className="panel info-panel-container">
          <InfoPanel logs={logs} />
        </div>
        <div className="panel raw-data-container">
          <h3>Raw Data Extracted</h3>
          <div className="raw-data">
            {rawData.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <div className="chatbot-widget">
        <Chatbot log={chatLog} />
      </div>

      {/* Save Spreadsheet Button */}
      <button className="save-spreadsheet-button" onClick={downloadSpreadsheet}>
        Save Updated Spreadsheet
      </button>
    </div>
  );
}

export default App;
