import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Swal from "sweetalert2";
import ImageUpload from "./ImageUpload";
import ImageList from "./ImageList";
import SimpleImageEditor from "./SimpleImageEditor";
import { uploadScannedForm } from "../../../Attendance/utils";

const UploadImageModal = ({ isOpen, onClose, leave, fetchLeaveHistory }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (file, preview) => {
    const newImage = {
      id: Date.now(),
      file,
      preview,
      name: file.name,
      uploadDate: new Date().toLocaleString(),
    };
    setUploadedImages((prev) => [newImage, ...prev]);
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
  const handleRemoveImage = (id) =>
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));

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
      const response = await fetch(image.preview);
      const blob = await response.blob();
      const file = new File([blob], image.name, { type: "image/jpeg" });

      await uploadScannedForm(leave.request_id, file);
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
        Upload Scanned Form - {leave?.staff_name}
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
            <ImageUpload onImageUpload={handleImageUpload} />
            <ImageList
              images={uploadedImages}
              onEditImage={handleEditImage}
              onRemoveImage={handleRemoveImage}
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
              Upload to Database
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


