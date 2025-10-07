import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Form } from 'reactstrap';
import { updateLeaveStatus } from '../../../Attendance/utils'; // adjust path if needed

const EditStatusModal = ({ isOpen, toggle, leave, onSave, Swal, adminId }) => {
  const [status, setStatus] = useState(leave?.status || 'Pending');
  const [remarks, setRemarks] = useState(leave?.remarks || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leave?.request_id) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Leave Record',
        text: 'Missing leave request ID.',
      });
      return;
    }

    try {
      const updatedData = {
        status,
        remarks,
        approved_by: adminId,
      };

      // Call the update function
      await updateLeaveStatus(leave.request_id, updatedData);

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Leave request has been marked as "${status}".`,
      });

      onSave(); // Refresh table
      toggle(); // Close modal
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.error || 'Something went wrong while updating status.',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Leave Status</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="status">Leave Status</Label>
            <Input
              type="select"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="remarks">Remarks (optional)</Label>
            <Input
              type="textarea"
              id="remarks"
              rows="3"
              placeholder="Add admin remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Update Status
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditStatusModal;
