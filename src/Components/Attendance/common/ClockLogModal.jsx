import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, Row, Col, Spinner } from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Close } from '../../../Constant/indexmy';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { getClockLogs, getStaffLocations } from '../utils'; // Adjust path if needed


const ClockLogModal = ({ isOpen, toggle, user }) => {
    const [assignedLocations, setAssignedLocations] = useState([]);
    const [clockLogs, setClockLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    if (!isOpen || !user?.staffId) return;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [locationData, logData] = await Promise.all([
                getStaffLocations(),
                getClockLogs(user.staffId),
            ]);

            const matched = locationData.find(item => item.staffId === user.staffId);
            setAssignedLocations(matched?.locations || []);
            setClockLogs(logData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setAssignedLocations([]);
            setClockLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
}, [isOpen, user?.staffId]);


    // Columns definition (similar to ClockLogPage)
    const columns = [
        {
            name: 'Date',
            selector: row => new Date(row.clock_in).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Clock In',
            selector: row =>
                new Date(row.clock_in).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }),
        },
        {
            name: 'Clock Out',
            selector: row =>
                row.clock_out
                    ? new Date(row.clock_out).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    })
                    : '—',
        },
        {
            name: 'Location',
            cell: row => (
                <div>
                    {row.location?.name}
                    <br />
                    <small>{row.location?.address}</small>
                </div>
            ),
        },
    ];

    const formattedLocations = assignedLocations.map(loc => loc.location_name).join(', ');

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
            <ModalHeader toggle={toggle}>Clock Log Details</ModalHeader>
            <ModalBody>
                {/* User Info */}
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

                {/* Assigned Locations */}
                <Row className="mb-3">
                    <Col md="12" className="d-flex">
                        <Label className="fw-bold me-2">Assigned Locations:</Label>
                        {isLoading ? (
                            <div className="d-flex align-items-center gap-2">
                                <Spinner size="sm" color="primary" /> <span>Loading...</span>
                            </div>
                        ) : formattedLocations ? (
                            <div>{formattedLocations}</div>
                        ) : (
                            <div className="text-muted">No assigned locations.</div>
                        )}
                    </Col>
                </Row>

                {/* Clock Log DataTable */}
                {isLoading ? (
                    <div className="d-flex align-items-center gap-2">
                        <Spinner size="sm" color="primary" /> <span>Loading logs...</span>
                    </div>
                ) : clockLogs.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={clockLogs}
                        pagination
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 8]}
                        striped
                        highlightOnHover
                        responsive
                        defaultSortFieldId={1}
                    />
                ) : (
                    <div className="text-muted">No clock logs found for this user.</div>
                )}
            </ModalBody>
            <ModalFooter>
                <Btn attrBtn={{ color: 'secondary', onClick: toggle }}>{Close}</Btn>
            </ModalFooter>
        </Modal>
    );
};

export default ClockLogModal;
