import React, { useEffect, useRef } from 'react';

const InfoPanel = ({ logs }) => {
  const logEndRef = useRef(null);

  // Auto-scroll to the latest log entry
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="info-panel">
      <h3>System Logs</h3>
      <div className="logs">
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
        <div ref={logEndRef} /> {/* Empty div for auto-scrolling */}
      </div>
    </div>
  );
};

export default InfoPanel;
