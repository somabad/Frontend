import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Swal from "sweetalert2";
import ImageUpload from "./ImageUpload";
import ImageList from "./ImageList"; // Your current ImageList
import SimpleImageEditor from "./SimpleImageEditor";
import { uploadScannedForm } from "../../../Attendance/utils";

const UploadImageModal = ({ isOpen, onClose, leave, fetchLeaveHistory, existingScannedForm }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load existing scanned form when modal opens
  useEffect(() => {
    if (isOpen && existingScannedForm) {
      // Convert existing form to the same format as new uploads
      const existingImage = {
        id: existingScannedForm.id || 'existing',
        file: null,
        preview: existingScannedForm.preview || existingScannedForm.image_url,
        name: existingScannedForm.name || 'Existing Scanned Form',
        uploadDate: existingScannedForm.uploadDate || existingScannedForm.created_at || 'Previously uploaded',
        isExisting: true
      };
      setUploadedImages([existingImage]);
    } else if (isOpen) {
      // Reset if no existing form
      setUploadedImages([]);
    }
  }, [isOpen, existingScannedForm]);

  const handleImageUpload = (file, preview) => {
    const newImage = {
      id: Date.now(), // Temporary ID for new uploads
      file,
      preview,
      name: file.name,
      uploadDate: new Date().toLocaleString(),
      isExisting: false
    };
    
    // If there's an existing image, replace it with the new one
    if (uploadedImages.some(img => img.isExisting)) {
      setUploadedImages([newImage]);
    } else {
      setUploadedImages((prev) => [newImage, ...prev]);
    }
  };

  const handleEditImage = (image) => setEditingImage(image);

  const handleSaveEditedImage = (editedImage) => {
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === editingImage.id ? { ...img, preview: editedImage } : img
      )
    );
    setEditingImage(null);
  };

  const handleCancelEdit = () => setEditingImage(null);

  const handleUploadToServer = async () => {
    if (!leave) {
      Swal.fire("Error", "No leave request selected", "error");
      return;
    }

    if (uploadedImages.length === 0) {
      Swal.fire("Warning", "Please upload an image first", "warning");
      return;
    }

    setUploading(true);
    try {
      const image = uploadedImages[0];
      
      // For new uploads, we have the file object
      if (image.file) {
        await uploadScannedForm(leave.request_id, image.file);
      } else {
        // For existing images that were edited, we need to convert dataURL to file
        const response = await fetch(image.preview);
        const blob = await response.blob();
        const file = new File([blob], image.name, { type: "image/jpeg" });
        await uploadScannedForm(leave.request_id, file);
      }
      
      Swal.fire("Success", "Scanned form uploaded successfully!", "success");
      fetchLeaveHistory?.();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Failed to upload scanned form", "error");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploadedImages([]);
    setEditingImage(null);
    setUploading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        reset();
        onClose();
      }}
      size="xl"
    >
      <ModalHeader toggle={() => { reset(); onClose(); }}>
        {existingScannedForm ? "Reupload" : "Upload"} Scanned Form - {leave?.staff_name}
        {existingScannedForm && (
          <span style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginLeft: '10px',
            fontStyle: 'italic'
          }}>
            (Existing scanned form will be replaced)
          </span>
        )}
      </ModalHeader>
      <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {editingImage ? (
          <SimpleImageEditor
            image={editingImage}
            onSave={handleSaveEditedImage}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              existingImages={uploadedImages}
            />
            <ImageList
              images={uploadedImages}
              setImages={setUploadedImages}
              onEditImage={handleEditImage}
            />
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleUploadToServer}
          disabled={uploadedImages.length === 0 || uploading}
          style={{ minWidth: "160px" }}
        >
          {uploading ? (
            <>
              <i className="fa fa-spinner fa-spin me-2" />
              Uploading...
            </>
          ) : (
            <>
              <i className="fa fa-upload me-2" />
              {existingScannedForm ? "Replace" : "Upload"} to Database
            </>
          )}
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadImageModal;