import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";

const ViewImageModal = ({ isOpen, imageUrl, loading, onClose }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>View Scanned Form</ModalHeader>
      <ModalBody
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        {loading ? (
          <Spinner color="primary" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Scanned Form"
            style={{ maxWidth: "100%", borderRadius: "10px" }}
          />
        ) : (
          <p className="text-muted">No image available</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewImageModal;
