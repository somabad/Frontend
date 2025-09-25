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
        <>
          <Row className="mb-2">
            <Col md="6"><b>Leave Type:</b> {leave.leave_type}</Col>
            <Col md="6"><b>Status:</b> {statusMap[leave.status]?.label || leave.status}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="6"><b>Start Date:</b> {leave.start_date}</Col>
            <Col md="6"><b>End Date:</b> {leave.end_date}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="12"><b>Reason:</b> {leave.reason}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="12"><b>Applied At:</b> {new Date(leave.applied_at).toLocaleString()}</Col>
          </Row>
          <Row className="mb-2">
            <Col md="12">
              <b>Document:</b>{' '}
              {leave.document ? (
                isImage(leave.document) ? (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={getDocumentUrl(leave.document)}
                      alt="Document Preview"
                      style={{ maxWidth: '100%', maxHeight: 300, border: '1px solid #eee', borderRadius: 8 }}
                    />
                  </div>
                ) : (
                  <a href={getDocumentUrl(leave.document)} target="_blank" rel="noopener noreferrer">View Document</a>
                )
              ) : '—'}
            </Col>
          </Row>
        </>
      )}
    </ModalBody>
    <ModalFooter>
      <button className="btn btn-secondary" onClick={toggle}>Close</button>
    </ModalFooter>
  </Modal>
);

export default ViewLeaveModal; 