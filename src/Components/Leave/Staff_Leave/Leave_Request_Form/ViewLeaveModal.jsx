import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';

const statusMap = {
  P: { label: 'Pending', color: '#ffc107' },
  A: { label: 'Approved', color: '#28a745' },
  R: { label: 'Rejected', color: '#dc3545' },
};

const BACKEND_URL = 'http://127.0.0.1:8000';
const isImage = (filename) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename || '');
const getDocumentUrl = (doc) => {
  if (!doc) return null;
  if (doc.startsWith('http')) return doc;
  return `${BACKEND_URL}${doc}`;
};

const ViewLeaveModal = ({ isOpen, toggle, leave }) => (
  <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
    <ModalHeader toggle={toggle}>Leave Details</ModalHeader>
    <ModalBody>
      {leave && (
        <div>
          <h5 className="mb-3 text-primary">Staff Information</h5>
          <Row className="mb-2">
            <Col md="6"><b>Request ID:</b> {leave.request_id || '-'}</Col>
            <Col md="6"><b>Staff ID:</b> {leave.staffId || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="6"><b>Name:</b> {leave.staff_name || '-'}</Col>
            <Col md="6"><b>Position:</b> {leave.staff_position || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="6"><b>Department:</b> {leave.staff_department || '-'}</Col>
            <Col md="6"><b>Leave Type:</b> {leave.leave_type || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="6"><b>Leave Type ID:</b> {leave.leave_type_id || '-'}</Col>
            <Col md="6"><b>Status:</b> {leave.status || '-'}</Col>
          </Row>
          <hr />
          <h5 className="mb-3 text-primary">Leave Details</h5>
          <Row className="mb-2">
            <Col md="6"><b>Start Date:</b> {leave.start_date || '-'}</Col>
            <Col md="6"><b>End Date:</b> {leave.end_date || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="6"><b>Total Days:</b> {leave.total_days || '-'}</Col>
            <Col md="6"><b>Is Half Day:</b> {leave.is_half_day ? 'Yes' : 'No'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="12"><b>Reason:</b> {leave.reason || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="12"><b>Job Taken Over By:</b> {leave.job_taken_over_by || '-'}</Col>
          </Row>
          <hr />
          <h5 className="mb-3 text-primary">Attachments</h5>
          <Row className="mb-2">
            <Col md="6"><b>Attachment:</b> {leave.attachment ? <a href={getDocumentUrl(leave.attachment)} target="_blank" rel="noopener noreferrer">View</a> : '—'}</Col>
            <Col md="6"><b>Scanned Form:</b> {leave.scanned_form ? <a href={getDocumentUrl(leave.scanned_form)} target="_blank" rel="noopener noreferrer">View</a> : '—'}</Col>
          </Row>
          <hr />
          <h5 className="mb-3 text-primary">Approval Info</h5>
          <Row className="mb-2">
            <Col md="6"><b>Created At:</b> {leave.created_at || '-'}</Col>
            <Col md="6"><b>Approved By:</b> {leave.approved_by_name || leave.approved_by || '-'}</Col>
          </Row>
        </div>
      )}
    </ModalBody>
    <ModalFooter>
      <button className="btn btn-secondary" onClick={toggle}>Close</button>
    </ModalFooter>
  </Modal>
);

export default ViewLeaveModal; 