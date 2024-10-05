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
  const [rawData, setRawData] = useState([]); // To hold the raw PDF data
  const canvasRef = useRef(null);

  // Add log entries with type (success, error, info)
  const addLog = (log, type = 'info') => {
    setLogs((prevLogs) => [...prevLogs, { message: log, type }]);
    setChatLog(log); // Pass log to chatbot
  };

  // Handle file selection
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    addLog(`File selected: ${event.target.files[0].name}`, 'info');
  };

  // Handle file upload
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

        // Set the raw PDF data to display real-time extracted data
        if (response.data.extractedData && response.data.extractedData.rawData) {
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

  // Fetch and parse the central spreadsheet
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

            // Convert first sheet to JSON
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length === 0) {
              throw new Error('Spreadsheet is empty or data is invalid.');
            }

            // Set spreadsheet data for rendering
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

  // Function to download the updated spreadsheet
  const downloadSpreadsheet = () => {
    addLog('Downloading the updated spreadsheet...', 'info');
    axios({
      url: 'http://localhost:5000/download-spreadsheet',
      method: 'GET',
      responseType: 'blob', // Important to receive the file as a blob
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'updated_spreadsheet.xlsx'); // Specify the file name
        document.body.appendChild(link);
        link.click(); // Trigger the download
        link.parentNode.removeChild(link); // Clean up the element
        addLog('Spreadsheet successfully downloaded.', 'success');
      })
      .catch((error) => {
        console.error('Error downloading the spreadsheet:', error);
        addLog(`Error downloading spreadsheet: ${error.message}`, 'error');
      });
  };

  // Canvas drawing function
  const drawOnCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Simple visual: a spinner indicating processing
    let angle = 0;
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2); // Move the center
      context.rotate(angle); // Rotate for spinning effect
      context.beginPath();
      context.arc(0, 0, 50, 0, Math.PI * 2);
      context.strokeStyle = 'yellow';
      context.lineWidth = 5;
      context.stroke();
      context.restore();
      angle += 0.05; // Increment angle for rotation
      requestAnimationFrame(draw); // Continue animation
    };
    draw(); // Start the drawing loop
  };

  useEffect(() => {
    drawOnCanvas(); // Start canvas animation on mount
  }, []);

  return (
    <div className="App">
      {/* Branding Image */}
      <img src="F:/repogit/Xseller8/xseller8-vite/public/Xseller8logoBnG.png" alt="Xseller8" className="branding-image" />
      <h2>Automate Your Workload</h2>

      {/* Custom button for file upload */}
      <input type="file" id="file" onChange={onFileChange} />
      <label htmlFor="file">Browse...</label>

      <button onClick={onFileUpload}>Upload and Process File</button>
      <p>{message}</p>

      {/* Canvas for visual feedback */}
      <canvas ref={canvasRef} width="150" height="150" className="processing-canvas" />

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
          <h3>Raw Data Extracted</h3>
          <div className="raw-data">
            {rawData.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {/* Chatbot */}
        <div className="chatbot-container">
          <Chatbot log={chatLog} />
        </div>

        {/* Add Save Updated Spreadsheet Button */}
        <button className="save-spreadsheet-button" onClick={downloadSpreadsheet}>
          Save Updated Spreadsheet
        </button>
      </div>
    </div>
  );
}

export default App;
