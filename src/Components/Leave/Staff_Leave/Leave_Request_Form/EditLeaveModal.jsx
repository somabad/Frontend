import React, { useState, useEffect } from 'react';
import { updateLeaveApplication } from '../../../Attendance/utils';
import Swal from 'sweetalert2';
import { FaLanguage } from 'react-icons/fa';

// Translation object for multilingual support
const translations = {
  en: {
    title: 'Edit Leave',
    name: 'Name',
    staffId: 'Staff No',
    position: 'Position',
    department: 'Department',
    leaveType: 'Leave Type',
    selectLeaveType: 'Select leave type',
    reason: 'Reason',
    totalDays: 'Total Days',
    startDate: 'Start Date',
    endDate: 'End Date',
    isHalfDay: 'Is Half Day',
    jobTakenOverBy: 'Job Taken Over By',
    attachment: 'Attachment (optional)',
    fileSizeNote: 'Note: Please upload files no larger than 2 MB.',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    successTitle: 'Leave updated!',
    errorTitle: 'Update failed',
    errorText: 'Something went wrong.',
    errors: {
      fileSize: 'File size should not exceed 2 MB.'
    },
    leaveTypes: {
      annual: 'Annual Leave',
      medical: 'Medical Certificate',
      unpaid: 'Unpaid Leave',
      compassionate: 'Compassionate Leave'
    }
  },
  ms: {
    title: 'Edit Cuti',
    name: 'Nama',
    staffId: 'No. Pekerja',
    position: 'Jawatan',
    department: 'Bahagian',
    leaveType: 'Jenis Cuti',
    selectLeaveType: 'Pilih jenis cuti',
    reason: 'Sebab',
    totalDays: 'Jumlah Hari',
    startDate: 'Tarikh Mula',
    endDate: 'Tarikh Tamat',
    isHalfDay: 'Separuh Hari',
    jobTakenOverBy: 'Tugas Diambil Alih Oleh',
    attachment: 'Lampiran (pilihan)',
    fileSizeNote: 'Nota: Sila muat naik fail tidak melebihi 2 MB.',
    cancel: 'Batal',
    save: 'Simpan',
    saving: 'Menyimpan...',
    successTitle: 'Cuti dikemas kini!',
    errorTitle: 'Kemaskini gagal',
    errorText: 'Sesuatu yang tidak kena.',
    errors: {
      fileSize: 'Saiz fail tidak boleh melebihi 2 MB.'
    },
    leaveTypes: {
      annual: 'Cuti Tahunan',
      medical: 'Sijil Sakit',
      unpaid: 'Cuti Tanpa Gaji',
      compassionate: 'Cuti Ehsan'
    }
  }
};

const EditLeaveModal = ({ isOpen, toggle, leave, onSave }) => {
  // Map leave_type to leave_type_id for editing
  const [form, setForm] = useState({ ...leave, leave_type_id: leave?.leave_type_id || leave?.leave_type });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en'); // Default to English

  // Get current translation
  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ms' : 'en');
  };

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
        setError(t.errors.fileSize);
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

      Swal.fire({ icon: 'success', title: t.successTitle });
      onSave();
      toggle();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t.errorTitle,
        text: err.response?.data?.error || t.errorText,
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
            <div className="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="modal-title mb-0">{t.title}</h5>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={toggleLanguage}
                  title={language === 'en' ? 'Switch to Bahasa Malaysia' : 'Switch to English'}
                >
                  <FaLanguage className="me-1" />
                  {language === 'en' ? 'BM' : 'EN'}
                </button>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={toggle}
                ></button>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Read-only staff details */}
                <div className="mb-3">
                  <label className="form-label">{t.name}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_name || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.staffId}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.request_id || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.position}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_position || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.department}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={leave.staff_department || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.leaveType}</label>
                  <select
                    className="form-select"
                    name="leave_type_id"
                    value={form.leave_type_id || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t.selectLeaveType}</option>
                    <option value="2">{t.leaveTypes.annual}</option>
                    <option value="3">{t.leaveTypes.medical}</option>
                    <option value="4">{t.leaveTypes.unpaid}</option>
                    <option value="5">{t.leaveTypes.compassionate}</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.reason}</label>
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
                  <label className="form-label">{t.totalDays}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.total_days || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.startDate}</label>
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
                  <label className="form-label">{t.endDate}</label>
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
                    {t.isHalfDay}
                  </label>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.jobTakenOverBy}</label>
                  <input
                    className="form-control"
                    name="job_taken_over_by"
                    value={form.job_taken_over_by || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.attachment}</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  <div className="form-text text-danger">
                    {t.fileSizeNote}
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
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditLeaveModal;
