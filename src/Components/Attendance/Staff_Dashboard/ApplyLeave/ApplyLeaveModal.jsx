import React, { useState, useEffect } from 'react';
import { applyLeave } from '../../utils';
import Swal from 'sweetalert2';

const leaveTypes = [
  { value: 'Annual', label: 'Annual Leave' },
  { value: 'MC', label: 'Medical Certificate' },
  { value: 'Emergency', label: 'Emergency Leave' },
];

// Helper to ensure date is YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return '';
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
};

// Helper to remove stringified arrays (e.g., "['MC']" -> "MC")
const clean = (val) =>
  typeof val === 'string' && val.startsWith("['") && val.endsWith("']")
    ? val.slice(2, -2)
    : val;

const ApplyLeaveModal = ({ onClose, onSubmitted }) => {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDayLeave, setTotalDayLeave] =useState('');
  const [workGiven, setWorkGiven] = useState('');
  const [reason, setReason] = useState('');
  const [document, setDocument] = useState(null);

  const [balanceTotalLeave, setBalanceTotalLeave] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default staffId to 5 if not found in sessionStorage
  const staffId = 5;

  const today = new Date().toISOString().slice(0, 10);

  // Reset form fields when modal opens
  useEffect(() => {
    if (!submitting) {
      setLeaveType('Annual');
      setStartDate('');
      setEndDate('');
      setReason('');
      setDocument(null);
      setError('');
    }
  }, [onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2 MB in bytes
        setError('File size should not exceed 2 MB.');
        setDocument(null);
        return;
      } else {
        setError('');
        setDocument(file);
      }
    } else {
      setDocument(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Defensive: flatten any accidental arrays or stringified arrays
      const safeStaffId = Array.isArray(staffId) ? staffId[0] : staffId;
      const safeLeaveType = Array.isArray(leaveType) ? leaveType[0] : leaveType;
      const safeStartDate = Array.isArray(startDate) ? startDate[0] : startDate;
      const safeEndDate = Array.isArray(endDate) ? endDate[0] : endDate;
      const safeReason = Array.isArray(reason) ? reason[0] : reason;

      const leaveData = {
        staffId: parseInt(clean(safeStaffId), 10),
        leave_type: clean(safeLeaveType),
        start_date: formatDate(clean(safeStartDate)),
        end_date: formatDate(clean(safeEndDate)),
        reason: String(clean(safeReason)).trim(),
        document: document || undefined,
      };

      // Require reason
      if (!leaveData.reason) {
        setError('Please provide a reason for your leave.');
        setSubmitting(false);
        return;
      }

      console.log('Submitting leave (defensive):', leaveData);

      const formData = new FormData();
      formData.append('staffId', leaveData.staffId);
      formData.append('leave_type', leaveData.leave_type);
      formData.append('start_date', leaveData.start_date);
      formData.append('end_date', leaveData.end_date);
      formData.append('reason', leaveData.reason); // Always append
      if (document) {
        formData.append('document', document);
      }

      // Log all FormData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await applyLeave(formData);
      Swal.fire({
        icon: 'success',
        title: 'Leave application submitted!',
        text: 'Your leave application has been created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      onSubmitted();
    } catch (err) {
      console.error('Leave application error:', err);
      setError(
        err.response?.data
          ? typeof err.response.data === 'object'
            ? JSON.stringify(err.response.data)
            : String(err.response.data)
          : 'Failed to apply for leave. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Modal hidden state: don't render
  // (Parent should unmount, but for safety)
  // if (!show) return null;

  return (
    <>
      <div className="modal show fade d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Apply for Leave</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={submitting}
              ></button>
            </div>
            {/* Modal Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    min={today}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    min={today}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Document (optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  <div className="form-text text-danger">Note: Please upload files no larger than 2 MB. Larger files will not be accepted.</div>
                </div>
                {error && <div className="text-danger mb-2">{error}</div>}
              </form>
            </div>
            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
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

export default ApplyLeaveModal; 