import React, { useState, useEffect } from 'react';
import { getStaffDashboard, applyLeave } from '../../../Attendance/utils';
import Swal from 'sweetalert2';

const leaveTypes = [
  { value: '2', label: 'Annual Leave' },
  { value: '3', label: 'Medical Certificate' },
  { value: '4', label: 'Unpaid Leave'},
  { value: '5', label: 'Compassionate Leave'},
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

const ApplyLeaveModal = ({ isOpen, onClose, onSubmitted }) => {
  const [staffName, setStaffName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffPosition, setStaffPosition] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState('');
  const [jobTakenOverBy, setJobTakenOverBy] = useState('');
  const [attachment, setAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const fetchData = async () => {
    try {
      const currentStaffId = sessionStorage.getItem("staffId");
      if (!currentStaffId) throw new Error("No staff Id found in session");
      
      setStaffId(currentStaffId);
      const data = await getStaffDashboard(currentStaffId);
      console.log("API.Response:", data);
      
      // Set staff details from API response
      if (data) {
        console.log("Staff data received:", {
          name: data.name,
          position: data.position,
          department: data.department,
          staff_id: data.staff_id
        });
        setStaffName(data.name || '');
        setStaffPosition(data.position || '');
        setStaffDepartment(data.department || '');
        // Set current timestamp when form is displayed
        setCreatedAt(new Date().toLocaleString());
      }
    } catch (err) {
      setError("Failed to load staff data");
      console.error(err);
    }
  };

      // Reset form fields when modal opens and fetch staff data
  useEffect(() => {
    if (isOpen) {
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setTotalDays('');
      setReason('');
      setIsHalfDay('');
      setJobTakenOverBy('');
      setAttachment(null);
      setError('');
    }
    fetchData();
  }, [isOpen]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2 MB in bytes
        setError('File size should not exceed 2 MB.');
        setAttachment(null);
        return;
      } else {
        setError('');
        setAttachment(file);
      }
    } else {
      setAttachment(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Defensive: flatten any accidental arrays or stringified arrays
      const safeLeaveType = Array.isArray(leaveType) ? leaveType[0] : leaveType;
      const safeStartDate = Array.isArray(startDate) ? startDate[0] : startDate;
      const safeEndDate = Array.isArray(endDate) ? endDate[0] : endDate;
      const safeTotalDays = Array.isArray(totalDays) ? totalDays[0] : totalDays;
      const safeReason = Array.isArray(reason) ? reason[0] : reason;
      const safeIsHalfDay = Array.isArray(isHalfDay) ? isHalfDay[0] : isHalfDay;
      const safeJobTakenOverBy = Array.isArray(jobTakenOverBy) ? jobTakenOverBy[0] : jobTakenOverBy;
      const safeAttachment = Array.isArray(attachment) ? attachment[0] : attachment;

      const leaveData = {
        leave_type: clean(safeLeaveType),
        start_date: formatDate(clean(safeStartDate)),
        end_date: formatDate(clean(safeEndDate)),
        total_days: parseFloat(clean(safeTotalDays)),
        reason: String(clean(safeReason)).trim(),
        is_half_day: isHalfDay || false,
        job_taken_over_by: String(clean(safeJobTakenOverBy)),
        attachment: attachment || undefined,
      };

      // Require reason
      if (!leaveData.reason) {
        setError('Please provide a reason for your leave.');
        setSubmitting(false);
        return;
      }

      console.log('Submitting leave (defensive):', leaveData);

      const formData = new FormData();
      formData.append('staffId', staffId);
      formData.append('leave_type_id', leaveData.leave_type);
      formData.append('start_date', leaveData.start_date);
      formData.append('end_date', leaveData.end_date);
      formData.append('total_days', leaveData.total_days);
      formData.append('reason', leaveData.reason); // Always append
      formData.append('is_half_day', leaveData.is_half_day);
      formData.append('job_taken_over_by', leaveData.job_taken_over_by);
      if (attachment) {
        formData.append('attachment', attachment);
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
  if (!isOpen) return null;

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
                 className="btn-close"
                 aria-label="Close"
                 onClick={onClose}
               ></button>
            </div>
            {/* Modal Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value={staffName}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Staff Id</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value={staffId}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Position</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value= {staffPosition}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Created At</label>
                  <input
                  type= "text"
                  className='form-control'
                  value= {createdAt}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Department</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value= {staffDepartment}
                  readOnly 
                  >
                  </input>
                </div>
                <div className="mb-3">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    value={leaveTypes}
                    onChange={e => setLeaveType(e.target.value)}
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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
                <div className='mb-3'>
                  <label className='form-label'>Total Days</label>
                  <input
                  className='form-control'
                  value={totalDays}
                  onChange= {e => setTotalDays(e.target.value)}
                  required
                  />
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
                <div className='mb-3'>
                  <label className='form-label'>Is Half Day</label>
                  <input
                  type= 'checkbox'
                  className='form-check-input'
                  checked={isHalfDay}
                  onChange={e => setIsHalfDay(e.target.checked)}
                />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Job Taken Over By:</label>
                  <input
                  className='form-control'
                  value={jobTakenOverBy}
                  onChange= {e => setJobTakenOverBy(e.target.value)}
                  required
                  /> 
                </div>
                <div className="mb-3">
                  <label className="form-label">Attachment (optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  <div className="form-text text-danger">Note: Please attach files no larger than 2 MB. Larger files will not be accepted.</div>
                </div>
                {error && <div className="text-danger mb-2">{error}</div>}
              </form>
            </div>
            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  console.log("Cancel clicked");
                  onClose();
                }}
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
     </>
   );
};

export default ApplyLeaveModal; 