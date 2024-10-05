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
          <p key={index}>
            {/* Check if the log is an object and render its properties, or just render it if it's a string. */}
            {typeof log === 'object' ? `${log.message} - ${log.type}` : log}
          </p>
        ))}
        <div ref={logEndRef} /> {/* Empty div for auto-scrolling */}
      </div>
    </div>
  );
};

export default InfoPanel;
