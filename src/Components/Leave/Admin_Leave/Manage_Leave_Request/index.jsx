import React, { useState, useEffect, Fragment } from 'react';
import {
  Container, Row, Col, Card, CardHeader, CardBody, Button,
  FormGroup, Label, Input, Form
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import {
  deleteLeaveApplication,
  getAdminLeaveHistory,
  getScannedForm
} from '../../../Attendance/utils';
import Loader from '../../../Attendance/Loader';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ViewLeaveModal from '../../Staff_Leave/Leave_Request_Form/ViewLeaveModal';
import EditStatusModal from '../Manage_Leave_Request/EditStatusModal';
import DeleteConfirmationModal from '../../common/deleteUserModal';

// Modular Upload/View components
import UploadImageModal from "./UploadImageModal";
import ViewImageModal from "./ViewImageModal";

const ManageLeaveRequest = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [viewModal, setViewModal] = useState([]);
  const [deleteModal, setDeleteModal] = useState([]);
  const [editModal, setEditModal] = useState([]);

  // Modular upload/view states
  const [uploadModal, setUploadModal] = useState({ 
    open: false, 
    leave: null,
    existingScannedForm: null 
  });
  const [imagePreview, setImagePreview] = useState({ open: false, imageUrl: null, loading: false });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    status: ''
  });

  const navigate = useNavigate();
  const staffId = sessionStorage.getItem("staffId");
  const adminId = staffId;

  // Fetch leave history
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

  // Update specific leave record when image is deleted
  const updateLeaveRecord = (requestId, hasScannedForm) => {
    setLeaveHistory(prev => 
      prev.map(leave => 
        leave.request_id === requestId 
          ? { ...leave, scanned_form: hasScannedForm }
          : leave
      )
    );
    
    setFilteredData(prev => 
      prev.map(leave => 
        leave.request_id === requestId 
          ? { ...leave, scanned_form: hasScannedForm }
          : leave
      )
    );
  };

  // View scanned form (robust: uses getScannedForm util)
  const handleViewScannedForm = async (leave) => {
    const requestId = leave?.request_id || leave;
    if (!requestId) return;

    setImagePreview({ open: true, imageUrl: null, loading: true });

    try {
      // getScannedForm should return something like: { success: true, file_url: '/media/...' }
      const result = await getScannedForm(requestId);

      if (!result) throw new Error('Empty response from server');

      // possible fields: file_url or url — be flexible
      let fileUrl = result.file_url || result.fileUrl || result.url || null;

      // If backend returned a blob or direct data, handle fallback (rare)
      if (!fileUrl && result instanceof Blob) {
        const blobUrl = URL.createObjectURL(result);
        setImagePreview({ open: true, imageUrl: blobUrl, loading: false });
        return;
      }

      if (!fileUrl) {
        throw new Error(result.message || 'No scanned file url returned');
      }

      // If fileUrl is already absolute leave it; otherwise prefix with base URL
      const isAbsolute = /^https?:\/\//i.test(fileUrl);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

      if (!isAbsolute) {
        // ensure leading slash
        if (!fileUrl.startsWith('/')) fileUrl = `/${fileUrl}`;
        fileUrl = `${baseUrl}${fileUrl}`;
      }

      setImagePreview({ open: true, imageUrl: fileUrl, loading: false });
    } catch (err) {
      console.error('Error loading scanned form:', err);
      setImagePreview({ open: false, imageUrl: null, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to load scanned form'
      });
    }
  };

  // Handle upload/reupload button click
  const handleUploadClick = async (leave) => {
    const requestId = leave?.request_id;
    
    if (!requestId) {
      Swal.fire('Error', 'No leave request selected', 'error');
      return;
    }

    // Check if there's an existing scanned form
    let existingScannedForm = null;
    
    if (leave.scanned_form) {
      try {
        setImagePreview({ open: false, imageUrl: null, loading: true });
        
        const result = await getScannedForm(requestId);
        let fileUrl = result.file_url || result.fileUrl || result.url || null;

        if (fileUrl) {
          // If fileUrl is already absolute leave it; otherwise prefix with base URL
          const isAbsolute = /^https?:\/\//i.test(fileUrl);
          const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

          if (!isAbsolute) {
            if (!fileUrl.startsWith('/')) fileUrl = `/${fileUrl}`;
            fileUrl = `${baseUrl}${fileUrl}`;
          }

          existingScannedForm = {
            id: requestId,
            preview: fileUrl,
            name: 'existing_scanned_form.jpg',
            uploadDate: leave.created_at || 'Previously uploaded'
          };
        }
      } catch (err) {
        console.error('Error fetching existing scanned form:', err);
        // Continue without existing form if there's an error
      } finally {
        setImagePreview({ open: false, imageUrl: null, loading: false });
      }
    }

    setUploadModal({ 
      open: true, 
      leave: leave,
      existingScannedForm: existingScannedForm 
    });
  };

  // Handle when image is deleted in upload modal
  const handleImageDeleted = (requestId) => {
    // Update the leave record to remove scanned_form
    updateLeaveRecord(requestId, false);
  };

  // Ensure blob URLs are revoked when closing preview
  const closeImagePreview = () => {
    if (imagePreview.imageUrl && imagePreview.imageUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(imagePreview.imageUrl); } catch (e) { /* ignore */ }
    }
    setImagePreview({ open: false, imageUrl: null, loading: false });
  };

  // Filtering functions
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

  const getUniqueLeaveTypes = () => {
    const types = [...new Set(leaveHistory.map(item => item.leave_type).filter(Boolean))];
    return types;
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(leaveHistory.map(item => item.status).filter(Boolean))];
    return statuses;
  };

  // Delete leave
  const handleDelete = async () => {
    if (!deleteModal.leave) return;
    const leaveId = deleteModal.leave.request_id || deleteModal.leave.id;

    if (!leaveId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Cannot find leave ID' });
      return;
    }

    try {
      await deleteLeaveApplication(leaveId);
      Swal.fire({ icon: 'success', title: 'Leave deleted successfully!' });
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

  // Data table columns (updated Upload column)
  const columns = [
    { name: 'Name', selector: row => row.staff_name, sortable: true, width: '150px' },
    { name: 'Department', selector: row => row.staff_department, sortable: true, width: '120px' },
    { name: 'Leave Type', selector: row => row.leave_type, sortable: true, width: '120px' },
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
            case 'approved': return 'text-success';
            case 'rejected': return 'text-danger';
            case 'pending': return 'text-warning';
            default: return 'text-muted';
          }
        };
        return <span className={`${getStatusColor(row.status)} fw-bold`}>{row.status || '-'}</span>;
      },
      width: '100px'
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            title='View'
            onClick={() => setViewModal({ open: true, leave: row })}
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <i className='fa fa-eye' style={{ color: '#555' }} />
          </button>
          <button
            title='Edit Status'
            onClick={() => setEditModal({ open: true, leave: row })}
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <i className='fa fa-pencil' style={{ color: '#555' }} />
          </button>
          <button
            title={row.status === 'Approved' ? 'Cannot delete approved leave' : 'Delete'}
            onClick={() => {
              if (row.status !== 'Approved') {
                setDeleteModal({ open: true, leave: row });
              }
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: row.status === 'Approved' ? 'not-allowed' : 'pointer',
              opacity: row.status === 'Approved' ? 0.5 : 1
            }}
          >
            <i className='fa fa-trash-o' style={{ color: '#555' }} />
          </button>
        </div>
      ),
      width: '120px'
    },
    {
      name: 'Upload',
      cell: row => (
        <Button
          color="primary"
          size="sm"
          onClick={() => handleUploadClick(row)}
          style={{ minWidth: '95px', padding: '6px 12px' }}
        >
          {row.scanned_form ? 'Re-upload' : 'Upload'}
        </Button>
      ),
      width: '130px'
    },
    {
      name: 'View Scanned Form',
      cell: row =>
        row.scanned_form ? (
          <Button
            color="success"
            size="sm"
            onClick={() => handleViewScannedForm(row)}
            style={{ minWidth: '80px', padding: '6px 12px' }}
          >
            <i className="fa fa-eye me-1" /> View
          </Button>
        ) : (
          <span className="text-muted">No file</span>
        ),
      width: '150px'
    },
  ];

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (!staffId || userType === 'Staff') {
      navigate('/login');
    } else {
      fetchLeaveHistory();
    }
  }, [staffId, navigate]);

  if (loading) return <Loader />;

  return (
    <Fragment>
      <Container fluid style={{ paddingTop: '30px' }}>
        <Row>
          <Col xl="12">
            <Card className="shadow-sm border-0 rounded-3">
              <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
                <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Manage Leave Request</h3>
                <Button color="primary" size="sm" onClick={() => setShowFilter(!showFilter)}>
                  <i className="fa fa-filter me-2"></i>Filter
                </Button>
              </CardHeader>

              {showFilter && (
                <CardBody className="border-bottom">
                  <Form>
                    <Row>
                      <Col md="3">
                        <FormGroup>
                          <Label>From Date</Label>
                          <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>To Date</Label>
                          <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>Leave Type</Label>
                          <Input
                            type="select"
                            value={filters.leaveType}
                            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                          >
                            <option value="">All Leave Types</option>
                            {getUniqueLeaveTypes().map((type, i) => (
                              <option key={i} value={type}>{type}</option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="3">
                        <FormGroup>
                          <Label>Status</Label>
                          <Input
                            type="select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          >
                            <option value="">All Status</option>
                            {getUniqueStatuses().map((status, i) => (
                              <option key={i} value={status}>{status}</option>
                            ))}
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
                  noDataComponent={
                    <div style={{ fontSize: '1.3rem', padding: '2rem', textAlign: 'center' }}>
                      {leaveHistory.length === 0
                        ? 'No leave history found.'
                        : 'No records match the current filter criteria.'}
                    </div>
                  }
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modular Upload & View Modals */}
      <UploadImageModal
        isOpen={uploadModal.open}
        leave={uploadModal.leave}
        existingScannedForm={uploadModal.existingScannedForm}
        onClose={() => setUploadModal({ open: false, leave: null, existingScannedForm: null })}
        fetchLeaveHistory={fetchLeaveHistory}
        onImageDeleted={handleImageDeleted}
      />

      <ViewImageModal
        isOpen={imagePreview.open}
        imageUrl={imagePreview.imageUrl}
        loading={imagePreview.loading}
        onClose={closeImagePreview}
      />

      {viewModal.open && (
        <ViewLeaveModal
          isOpen={viewModal.open}
          toggle={() => setViewModal({ open: false, leave: null })}
          leave={viewModal.leave}
        />
      )}

      {editModal.open && (
        <EditStatusModal
          isOpen={editModal.open}
          toggle={() => setEditModal({ open: false, leave: null })}
          leave={editModal.leave}
          onSave={fetchLeaveHistory}
          Swal={Swal}
          adminId={adminId}
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

export default ManageLeaveRequest;