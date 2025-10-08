import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const BASE_URL = "http://127.0.0.1:8000/api";

const ImageList = ({ images, setImages, onEditImage, onRemoveImage }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const openConfirmModal = (image) => {
    setSelectedImage(image);
    setShowConfirm(true);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setSelectedImage(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedImage) return;
    
    // If it's an existing image from database and has a valid ID
    if (selectedImage.isExisting && selectedImage.id && selectedImage.id !== 'existing') {
      setLoading(true);
      try {
        // Try different possible API endpoints
        let deleteUrl = '';
        
        // Option 1: Delete by request_id (most common)
        if (selectedImage.request_id) {
          deleteUrl = `${BASE_URL}/delete_scanned_form/${selectedImage.request_id}/`;
        } 
        // Option 2: Delete by scanned_form_id
        else if (selectedImage.scanned_form_id) {
          deleteUrl = `${BASE_URL}/delete_scanned_form/${selectedImage.scanned_form_id}/`;
        }
        // Option 3: Delete by the image ID
        else {
          deleteUrl = `${BASE_URL}/delete_scanned_form/${selectedImage.id}/`;
        }

        console.log('Attempting to delete from:', deleteUrl);
        
        const response = await axios.delete(deleteUrl);
        const data = response.data;

        if (data.success) {
          // Update frontend list
          setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
          Swal.fire('Success', 'Scanned form deleted successfully!', 'success');
        } else {
          Swal.fire('Error', data.error || 'Failed to delete scanned form.', 'error');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        
        // If API delete fails, fall back to local removal
        if (error.response?.status === 404) {
          Swal.fire({
            title: 'API Endpoint Not Found',
            text: 'The delete endpoint was not found. Removing from local state only.',
            icon: 'warning'
          }).then(() => {
            setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
          });
        } else {
          Swal.fire('Error', 'An error occurred while deleting the scanned form.', 'error');
        }
      } finally {
        setLoading(false);
        closeConfirmModal();
      }
    } else {
      // For temporary images or existing images without proper ID, use the custom handler
      if (onRemoveImage) {
        onRemoveImage(selectedImage.id);
      } else {
        // Fallback: just remove from local state
        setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      }
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
        {images.some(img => img.isExisting) ? 'Existing Scanned Form' : 'Uploaded Scanned Forms'} ({images.length})
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
              borderLeft: image.isExisting ? '4px solid #ffc107' : '4px solid #28a745'
            }}
          >
            {/* Existing badge */}
            {image.isExisting && (
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                background: '#ffc107',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Existing
              </div>
            )}
            
            {/* Delete Button (X mark) */}
            <button
              onClick={() => openConfirmModal(image)}
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
              {image.isExisting && (
                <p style={{ fontSize: '10px', color: '#999', margin: '5px 0 0 0' }}>
                  ID: {image.id}
                </p>
              )}
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
        <ModalHeader toggle={closeConfirmModal}>
          {selectedImage?.isExisting ? 'Delete Scanned Form' : 'Remove Image'}
        </ModalHeader>
        <ModalBody className="text-center">
          {selectedImage?.isExisting ? (
            <div>
              <p>Are you sure you want to delete this scanned form from the database?</p>
              <p className="text-warning"><small>This action cannot be undone.</small></p>
              {selectedImage.id && (
                <p className="text-muted"><small>ID: {selectedImage.id}</small></p>
              )}
            </div>
          ) : (
            <p>Are you sure you want to remove this image?</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeConfirmModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={loading}>
            {loading ? <Spinner size="sm" /> : (selectedImage?.isExisting ? 'Delete Permanently' : 'Remove')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ImageList;