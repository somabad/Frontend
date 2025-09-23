import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../utils'; 
import Swal from 'sweetalert2';

const ModalProfile = ({ show, onClose, user, onResetPassword, onProfileUpdated }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const staffId = sessionStorage.getItem('staffId');

  // Reset form fields whenever `user` or `show` changes (modal opens or user changes)
  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user, show]);

  if (!show) return null;

  const handleSave = async () => {
    const updatedData = { name, email, phone };

    try {
      await updateProfile(staffId, updatedData);
      Swal.fire({ 
        icon: 'success', 
        title: 'Profile updated successfully!', 
        timer: 2000, 
        showConfirmButton: false 
      });

      // Notify parent about the updated profile data
      if (onProfileUpdated) {
        onProfileUpdated(updatedData);
      }

      onClose();
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Failed to update profile', 
        text: error.message || 'Please try again later.' 
      });
    }
  };

  return (
    <>
      <div className="modal show fade d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            {/* Modal Header with Title */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Profile</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={onResetPassword}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ModalProfile;
