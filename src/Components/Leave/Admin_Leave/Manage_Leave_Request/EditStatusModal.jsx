import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Form } from 'reactstrap';
import { updateLeaveStatus } from '../../../Attendance/utils'; // adjust path if needed

const EditStatusModal = ({ isOpen, toggle, leave, onSave, Swal, adminId }) => {
  const [status, setStatus] = useState(leave?.status || 'Pending');
  const [remarks, setRemarks] = useState('');

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
      console.log('=== FRONTEND APPROVAL CALLED ===');
      console.log('Request ID:', leave.request_id);
      console.log('Status:', status);
      console.log('Admin ID:', adminId);
      
      const updatedData = {
        status,
        approved_by: adminId,
        ...(status === 'Rejected' && { remarks: remarks.trim() }),
      };

      console.log('Sending data:', updatedData);

      // Call the update function
      const result = await updateLeaveStatus(leave.request_id, updatedData);
      console.log('Backend response:', result);

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Leave request has been marked as "${status}".`,
      });

      onSave(); // Refresh table
      toggle(); // Close modal
    } catch (error) {
      console.error('=== FRONTEND ERROR ===');
      console.error('Error updating status:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
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
              onChange={(e) => {
                setStatus(e.target.value);
                // Clear remarks when status changes from Rejected to something else
                if (e.target.value !== 'Rejected') {
                  setRemarks('');
                }
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Input>
          </FormGroup>

          {status === 'Rejected' && (
            <FormGroup>
              <Label for="remarks">Remarks</Label>
              <Input
                type="textarea"
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="3"
              />
            </FormGroup>
          )}
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
