import React, { useState, useEffect, Fragment } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, FormGroup, Label, Input, Form } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { deleteLeaveApplication, getAdminLeaveHistory, updateLeaveApplication } from '../../../Attendance/utils';
import Loader from '../../../Attendance/Loader';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ViewLeaveModal from '../../Staff_Leave/Leave_Request_Form/ViewLeaveModal';
import EditLeaveModal from '../../Staff_Leave/Leave_Request_Form/EditLeaveModal';
import DeleteConfirmationModal from '../../common/deleteUserModal';

const ManageLeaveRequest = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [viewModal, setViewModal] = useState([]);
  const [deleteModal, setDeleteModal] = useState([]);
  const [editModal, setEditModal] = useState([]);
  const [filters, setFilters] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const navigate = useNavigate();
  const staffId = sessionStorage.getItem("staffId");

  // Define columns for the table
  const columns = [
    {
      name: 'Name',
      selector: row => row.staff_name,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Department',
      selector: row => row.staff_department,
      sortable: true,
      cell: row => row.staff_department || '-',
      width: '120px'
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Applied Date',
      selector: row => row.created_at,
      sortable: true,
      cell: row => new Date(row.created_at).toLocaleDateString(),
      width: '120px'
    },
    {
      name: 'From',
      selector: row => row.start_date,
      sortable: true,
      cell: row => new Date(row.start_date).toLocaleDateString(),
      width: '120px'
    },
    {
      name: 'To',
      selector: row => row.end_date,
      sortable: true,
      cell: row => new Date(row.end_date).toLocaleDateString(),
      width: '120px'
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      cell: row => {
        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case 'approved':
              return 'text-success';
            case 'rejected':
              return 'text-danger';
            case 'pending':
              return 'text-warning';
            default:
              return 'text-muted';
          }
        };
        return (
          <span className={`${getStatusColor(row.status)} fw-bold`}>
            {row.status || '-'}
          </span>
        );
      },
      sortable: true,
      width: '100px'
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: '8px'
        }}>
            <button
            className='btn btn-xs'
            title='view'
            style={{ background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px'
            }}
            onClick={() => setViewModal({ open: true, leave: row})}
        >
            <i className='fa fa-eye' style={{ fontSize: '16px', color: '#555' }} />
            </button>
            <button
            className='btn btn-xs'
            title={row.status === 'Approved' ? 'Cannot edit approved leave' : 'Edit'}
            style={{
                background: 'none',
                border: 'none',
                cursor: row.status === 'Approved' ? 'not-allowed' : 'pointer',
                padding: '4px',
                opacity: row.status === 'Approved' ? 0.5 : 1
            }}
            onClick={() => {
                if (row.status !== 'Approved') {
                    setEditModal({ open: true, leave: row});
                }
            }}
            >
                <i className='fa fa-pencil' style={{ fontSize: '16px', color: row.status === 'Approved' ? '#999' : '#555'}} />
            </button>
            <button
            className='btn btn-xs'
            title={row.status === 'Approved' ? 'Cannot delete approved leave' : 'Delete'}
            style={{
                background: 'none',
                border: 'none',
                cursor: row.status === 'Approved' ? 'not-allowed' : 'pointer',
                padding: '4px',
                opacity: row.status === 'Approved' ? 0.5 : 1
            }}
            onClick={() => {
                if (row.status !== 'Approved') {
                    setDeleteModal({ open: true, leave: row });
                }
            }}>
                <i className='fa fa-trash-o' style={{ fontSize: '16px', color: row.status === 'Approved' ? '#999' : '#555' }} />
            </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '120px'
    },
    {
        name: 'Upload',
        selector: row => row.upload,
        sortable: true,
        cell: row => row.upload || 'Scan',
        width: '120px'
    }
  ];

  // Fetch leave history data
  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const data = await getAdminLeaveHistory(staffId);
      setLeaveHistory(data.leaveHistory || []);
      setFilteredData(data.leaveHistory || []);
    } catch (err) {
      setError('Failed to load leave history');
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...leaveHistory];

    if (filters.startDate) {
      filtered = filtered.filter(item => 
        new Date(item.start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(item => 
        new Date(item.end_date) <= new Date(filters.endDate)
      );
    }

    if (filters.leaveType) {
      filtered = filtered.filter(item => 
        item.leave_type?.toLowerCase().includes(filters.leaveType.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredData(filtered);
    setShowFilter(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      leaveType: '',
      status: ''
    });
    setFilteredData(leaveHistory);
    setShowFilter(false);
  };

  // Get unique leave types for filter dropdown
  const getUniqueLeaveTypes = () => {
    const types = [...new Set(leaveHistory.map(item => item.leave_type).filter(Boolean))];
    return types;
  };

  // Get unique statuses for filter dropdown
  const getUniqueStatuses = () => {
    const statuses = [...new Set(leaveHistory.map(item => item.status).filter(Boolean))];
    return statuses;
  };

  const handleDelete= async () => {
    if (!deleteModal.leave) return;

    const leaveId = deleteModal.leave.request_id || deleteModal.leave.id;

    if (!leaveId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Cannot find leave ID'
        });
        return;
    }

    try {
        await deleteLeaveApplication(leaveId);
        Swal.fire({
            icon: 'success',
            title: 'Leave deleted successfully!',
            text: 'The leave application has been removed.'
        });
        setDeleteModal({ open: false, leave: null});
        fetchLeaveHistory();
    } catch (err) {
        console.error('Delete error:', err);
        Swal.fire({
            icon: 'error',
            title: 'Delete failed',
            text: err.response?.data?.error || 'Something went wrong.'
        });
    }
  }

  useEffect(() => {
    // Check sessionStorage for staffId and userType
    const userType = sessionStorage.getItem('userType');

    if (!staffId || userType === 'Staff') {
      navigate('/login');
    } else {
      fetchLeaveHistory();
    }
  }, [staffId, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Fragment>
    <Container fluid={true} style={{ paddingTop: "30px" }}>
      <Row>
        <Col xl="12">
          <Card className="shadow-sm border-0 rounded-3">
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
              <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>
                Manage Leave Request
              </h3>
              <Button
                color="primary"
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                className="d-flex align-items-center gap-2"
              >
                <i className="fa fa-filter"></i>
                Filter
              </Button>
            </CardHeader>

            {/* Filter Section */}
            {showFilter && (
              <CardBody className="border-bottom">
                <Form>
                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <Label for="startDate">From Date</Label>
                        <Input
                          type="date"
                          id="startDate"
                          value={filters.startDate}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="endDate">To Date</Label>
                        <Input
                          type="date"
                          id="endDate"
                          value={filters.endDate}
                          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="leaveType">Leave Type</Label>
                        <Input
                          type="select"
                          id="leaveType"
                          value={filters.leaveType}
                          onChange={(e) => setFilters({...filters, leaveType: e.target.value})}
                        >
                          <option value="">All Leave Types</option>
                          {getUniqueLeaveTypes().map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="status">Status</Label>
                        <Input
                          type="select"
                          id="status"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">All Status</option>
                          {getUniqueStatuses().map((status, index) => (
                            <option key={index} value={status}>{status}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="d-flex gap-2">
                      <Button color="primary" size="sm" onClick={applyFilters}>
                        Apply Filter
                      </Button>
                      <Button color="secondary" size="sm" onClick={clearFilters}>
                        Clear Filter
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            )}

            <CardBody className="p-0">
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                striped
                highlightOnHover
                responsive
                noDataComponent={
                  <div style={{ fontSize: '1.3rem', padding: '2rem', textAlign: 'center' }}>
                    {leaveHistory.length === 0 
                      ? 'No leave history found.' 
                      : 'No records match the current filter criteria.'
                    }
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      color: '#555555',
                      fontSize: '14px',
                      padding: '12px 8px',
                      borderBottom: '2px solid #dee2e6'
                    }
                  },
                  cells: {
                    style: {
                      padding: '12px 8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f1f3f4'
                    }
                  },
                  rows: {
                    style: {
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }
                  }
                }}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
    {ViewLeaveModal.open && (
        <ViewLeaveModal
            isOpen={ViewLeaveModal.open}
            toggle={() => setViewModal({ open: false, leave: null })}
            leave={ViewLeaveModal.leave}
        />
    )}
    {EditLeaveModal.open && (
        <EditLeaveModal
        isOpen={EditLeaveModal.open}
        toggle={() => setEditModal({ open: false, leave: null})}
        leave={EditLeaveModal.leave}
        onSave={fetchLeaveHistory}
        updateLeaveApplication={updateLeaveApplication}
        Swal={Swal}
        />
    )}
    {deleteModal.open && (
        <DeleteConfirmationModal
        isOpen={deleteModal.open}
        toggle={() => setDeleteModal({ open: false, leave: null})}
        onConfirm={handleDelete}
        userName={`${deleteModal.leave?.leave_type} (${deleteModal.leave?.start_date} to ${deleteModal.leave?.end_date})`}
        />
    )}
    </Fragment>
  );
};

export default ManageLeaveRequest;