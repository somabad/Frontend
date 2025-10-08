import React from 'react';

const ImageList = ({ images, onEditImage }) => {
  if (images.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        padding: '40px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p>No scanned forms uploaded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{
        marginBottom: '20px',
        color: '#333',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Uploaded Scanned Forms ({images.length})
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {images.map(image => (
          <div key={image.id} style={{
            background: 'white',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <img 
              src={image.preview} 
              alt={image.name}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '10px',
                border: '1px solid #dee2e6'
              }}
            />
            <div style={{ marginBottom: '10px' }}>
              <p style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333',
                fontSize: '14px',
                wordBreak: 'break-word'
              }}>
                {image.name}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: 0
              }}>
                {image.uploadDate}
              </p>
            </div>
            <button 
              onClick={() => onEditImage(image)}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                width: '100%'
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;