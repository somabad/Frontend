import React, { useState, useEffect } from 'react';

const EditLeaveModal = ({ isOpen, toggle, leave, onSave, updateLeaveApplication, Swal }) => {
  const [form, setForm] = useState({ ...leave });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setForm({ ...leave }); }, [leave]);
  if (!leave) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCheckbox = e => setForm(f => ({ ...f, [e.target.name]: e.target.checked }));
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2 MB in bytes
        setError('File size should not exceed 2 MB.');
        setForm(f => ({ ...f, document: null }));
        return;
      } else {
        setError('');
        setForm(f => ({ ...f, document: file }));
      }
    } else {
      setForm(f => ({ ...f, document: null }));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('leave_type', form.leave_type);
      formData.append('start_date', form.start_date);
      formData.append('end_date', form.end_date);
      formData.append('total_days', form.total_days);
      formData.append('is_half_day', form.is_half_day);
      formData.append('job_taken_over_by', form.job_taken_over_by);
      formData.append('reason', form.reason);
      if (form.document && typeof form.document !== 'string') {
        formData.append('document', form.document);
      }
      await updateLeaveApplication(leave.id, formData);
      Swal.fire({ icon: 'success', title: 'Leave updated!' });
      onSave();
      toggle();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.response?.data?.error || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };
  // Mirror ApplyLeaveModal UI structure
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
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Leave</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={toggle}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Read-only staff details to match Apply UI */}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={leave.staff_name || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Staff Id</label>
                  <input type="text" className="form-control" value={leave.staffId || leave.staff_id || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Position</label>
                  <input type="text" className="form-control" value={leave.staff_position || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Created At</label>
                  <input type="text" className="form-control" value={leave.created_at || leave.request_date || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" value={leave.staff_department || ''} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label">Leave Type</label>
                  <select className="form-select" name="leave_type" value={form.leave_type || ''} onChange={handleChange} required>
                    {/* Keep existing simple options to avoid backend mismatch */}
                    <option value="">Select leave type</option>
                    <option value="Annual">Annual</option>
                    <option value="MC">MC</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Reason</label>
                  <textarea className="form-control" name="reason" value={form.reason || ''} onChange={handleChange} required rows={3} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Days</label>
                  <input type="text" className="form-control" value={form.total_days || ''} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input type="date" name="start_date" className="form-control" value={form.start_date || ''} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input type="date" name="end_date" className="form-control" value={form.end_date || ''} onChange={handleChange} required />
                </div>

                <div className='mb-3'>
                  <div className='form-check'>
                    <input id='edit-half-day-checkbox' type='checkbox' className='form-check-input' name='is_half_day' checked={!!form.is_half_day} onChange={handleCheckbox} />
                    <label className='form-check-label' htmlFor='edit-half-day-checkbox'>Is Half Day</label>
                  </div>
                </div>

                <div className='mb-3'>
                  <label className='form-label'>Job Taken Over By:</label>
                  <input className='form-control' name='job_taken_over_by' value={form.job_taken_over_by || ''} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Attachment (optional)</label>
                  <input type="file" className="form-control" onChange={handleFileChange} />
                  <div className="form-text text-danger">Note: Please upload files no larger than 2 MB. Larger files will not be accepted.</div>
                  <div className="form-text text-muted">Leave blank to keep the current document. Upload a new file only if you want to replace the existing one.</div>
                </div>

                {error && <div className="text-danger mb-2">{error}</div>}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={toggle}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
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