import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import Swal from 'sweetalert2';

const ResetDevice = ({ isOpen, toggle, user }) => {
  const handleReset = () => {
    fetch(`https://v21.mysutera.my/api/reset-device-info/${user.staffId}/`, {
      method: 'POST',
    })
      .then(async (response) => {
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Device info has been reset for ${user.name}.`,
          }).then(() => {
            toggle(); // close modal
            window.location.reload(); // refresh to reflect changes
          });
        } else {
          const error = await response.json();
          Swal.fire('Error', error.message || 'Failed to reset device info.', 'error');
        }
      })
      .catch((error) => {
        console.error('Reset error:', error);
        Swal.fire('Error', 'An error occurred while resetting device info.', 'error');
      });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Reset Device Info</ModalHeader>
      <ModalBody>
        <p>
          <strong>User:</strong> {user.name}
        </p>
        <p>
          <strong>Current Device Info:</strong><br />
          {user.device_info ? (
            <code style={{ wordBreak: 'break-word' }}>{user.device_info}</code>
          ) : (
            <em>No device info available.</em>
          )}
        </p>
        <p>Are you sure you want to reset this user's device information?</p>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={handleReset}>Reset Device Info</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResetDevice;
