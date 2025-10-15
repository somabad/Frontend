import React, { useState, useEffect } from 'react';
import { getStaffDashboard, applyLeave, getStaffList, getLeaveBalance, getLeaveTypeList } from '../../../Attendance/utils';
import Swal from 'sweetalert2';
import { Tooltip} from 'reactstrap';
import { AiOutlineInfoCircle } from 'react-icons/ai';

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
  // ...existing useState declarations...
  const [staffName, setStaffName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [staffPosition, setStaffPosition] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [jobTakenOverBy, setJobTakenOverBy] = useState('');
  const [attachment, setAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState(leaveTypes);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Auto-calculate totalDays when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (isHalfDay) {
          setTotalDays('0.5');
        } else {
          setTotalDays(days.toString());
        }
      } else {
        setTotalDays('');
      }
    } else {
      setTotalDays('');
    }
  }, [startDate, endDate, isHalfDay]);


  const today = new Date().toISOString().slice(0, 10);

  const fetchData = async () => {
    try {
      const currentStaffId = sessionStorage.getItem("staffId");
      if (!currentStaffId) throw new Error("No staff Id found in session");
      
      setStaffId(currentStaffId);
      // Prefer detail from staff list for consistent shape
      const [list, data, balanceData, leaveTypesFromAPI] = await Promise.all([
        getStaffList().catch(() => null),
        getStaffDashboard(currentStaffId).catch(() => null),
        getLeaveBalance(currentStaffId).catch(() => null),
        getLeaveTypeList().catch(() => null)
      ]);
      console.log("API.Response:", { list, dashboard: data, balances: balanceData, leaveTypesFromAPI });
      
      // Set staff details from API response
      if (list && Array.isArray(list)) {
        const detail = list.find((s) => String(s.staffId) === String(currentStaffId));
        if (detail) {
          setStaffName(detail.name || '');
          setStaffPosition(detail.position || '');
          setStaffDepartment(detail.department || '');
          setTotalDays(detail.totalDays || '');
        }
      }

      if (data && (!staffName || !staffPosition || !staffDepartment || !totalDays)) {
        const resolvedName = data?.name || '';
        const resolvedPosition = data?.position || '';
        const resolvedDepartment = data?.department || '';
        const resolvedTotalDays = data?.totalDays || '';
        setStaffName(resolvedName);
        setStaffPosition(resolvedPosition);
        setStaffDepartment(resolvedDepartment);
        setTotalDays(resolvedTotalDays)
        // Set current timestamp when form is displayed
        setCreatedAt(new Date().toLocaleString());
      }

      // Use leave types from API if available, otherwise fall back to static list
      const leaveTypesToFilter = leaveTypesFromAPI && Array.isArray(leaveTypesFromAPI) ? leaveTypesFromAPI : leaveTypes;
      console.log("Leave types to filter:", leaveTypesToFilter);

      // Set leave balances and filter available leave types
      if (balanceData) {
        setLeaveBalances(balanceData);
        console.log("Raw balance data:", balanceData);
        console.log("Balance data keys:", Object.keys(balanceData));
        
        // Create a mapping between leave type labels and balance data keys
        const leaveTypeMapping = {
          'Annual Leave': 'Annual',
          'Medical Certificate': 'MC',
          'Unpaid Leave': 'Unpaid',
          'Compassionate Leave': 'Compassionate'
        };
        
        // Filter leave types to only show those with remaining balance > 0
        const filteredLeaveTypes = leaveTypesToFilter.filter(leaveType => {
          const leaveTypeName = leaveType.label || leaveType.name;
          console.log(`Looking for balance data for: "${leaveTypeName}"`);
          
          // Use mapping to find the correct balance key
          const balanceKey = leaveTypeMapping[leaveTypeName] || leaveTypeName;
          const balance = balanceData[balanceKey];
          
          console.log(`Mapped "${leaveTypeName}" to balance key "${balanceKey}"`);
          console.log(`Checking ${leaveTypeName}:`, balance);
          
          // If no balance data for this type, assume it's available (e.g., types not tracked)
          if (!balance) {
            console.log(`No balance data for ${leaveTypeName}, keeping it available`);
            return true;
          }
          
          // Only show if remaining balance > 0
          const remainingDays = Number(balance.remaining || 0);
          console.log(`${leaveTypeName} has ${remainingDays} remaining days`);
          const shouldShow = remainingDays > 0;
          console.log(`${leaveTypeName} will be ${shouldShow ? 'SHOWN' : 'HIDDEN'}`);
          return shouldShow;
        });
        
        setAvailableLeaveTypes(filteredLeaveTypes);
        console.log("Filtered leave types:", filteredLeaveTypes);
      } else {
        console.log("No balance data available, showing all leave types");
        // If no balance data available, show all leave types
        setAvailableLeaveTypes(leaveTypesToFilter);
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
      setReason('');
      setIsHalfDay(false);
      setJobTakenOverBy('');
      setAttachment(null);
      setError('');
      setAvailableLeaveTypes(leaveTypes); // Reset to all leave types initially
      setLeaveBalances({}); // Clear previous balance data
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
      const safeReason = Array.isArray(reason) ? reason[0] : reason;
      const safeIsHalfDay = Array.isArray(isHalfDay) ? isHalfDay[0] : isHalfDay;
      const safeJobTakenOverBy = Array.isArray(jobTakenOverBy) ? jobTakenOverBy[0] : jobTakenOverBy;
      const safeAttachment = Array.isArray(attachment) ? attachment[0] : attachment;


      // Check if any leave types are available
      if (availableLeaveTypes.length === 0) {
        setError('No leave types available. You have used all your allocated leave days.');
        setSubmitting(false);
        return;
      }

      // Require leave type
      if (!safeLeaveType) {
        setError('Please choose leave');
        setSubmitting(false);
        return;
      }

      // Require start date
      if (!safeStartDate) {
        setError('Please select start date');
        setSubmitting(false);
        return;
      }

      // Require end date
      if (!safeEndDate) {
        setError('Please select end date');
        setSubmitting(false);
        return;
      }

      const leaveData = {
        leave_type: clean(safeLeaveType),
        start_date: formatDate(clean(safeStartDate)),
        end_date: formatDate(clean(safeEndDate)),
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

      const response = await applyLeave(formData);

     if (response && response.data && response.data.leave_request) {
        setRequestId(response.data.leave_request.request_id);
      }

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
      <style>{`
        .form-check-input { opacity: 1 !important; position: static !important; appearance: auto !important; }
        .form-check-label { display: inline-block !important; }
      `}</style>
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
                  value={requestId}
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
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select leave type</option>
                    {availableLeaveTypes.map(type => {
                      const leaveTypeName = type.label || type.name;
                      
                      // Use the same mapping as in the filtering logic
                      const leaveTypeMapping = {
                        'Annual Leave': 'Annual',
                        'Medical Certificate': 'MC',
                        'Unpaid Leave': 'Unpaid',
                        'Compassionate Leave': 'Compassionate'
                      };
                      
                      const balanceKey = leaveTypeMapping[leaveTypeName] || leaveTypeName;
                      const balance = leaveBalances[balanceKey];
                      
                      return (
                        <option key={type.value || type.id} value={type.value || type.id}>
                          {leaveTypeName}
                          {balance && ` (${balance.remaining} days remaining)`}
                        </option>
                      );
                    })}
                  </select>
                  {availableLeaveTypes.length === 0 && (
                    <div className="form-text text-warning">
                      No leave types available. You have used all your allocated leave days.
                    </div>
                  )}
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
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Total Days</label>
                  <span
                    id="info-icon"
                    style={{ marginLeft: '8px', cursor: 'pointer', color: '#888'}}
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                  >
                    <AiOutlineInfoCircle size={16} />
                  </span>
                  <Tooltip
                    placement='right'
                    isOpen={tooltipOpen}
                    target="info-icon"
                    toggle={() => setTooltipOpen(!tooltipOpen)}
                  >
                    Total days will be automatically calculated based on start and end dates.
                  </Tooltip>

                  <input
                  type= 'text'
                  className='form-control'
                  value={totalDays}
                  readOnly
                  />
                </div>
                <div className='mb-3'>
                  <div className='form-check'>
                    <input
                      id='half-day-checkbox'
                      type='checkbox'
                      className='form-check-input'
                      checked={!!isHalfDay}
                      onChange={e => setIsHalfDay(e.target.checked)}
                    />
                    <label className='form-check-label' htmlFor='half-day-checkbox'>Is Half Day</label>
                  </div>
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
                disabled={submitting || availableLeaveTypes.length === 0}
              >
                {submitting ? 'Submitting...' : availableLeaveTypes.length === 0 ? 'No Leave Available' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
       </div>
     </>
   );
};

export default ApplyLeaveModal; 