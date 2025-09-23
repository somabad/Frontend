  import React, { useEffect, useState } from 'react';
  import Swal from 'sweetalert2';
  import { Eye, EyeOff } from 'lucide-react';
  import { resetPassword } from '../../utils';

  const ModalResetPassword = ({ show, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const staffId = sessionStorage.getItem('staffId');

    useEffect(() => {
      if (!show) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);
      }
    }, [show]);

    if (!show) return null;

    const handleSave = async () => {
      const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

      if (newPassword.length < 8 || !symbolRegex.test(newPassword)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Password',
          text: 'Password must be at least 8 characters long and include at least one symbol. eg: /[!@#$%^&*(),.?":{}|<>]/.',
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'New passwords do not match!',
        });
        return;
      }

      try {
        await resetPassword(staffId, oldPassword, newPassword);
        Swal.fire({
          icon: 'success',
          title: 'Password successfully updated!',
          timer: 2000,
          showConfirmButton: false,
        });
        onClose();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to update password',
          text: error.response?.data?.error || 'Something went wrong.',
        });
      }
    };


    return (
      <>
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              {/* Updated modal header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Reset Password</h5>
                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
              </div>

              <div className="modal-body">
                {/* OLD PASSWORD */}
                <div className="mb-3">
                  <label className="form-label">Old Password</label>
                  <div className="input-group">
                    <input
                      type={showOld ? 'text' : 'password'}
                      className="form-control"
                      value={oldPassword}
                      placeholder="Enter your old password"
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <span
                      className="input-group-text"
                      onClick={() => setShowOld(!showOld)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <div className="input-group">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-control"
                      value={newPassword}
                      placeholder="Enter your new password"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span
                      className="input-group-text"
                      onClick={() => setShowNew(!showNew)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-control"
                      value={confirmPassword}
                      placeholder="Confirm your new password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      className="input-group-text"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  export default ModalResetPassword;
