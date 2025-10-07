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
  const [filters, setFilters] = useState({ startDate: '', endDate: '', leaveType: '', status: '' });
  const staffId = sessionStorage.getItem("staffId");
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const [editModal, setEditModal] = useState({ open: false, leave: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, leave: null });

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const data = await getLeaveHistory(staffId);
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

  // Columns
  const columns = [
    {
      name: 'Request ID',
      selector: row => row.request_id || '-',
      sortable: true,
      minWidth: '140px'
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type || '-',
      sortable: true,
      minWidth: '140px'
    },
    {
      name: 'Start Date',
      selector: row => row.start_date || '-',
      sortable: true,
      cell: row => row.start_date ? new Date(row.start_date).toLocaleDateString() : '-',
      minWidth: '140px'
    },
    {
      name: 'End Date',
      selector: row => row.end_date || '-',
      sortable: true,
      cell: row => row.end_date ? new Date(row.end_date).toLocaleDateString() : '-',
      minWidth: '140px'
    },
    {
      name: 'Total Days',
      selector: row => row.total_days ?? '-',
      sortable: true,
      minWidth: '120px'
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      sortable: true,
      cell: row => {
        const getStatusColor = (status) => {
          switch(status) {
            case 'Approved': return 'text-success';
            case 'Rejected': return 'text-danger';
            case 'Pending': return 'text-warning';
            default: return '';
          }
        };
        return <span className={`${getStatusColor(row.status)} fw-bold`}>{row.status || '-'}</span>
      },
      minWidth: '140px'
    },
    {
      name: 'Submitted At',
      selector: row => row.created_at || '-',
      sortable: true,
      cell: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-',
      minWidth: '140px'
    },
    {
      name: 'Action',
      selector: row => row.status || '-', // dummy selector for alignment
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', width: '100%' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '16px' }} title="View" onClick={() => setViewModal({ open: true, leave: row })}>
            <i className="fa fa-eye" style={{ color: '#555' }} />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: row.status === 'Approved' ? 'not-allowed' : 'pointer', padding: '4px', fontSize: '16px', opacity: row.status === 'Approved' ? 0.5 : 1 }}
            title={row.status === 'Approved' ? 'Cannot edit approved leave' : 'Edit'}
            onClick={() => row.status !== 'Approved' && setEditModal({ open: true, leave: row })}
          >
            <i className="fa fa-pencil" style={{ color: row.status === 'Approved' ? '#999' : '#555' }} />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: row.status === 'Approved' ? 'not-allowed' : 'pointer', padding: '4px', fontSize: '16px', opacity: row.status === 'Approved' ? 0.5 : 1 }}
            title={row.status === 'Approved' ? 'Cannot delete approved leave' : 'Delete'}
            onClick={() => row.status !== 'Approved' && setDeleteModal({ open: true, leave: row })}
          >
            <i className="fa fa-trash-o" style={{ color: row.status === 'Approved' ? '#999' : '#555' }} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '180px'
    },
    {
      name: 'Approver File',
      selector: row => row.approver_file || '-',
      cell: row => row.status === 'Approved' && row.approver_file 
        ? <a href={row.approver_file} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#007bff' }}>View File</a>
        : '-', 
      minWidth: '160px',
      sortable: false
    }
  ];

  // Filters
  const applyFilters = () => {
    let filtered = [...leaveApplications];
    if (filters.startDate) filtered = filtered.filter(item => new Date(item.start_date) >= new Date(filters.startDate));
    if (filters.endDate) filtered = filtered.filter(item => new Date(item.end_date) <= new Date(filters.endDate));
    if (filters.leaveType) filtered = filtered.filter(item => item.leave_type?.toLowerCase().includes(filters.leaveType.toLowerCase()));
    if (filters.status) filtered = filtered.filter(item => item.status?.toLowerCase() === filters.status.toLowerCase());
    setFilteredData(filtered);
    setShowFilter(false);
  };
  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', leaveType: '', status: '' });
    setFilteredData(leaveApplications);
    setShowFilter(false);
  };
  const getUniqueLeaveTypes = () => [...new Set(leaveApplications.map(item => item.leave_type).filter(Boolean))];
  const getUniqueStatuses = () => [...new Set(leaveApplications.map(item => item.status).filter(Boolean))];
  const handleDelete = async () => {
    if (!deleteModal.leave) return;
    const leaveId = deleteModal.leave.request_id || deleteModal.leave.id;
    if (!leaveId) return Swal.fire({ icon: 'error', title: 'Error', text: 'Cannot find leave ID.' });

    try {
      await deleteLeaveApplication(leaveId);
      Swal.fire({ icon: 'success', title: 'Leave deleted successfully!' });
      setDeleteModal({ open: false, leave: null });
      fetchLeaveHistory();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err.response?.data?.error || 'Something went wrong.' });
    }
  };

  return (
    <Fragment>
      <Container fluid style={{ paddingTop: '30px' }}>
        <Row>
          <Col xl="12">
            <Card className="shadow-sm border-0 rounded-3">
              <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
                <h3 style={{ color: '#555555', marginBottom: '0.5rem' }}>Leave History</h3>
                <Button color="primary" size="sm" onClick={() => setShowFilter(!showFilter)} className="d-flex align-items-center gap-2">
                  <i className="fa fa-filter"></i> Filter
                </Button>
              </CardHeader>
              {showFilter && (
                <CardBody className="border-bottom">
                  <Form>
                    <Row>
                      <Col md="3">
                        <FormGroup>
                          <Label>From Date</Label>
                          <Input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>To Date</Label>
                          <Input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>Leave Type</Label>
                          <Input type="select" value={filters.leaveType} onChange={(e) => setFilters({...filters, leaveType: e.target.value})}>
                            <option value="">All Leave Types</option>
                            {getUniqueLeaveTypes().map((type, idx) => <option key={idx} value={type}>{type}</option>)}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>Status</Label>
                          <Input type="select" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value="">All Status</option>
                            {getUniqueStatuses().map((status, idx) => <option key={idx} value={status}>{status}</option>)}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="d-flex gap-2">
                        <Button color="primary" size="sm" onClick={applyFilters}>Apply Filter</Button>
                        <Button color="secondary" size="sm" onClick={clearFilters}>Clear Filter</Button>
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
                  noDataComponent={<div style={{ fontSize: '1.3rem', padding: '2rem', textAlign: 'center' }}>
                    {leaveApplications.length === 0 ? 'No leave history found.' : 'No records match the current filter criteria.'}
                  </div>}
                  customStyles={{
                    headCells: { style: { backgroundColor: '#f8f9fa', fontWeight: 'bold', color: '#555555', fontSize: '14px', padding: '12px 8px', borderBottom: '2px solid #dee2e6' } },
                    cells: { style: { padding: '12px 8px', fontSize: '13px', borderBottom: '1px solid #f1f3f4' } },
                    rows: { style: { '&:hover': { backgroundColor: '#f8f9fa' } } }
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {viewModal.open && <ViewLeaveModal isOpen={viewModal.open} toggle={() => setViewModal({ open: false, leave: null })} leave={viewModal.leave} />}
      {editModal.open && <EditLeaveModal isOpen={editModal.open} toggle={() => setEditModal({ open: false, leave: null })} leave={editModal.leave} onSave={fetchLeaveHistory} updateLeaveApplication={updateLeaveApplication} Swal={Swal} />}
      {deleteModal.open && <DeleteConfirmationModal isOpen={deleteModal.open} toggle={() => setDeleteModal({ open: false, leave: null })} onConfirm={handleDelete} userName={`${deleteModal.leave?.leave_type} (${deleteModal.leave?.start_date} to ${deleteModal.leave?.end_date})`} />}
    </Fragment>
  );
};

export default LeaveHistory;
