import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ConfirmDeleteModal = ({ isOpen, toggle, onConfirm, locationName }) => (
  <Modal isOpen={isOpen} toggle={toggle} centered>
    <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
    <ModalBody>
      Are you sure you want to delete:
      <ul>
        {locationName.split(', ').map((name, index) => (
          <li key={index}><strong>{name}</strong></li>
        ))}
      </ul>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={onConfirm}>
        Yes, Delete
      </Button>
      <Button color="secondary" onClick={toggle}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default ConfirmDeleteModal;
