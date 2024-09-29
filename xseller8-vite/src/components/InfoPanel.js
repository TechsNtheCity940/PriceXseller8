import React from 'react';

const InfoPanel = ({ logs }) => {
  return (
    <div className="info-panel">
      <h3>System Logs</h3>
      <div className="logs">
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
