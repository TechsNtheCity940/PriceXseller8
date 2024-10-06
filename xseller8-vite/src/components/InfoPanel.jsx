import React, { useEffect, useRef, useState } from 'react';

const InfoPanel = ({ logs, fetchDetails, errorLogs }) => {
  const logEndRef = useRef(null);

  // State for tracking the internal system logs
  const [internalLogs, setInternalLogs] = useState([]);

  // Auto-scroll to the latest log entry
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, internalLogs]);

  // Function to track detailed lifecycle events, errors, etc.
  useEffect(() => {
    const logSystemEvent = (event) => {
      setInternalLogs((prevLogs) => [
        ...prevLogs,
        { type: 'system', message: event, timestamp: new Date().toLocaleString() }
      ]);
    };

    // Track component mount/unmount events
    logSystemEvent('Component mounted');
    return () => {
      logSystemEvent('Component unmounted');
    };
  }, []);

  // Advanced Error Boundary handling (can also be extracted to a separate ErrorBoundary component)
  useEffect(() => {
    if (errorLogs) {
      setInternalLogs((prevLogs) => [
        ...prevLogs,
        { type: 'error', message: `Error: ${errorLogs}`, timestamp: new Date().toLocaleString() }
      ]);
    }
  }, [errorLogs]);

  // Example function to track API calls
  useEffect(() => {
    if (fetchDetails) {
      fetchDetails()
        .then((response) => {
          setInternalLogs((prevLogs) => [
            ...prevLogs,
            { type: 'api', message: `API call successful: ${response.status}`, timestamp: new Date().toLocaleString() }
          ]);
        })
        .catch((error) => {
          setInternalLogs((prevLogs) => [
            ...prevLogs,
            { type: 'error', message: `API call failed: ${error.message}`, timestamp: new Date().toLocaleString() }
          ]);
        });
    }
  }, [fetchDetails]);

  const formatLogEntry = (log) => {
    const time = log.timestamp ? `[${log.timestamp}] ` : '';
    switch (log.type) {
      case 'error':
        return <p style={{ color: 'red' }}>{`${time}Error: ${log.message}`}</p>;
      case 'api':
        return <p style={{ color: 'blue' }}>{`${time}API: ${log.message}`}</p>;
      case 'system':
        return <p style={{ color: 'green' }}>{`${time}System: ${log.message}`}</p>;
      default:
        return <p>{`${time}${log.message}`}</p>;
    }
  };

  return (
    <div className="info-panel">
      <h3>Advanced System Logs</h3>
      <div className="logs">
        {/* Display system lifecycle logs and external logs */}
        {[...internalLogs, ...logs].map((log, index) => (
          <div key={index}>
            {typeof log === 'object' ? formatLogEntry(log) : <p>{log}</p>}
          </div>
        ))}
        <div ref={logEndRef} /> {/* Empty div for auto-scrolling */}
      </div>

      {/* Additional features for advanced interaction */}
      <button onClick={() => setInternalLogs([])}>Clear Logs</button>
      <button onClick={() => downloadLogs([...internalLogs, ...logs])}>Download Logs</button>
    </div>
  );
};

// Example helper function to download logs as a file
const downloadLogs = (logs) => {
  const element = document.createElement('a');
  const file = new Blob([JSON.stringify(logs, null, 2)], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'system_logs.txt';
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
};

export default InfoPanel;
