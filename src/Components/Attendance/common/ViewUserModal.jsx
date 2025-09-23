import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Row,
  Col,
  Spinner,
} from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Close } from '../../../Constant/indexmy';
import { getStaffLocations } from '../utils';

const ViewUserModal = ({ isOpen, toggle, user }) => {
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!isOpen || !user?.staffId) return;

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffLocations();
      const matchedStaff = data.find(item => item.staffId === user.staffId);
      const locations = matchedStaff?.locations || [];
      setAssignedLocations(locations);
    } catch (error) {
      console.error('Error fetching location data:', error);
      setAssignedLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchLocations();
}, [isOpen, user?.staffId]);


  const formattedLocations = assignedLocations
    .map(loc => loc.location_name)
    .join(' | ');

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>User Details</ModalHeader>
      <ModalBody>
        <Row className="mb-2">
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Name:</Label>
            <div>{user?.name || '-'}</div>
          </Col>
        </Row>
        <Row>
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Email:</Label>
            <div>{user?.email || '-'}</div>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Role:</Label>
            <div>{user?.roleId?.name || '-'}</div>
          </Col>
        </Row>
        <Row>
          <Col md="12" className="d-flex">
            <Label className="fw-bold me-2">Assigned Locations:</Label>
            {isLoading ? (
              <div className="d-flex align-items-center gap-2">
                <Spinner size="sm" color="primary" /> <span>Loading...</span>
              </div>
            ) : formattedLocations ? (
              <div>{formattedLocations}</div>
            ) : (
              <div className="text-muted">
                This user has not been assigned to any location yet.
              </div>
            )}
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: 'secondary', onClick: toggle }}>{Close}</Btn>
      </ModalFooter>
    </Modal>
  );
};

export default ViewUserModal;
