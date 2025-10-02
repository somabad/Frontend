import React, { useState, useEffect, Fragment } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardHeader, Col, CardBody, Button, FormGroup, Label, Input, Form, Row, Container } from 'reactstrap';
import Swal from 'sweetalert2';
import DeleteConfirmationModal from '../../common/deleteUserModal';
import ViewLeaveModal from '../Leave_Request_Form/ViewLeaveModal';
import EditLeaveModal from '../Leave_Request_Form/EditLeaveModal';
import { getLeaveHistory, updateLeaveApplication, deleteLeaveApplication } from '../../../Attendance/utils';


const LeaveHistory = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    status: ''
  });
  const staffId = sessionStorage.getItem("staffId");
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const [editModal, setEditModal] = useState({ open: false, leave: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, leave: null });

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const data = await getLeaveHistory(staffId);
      console.log('Leave history data:', data);
      setLeaveApplications(data.leaveHistory || []);
      setFilteredData(data.leaveHistory || []);
    } catch (err) {
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (staffId) fetchLeaveHistory();
  }, [staffId]);

  // DataTable columns
  const columns = [
    {
      name: 'Request ID',
      selector: row => row.request_id,
      sortable: true,
      width: '110px'
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Start Date',
      selector: row => row.start_date,
      sortable: true,
      cell: row => new Date(row.start_date).toLocaleDateString(),
      width: '110px'
    },
    {
      name: 'End Date',
      selector: row => row.end_date,
      sortable: true,
      cell: row => new Date(row.end_date).toLocaleDateString(),
      width: '110px'
    },
    {
      name: 'Is Half Day',
      selector: row => row.is_half_day || '-',
      sortable: true,
      width: '100px'
    },
    {
      name: 'Total Days',
      selector: row => row.total_days,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Job Taken Over By',
      selector: row => row.job_taken_over_by,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      cell: row => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'Approved': return 'text-success';
            case 'Rejected': return 'text-danger';
            case 'Pending': return 'text-warning';
            default: return '';
          }
        };
        return (
          <span className={`${getStatusColor(row.status)} fw-bold`}>
            {row.status}
          </span>
        );
      },
      sortable: true,
      width: '100px'
    },
    {
      name: 'Reason',
      selector: row => row.reason || '-',
      sortable: true,
      width: '150px'
    },
    {
      name: 'Submitted At',
      selector: row => row.created_at,
      sortable: true,
      cell: row => new Date(row.created_at).toLocaleDateString(),
      width: '120px'
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-xs"
            title="View"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            onClick={() => setViewModal({ open: true, leave: row })}
          >
            <i className="fa fa-eye" style={{ fontSize: '16px', color: '#555' }} />
          </button>
          <button
            className="btn btn-xs"
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
                setEditModal({ open: true, leave: row });
              }
            }}
          >
            <i className="fa fa-pencil" style={{ fontSize: '16px', color: row.status === 'Approved' ? '#999' : '#555' }} />
          </button>
          <button
            className="btn btn-xs"
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
            }}
          >
            <i className="fa fa-trash-o" style={{ fontSize: '16px', color: row.status === 'Approved' ? '#999' : '#555' }} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '120px'
    }
  ];

  // Apply filters
  const applyFilters = () => {
    let filtered = [...leaveApplications];

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
    setFilteredData(leaveApplications);
    setShowFilter(false);
  };

  // Get unique leave types for filter dropdown
  const getUniqueLeaveTypes = () => {
    const types = [...new Set(leaveApplications.map(item => item.leave_type).filter(Boolean))];
    return types;
  };

  // Get unique statuses for filter dropdown
  const getUniqueStatuses = () => {
    const statuses = [...new Set(leaveApplications.map(item => item.status).filter(Boolean))];
    return statuses;
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteModal.leave) return;
    
    // Use request_id or id depending on what field exists
    const leaveId = deleteModal.leave.request_id || deleteModal.leave.id;
    
    if (!leaveId) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Cannot find leave ID.' 
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
      setDeleteModal({ open: false, leave: null });
      fetchLeaveHistory();
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Delete failed', 
        text: err.response?.data?.error || 'Something went wrong.' 
      });
    }
  };

  return (
    <Fragment>
      <Container fluid={true} style={{ paddingTop: "30px" }}>
        <Row>
          <Col xl="12">
            <Card className="shadow-sm border-0 rounded-3">
              <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
                <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>
                  Leave History
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
                  progressPending={loading}
                  noDataComponent={
                    <div style={{ fontSize: '1.3rem', padding: '2rem', textAlign: 'center' }}>
                      {leaveApplications.length === 0 
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
      {viewModal.open && (
        <ViewLeaveModal 
          isOpen={viewModal.open} 
          toggle={() => setViewModal({ open: false, leave: null })} 
          leave={viewModal.leave} 
        />
      )}
      {editModal.open && (
        <EditLeaveModal
          isOpen={editModal.open}
          toggle={() => setEditModal({ open: false, leave: null })}
          leave={editModal.leave}
          onSave={fetchLeaveHistory}
          updateLeaveApplication={updateLeaveApplication}
          Swal={Swal}
        />
      )}
      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          toggle={() => setDeleteModal({ open: false, leave: null })}
          onConfirm={handleDelete}
          userName={`${deleteModal.leave?.leave_type} (${deleteModal.leave?.start_date} to ${deleteModal.leave?.end_date})`}
        />
      )}
    </Fragment>
  );
};

export default LeaveHistory; 