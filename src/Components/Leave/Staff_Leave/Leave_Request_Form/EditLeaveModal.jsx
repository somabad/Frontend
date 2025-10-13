import React, { useState, useEffect } from 'react';
import { updateLeaveApplication } from '../../../Attendance/utils';
import Swal from 'sweetalert2';

const EditLeaveModal = ({ isOpen, toggle, leave, onSave }) => {
  // Map leave_type to leave_type_id for editing
  const [form, setForm] = useState({ ...leave, leave_type_id: leave?.leave_type_id || leave?.leave_type });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

useEffect(() => {
  if (leave) {
    setForm({ ...leave, leave_type_id: leave?.leave_type_id || leave?.leave_type });
  }
}, [leave]);

useEffect(() => {
  if (form.start_date && form.end_date) {
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
    setForm((f) => ({
      ...f,
      total_days: diffDays > 0 ? diffDays : 0,
    }));
  }
}, [form.start_date, form.end_date]);


  if (!isOpen || !leave) return null;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size should not exceed 2 MB.');
        setForm((f) => ({ ...f, document: null }));
      } else {
        setError('');
        setForm((f) => ({ ...f, document: file }));
      }
    } else {
      setForm((f) => ({ ...f, document: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('leave_type_id', form.leave_type_id);
      formData.append('start_date', form.start_date);
      formData.append('end_date', form.end_date);
      formData.append('reason', form.reason);
      formData.append('is_half_day', form.is_half_day);
      formData.append('job_taken_over_by', form.job_taken_over_by);
      if (form.document && typeof form.document !== 'string') {
        formData.append('document', form.document);
      }

      // Use leave.request_id for update
      await updateLeaveApplication(leave.request_id || leave.id, formData);

      Swal.fire({ icon: 'success', title: 'Leave updated!' });
      onSave();
      toggle();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: err.response?.data?.error || 'Something went wrong.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .modal-backdrop.show {
          opacity: 0.5;
        }
        .form-check-input {
          opacity: 1 !important;
          position: static !important;
          appearance: auto !important;
        }
      `}</style>

      {/* Background overlay */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Leave</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={toggle}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Read-only staff details */}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_name || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Staff ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staffId || leave.staff_id || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_position || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_department || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    name="leave_type_id"
                    value={form.leave_type_id || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select leave type</option>
                    <option value="2">Annual Leave</option>
                    <option value="3">Medical Certificate</option>
                    <option value="4">Unpaid Leave</option>
                    <option value="5">Compassionate Leave</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    name="reason"
                    value={form.reason || ''}
                    onChange={handleChange}
                    required
                    rows={3}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Days</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.total_days || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={form.start_date || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={form.end_date || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    id="edit-half-day-checkbox"
                    type="checkbox"
                    className="form-check-input"
                    name="is_half_day"
                    checked={!!form.is_half_day}
                    onChange={handleCheckbox}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="edit-half-day-checkbox"
                  >
                    Is Half Day
                  </label>
                </div>

                <div className="mb-3">
                  <label className="form-label">Job Taken Over By</label>
                  <input
                    className="form-control"
                    name="job_taken_over_by"
                    value={form.job_taken_over_by || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Attachment (optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  <div className="form-text text-danger">
                    Note: Please upload files no larger than 2 MB.
                  </div>
                </div>

                {error && <div className="text-danger mb-2">{error}</div>}
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggle}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditLeaveModal;
