import React, { useState, useEffect } from 'react';
import { getStaffDashboard, applyLeave, getStaffList, getLeaveBalance, getLeaveTypeList } from '../../../Attendance/utils';
import Swal from 'sweetalert2';
import { Tooltip} from 'reactstrap';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaLanguage } from 'react-icons/fa';

const leaveTypes = [
  { value: '2', label: 'Annual Leave' },
  { value: '3', label: 'Medical Certificate' },
  { value: '4', label: 'Unpaid Leave'},
  { value: '5', label: 'Compassionate Leave'},
];

// Translation object for multilingual support
const translations = {
  en: {
    title: 'Apply for Leave',
    name: 'Name',
    staffId: 'Staff Id',
    position: 'Position',
    createdAt: 'Created At',
    department: 'Department',
    seksyen: 'Section',
    leaveType: 'Leave Type',
    selectLeaveType: 'Select leave type',
    reason: 'Reason',
    startDate: 'Start Date',
    endDate: 'End Date',
    totalDays: 'Total Days',
    isHalfDay: 'Is Half Day',
    jobTakenOverBy: 'Job Taken Over By:',
    attachment: 'Attachment (optional)',
    fileSizeNote: 'Note: Please attach files no larger than 2 MB. Larger files will not be accepted.',
    cancel: 'Cancel',
    submit: 'Submit',
    submitting: 'Submitting...',
    noLeaveAvailable: 'No Leave Available',
    successTitle: 'Leave application submitted!',
    successText: 'Your leave application has been created successfully.',
    errors: {
      noLeaveTypes: 'No leave types available. You have used all your allocated leave days.',
      chooseLeave: 'Please choose leave',
      selectStartDate: 'Please select start date',
      selectEndDate: 'Please select end date',
      provideReason: 'Please provide a reason for your leave.',
      fileSize: 'File size should not exceed 2 MB.',
      loadStaffData: 'Failed to load staff data',
      applyLeave: 'Failed to apply for leave. Please try again.'
    },
    tooltip: 'Total days will be automatically calculated based on start and end dates.',
    leaveTypes: {
      annual: 'Annual Leave',
      medical: 'Medical Certificate', 
      unpaid: 'Unpaid Leave',
      compassionate: 'Compassionate Leave'
    }
  },
  ms: {
    title: 'Borang Permohonan Cuti',
    name: 'Nama',
    staffId: 'No. Pekerja',
    position: 'Jawatan',
    createdAt: 'Tarikh Permohonan',
    section: 'Seksyen',
    department: 'Bahagian',
    leaveType: 'Jenis Cuti',
    selectLeaveType: 'Pilih jenis cuti',
    reason: 'Sebab Cuti',
    startDate: 'Dari',
    endDate: 'Hingga',
    totalDays: 'Bilangan cuti diambil',
    isHalfDay: 'Separuh Hari',
    jobTakenOverBy: 'Tugas harian saya akan dijalankan oleh:',
    attachment: 'Lampiran (pilihan)',
    fileSizeNote: 'Nota: Sila lampirkan fail tidak melebihi 2 MB. Fail yang lebih besar tidak akan diterima.',
    cancel: 'Cancel',
    submit: 'Submit',
    submitting: 'Menghantar...',
    noLeaveAvailable: 'Tiada Cuti Tersedia',
    successTitle: 'Permohonan cuti dihantar!',
    successText: 'Permohonan cuti anda telah berjaya dibuat.',
    errors: {
      noLeaveTypes: 'Tiada jenis cuti tersedia. Anda telah menggunakan semua hari cuti yang diperuntukkan.',
      chooseLeave: 'Sila pilih cuti',
      selectStartDate: 'Sila pilih tarikh mula',
      selectEndDate: 'Sila pilih tarikh tamat',
      provideReason: 'Sila berikan sebab untuk cuti anda.',
      fileSize: 'Saiz fail tidak boleh melebihi 2 MB.',
      loadStaffData: 'Gagal memuatkan data pekerja',
      applyLeave: 'Gagal memohon cuti. Sila cuba lagi.'
    },
    tooltip: 'Jumlah hari akan dikira secara automatik berdasarkan tarikh mula dan tamat.',
    leaveTypes: {
      annual: 'Cuti Tahunan',
      medical: 'Cuti Sakit',
      unpaid: 'Cuti Tanpa Gaji',
      compassionate: 'Cuti Ehsan'
    }
  }
};

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
  const [language, setLanguage] = useState('en'); // Add language state

  // Get current translation
  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ms' : 'en');
  };

  // Function to translate leave type names
  const translateLeaveType = (originalName) => {
    const leaveTypeMapping = {
      'Annual Leave': t.leaveTypes.annual,
      'Medical Certificate': t.leaveTypes.medical,
      'Unpaid Leave': t.leaveTypes.unpaid,
      'Compassionate Leave': t.leaveTypes.compassionate
    };
    return leaveTypeMapping[originalName] || originalName;
  };

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
      setError(t.errors.loadStaffData);
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
        setError(t.errors.fileSize);
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
        setError(t.errors.noLeaveTypes);
        setSubmitting(false);
        return;
      }

      // Require leave type
      if (!safeLeaveType) {
        setError(t.errors.chooseLeave);
        setSubmitting(false);
        return;
      }

      // Require start date
      if (!safeStartDate) {
        setError(t.errors.selectStartDate);
        setSubmitting(false);
        return;
      }

      // Require end date
      if (!safeEndDate) {
        setError(t.errors.selectEndDate);
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
        setError(t.errors.provideReason);
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
        title: t.successTitle,
        text: t.successText,
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
          : t.errors.applyLeave
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
              <h5 className="modal-title">{t.title}</h5>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm me-2"
                  style={{marginLeft:'200px'}}
                  onClick={toggleLanguage}
                  title={language === 'en' ? 'Switch to Bahasa Malaysia' : 'Switch to English'}
                >
                  <FaLanguage className="me-1" />
                  {language === 'en' ? 'BM' : 'EN'}
                </button>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                ></button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">{t.name}</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value={staffName}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>{t.staffId}</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value={requestId}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>{t.position}</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value= {staffPosition}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>{t.createdAt}</label>
                  <input
                  type= "text"
                  className='form-control'
                  value= {createdAt}
                  readOnly
                  >
                  </input>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>{t.department}</label>
                  <input
                  type= 'text'
                  className='form-control'
                  value= {staffDepartment}
                  readOnly 
                  >
                  </input>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.leaveType}</label>
                  <select
                    className="form-select"
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="" disabled>{t.selectLeaveType}</option>
                    {availableLeaveTypes.map(type => {
                      const originalName = type.label || type.name;
                      const translatedName = translateLeaveType(originalName);
                      
                      // Use the same mapping as in the filtering logic
                      const leaveTypeMapping = {
                        'Annual Leave': 'Annual',
                        'Medical Certificate': 'MC',
                        'Unpaid Leave': 'Unpaid',
                        'Compassionate Leave': 'Compassionate'
                      };
                      
                      const balanceKey = leaveTypeMapping[originalName] || originalName;
                      const balance = leaveBalances[balanceKey];
                      
                      return (
                        <option key={type.value || type.id} value={type.value || type.id}>
                          {translatedName}
                          {balance && ` (${balance.remaining} days remaining)`}
                        </option>
                      );
                    })}
                  </select>
                  {availableLeaveTypes.length === 0 && (
                    <div className="form-text text-warning">
                      {t.errors.noLeaveTypes}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.reason}</label>
                  <textarea
                    className="form-control"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    rows={3}
                  />
                <div className="mb-3">
                  <label className="form-label">{t.startDate}</label>
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
                  <label className="form-label">{t.endDate}</label>
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
                  <label className='form-label'>{t.totalDays}</label>
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
                    {t.tooltip}
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
                    <label className='form-check-label' htmlFor='half-day-checkbox'>{t.isHalfDay}</label>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>{t.jobTakenOverBy}</label>
                  <input
                  className='form-control'
                  value={jobTakenOverBy}
                  onChange= {e => setJobTakenOverBy(e.target.value)}
                  required
                  /> 
                </div>
                <div className="mb-3">
                  <label className="form-label">{t.attachment}</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  <div className="form-text text-danger">{t.fileSizeNote}</div>
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
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || availableLeaveTypes.length === 0}
              >
                {submitting ? t.submitting : availableLeaveTypes.length === 0 ? t.noLeaveAvailable : t.submit}
              </button>
            </div>
          </div>
        </div>
       </div>
     </>
   );
};

export default ApplyLeaveModal; 