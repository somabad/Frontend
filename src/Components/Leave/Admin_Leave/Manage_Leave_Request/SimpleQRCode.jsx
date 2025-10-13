import React from 'react';

// Simple QR code generator without external dependencies
const SimpleQRCode = ({ value, size = 200 }) => {
  // Simple QR-like pattern for demonstration
  // In a real app, you'd use a proper QR library
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'white',
        padding: '10px',
        display: 'inline-block',
        border: '2px solid #000'
      }}
    >
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        border: '2px dashed #333'
      }}>
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          📱 SCAN WITH PHONE
        </div>
        <div style={{ fontSize: '10px', wordBreak: 'break-all' }}>
          {value.substring(0, 30)}...
        </div>
      </div>
    </div>
  );
};

export default SimpleQRCode;