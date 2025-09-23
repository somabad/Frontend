import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
import { XCircle } from 'react-feather';

const DeleteConfirmationModal = ({ isOpen, toggle, onConfirm, userName }) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      className="custom-modal-width"
    >
      <ModalHeader toggle={toggle} className="border-0 justify-content-center pb-0">
        <div className="d-flex flex-column align-items-center w-100">
          <XCircle size={48} color="#e63946" className="mb-2" />
          <h5 className="fw-bold text-danger mb-2">Delete Confirmation</h5>
        </div>
      </ModalHeader>

      <ModalBody className="text-center px-4">
        <p className="text-muted mb-0">
          Are you sure you want to delete{' '}
          <strong className="text-dark">{userName}</strong>?
        </p>
      </ModalBody>

      <ModalFooter className="border-0 justify-content-center px-4">
        <div className="d-flex w-100 gap-2 justify-content-center">
          <Button
            onClick={onConfirm}
            style={{
              backgroundColor: '#ff4d4f',
              borderColor: '#ff4d4f',
              width: '40%',
              borderRadius: '10px',
              fontWeight: '600'
            }}
          >
            Yes, Delete
          </Button>
          <Button
            onClick={toggle}
            style={{
              backgroundColor: '#ff6b81',
              borderColor: '#ff6b81',
              width: '40%',
              borderRadius: '10px',
              fontWeight: '600'
            }}
          >
            Cancel
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmationModal;
