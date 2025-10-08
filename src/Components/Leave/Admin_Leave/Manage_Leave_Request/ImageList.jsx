import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api"; // update if needed

const ImageList = ({ images, setImages, onEditImage }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [loading, setLoading] = useState(false);

  const openConfirmModal = (id) => {
    setSelectedImageId(id);
    setShowConfirm(true);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setSelectedImageId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedImageId) return;
    setLoading(true);

    try {
      const response = await axios.delete(`${BASE_URL}/delete_scanned_form/${selectedImageId}/`);
      const data = response.data;

      if (data.success) {
        // Update frontend list
        setImages((prev) => prev.filter((img) => img.id !== selectedImageId));
      } else {
        alert(data.error || 'Failed to delete scanned form.');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('An error occurred while deleting the scanned form.');
    } finally {
      setLoading(false);
      closeConfirmModal();
    }
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <p>No scanned forms uploaded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h3
        style={{
          marginBottom: '20px',
          color: '#333',
          fontSize: '20px',
          fontWeight: '600',
        }}
      >
        Uploaded Scanned Forms ({images.length})
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: '1px solid #e9ecef',
              position: 'relative',
            }}
          >
            {/* Delete Button (X mark) */}
            <button
              onClick={() => openConfirmModal(image.id)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '30px',
                height: '30px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              title="Delete image"
            >
              ×
            </button>

            <img
              src={image.preview}
              alt={image.name}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '10px',
                border: '1px solid #dee2e6',
              }}
            />
            <div style={{ marginBottom: '10px' }}>
              <p
                style={{
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: '#333',
                  fontSize: '14px',
                  wordBreak: 'break-word',
                }}
              >
                {image.name}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#666',
                  margin: 0,
                }}
              >
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
                width: '100%',
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} toggle={closeConfirmModal} centered>
        <ModalHeader toggle={closeConfirmModal}>Confirm Delete</ModalHeader>
        <ModalBody className="text-center">
          Are you sure you want to delete this scanned form?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeConfirmModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ImageList;
