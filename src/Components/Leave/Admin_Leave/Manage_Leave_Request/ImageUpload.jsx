import React, { useRef } from 'react';

const ImageUpload = ({ onImageUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(file, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      background: '#f8f9fa',
      marginBottom: '20px'
    }}>
      <button 
        onClick={handleUploadClick}
        style={{
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        Upload Scanned Form
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <p style={{
        marginTop: '10px',
        color: '#666',
        fontSize: '14px'
      }}>
        Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
};

export default ImageUpload;

