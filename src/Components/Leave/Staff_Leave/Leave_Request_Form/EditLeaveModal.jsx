import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';

const EditLeaveModal = ({ isOpen, toggle, leave, onSave, updateLeaveApplication, Swal }) => {
  const [form, setForm] = useState({ ...leave });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setForm({ ...leave }); }, [leave]);
  if (!leave) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md" centered>
      <ModalHeader toggle={toggle}>Edit Leave</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label>Leave Type</Label>
            <Input type="select" name="leave_type" value={form.leave_type} onChange={handleChange} required>
              <option value="Annual">Annual</option>
              <option value="MC">MC</option>
              <option value="Emergency">Emergency</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Start Date</Label>
            <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label>End Date</Label>
            <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label>Reason</Label>
            <Input type="textarea" name="reason" value={form.reason} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label>Document (optional)</Label>
            <Input type="file" name="document" onChange={handleFileChange} />
            <div className="form-text text-danger">Note: Please upload files no larger than 2 MB. Larger files will not be accepted.</div>
            <div className="form-text text-muted">Leave blank to keep the current document. Upload a new file only if you want to replace the existing one.</div>
          </FormGroup>
          {error && <div className="text-danger mb-2">{error}</div>}
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" type="button" onClick={toggle}>Cancel</button>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditLeaveModal; 