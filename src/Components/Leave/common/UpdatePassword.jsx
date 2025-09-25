import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Cancel, Yes } from '../../../Constant/indexmy';
import axios from 'axios';
import Swal from 'sweetalert2';

const UpdatePassword = ({ btnText, value: staffId, externalModalOpen, setExternalModalOpen, onClose }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = externalModalOpen !== undefined ? externalModalOpen : internalOpen;
  const setModalOpen = setExternalModalOpen || setInternalOpen;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const toggleModal = () => {
    resetForm();             // Reset input fields
    setModalOpen(false);     // Close the modal
    if (onClose) onClose();  // Optionally reopen parent modal
  };

  const handleResetPassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toggleModal(); // Close modal and reset fields
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toggleModal();
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'New passwords do not match.',
      });
      return;
    }

    try {
      setLoading(true);

      await axios.post(`https://v21.mysutera.my/api/update-password/${staffId}/`, {
        old_password: oldPassword,
        new_password: newPassword
      });

      toggleModal();  // Close modal and reset fields

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password reset successful.',
        confirmButtonText: 'OK',
      });
    } catch (err) {
      toggleModal();  // Close modal and reset fields

      await Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to reset password. Check your old password and try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!btnText ? null : (
        <Btn attrBtn={{ color: 'info', onClick: () => setModalOpen(true) }}>
          {btnText || 'Update Password'}
        </Btn>
      )}

      <Modal isOpen={modalOpen} toggle={toggleModal} size="md" centered>
        <ModalHeader toggle={toggleModal}>Reset Password</ModalHeader>
        <ModalBody className="p-3">
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group mt-2">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group mt-2">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Btn attrBtn={{ color: 'secondary', onClick: toggleModal }}>{Cancel}</Btn>
          <Btn attrBtn={{ color: 'primary', onClick: handleResetPassword, disabled: loading }}>
            {loading ? 'Resetting...' : Yes}
          </Btn>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UpdatePassword;
