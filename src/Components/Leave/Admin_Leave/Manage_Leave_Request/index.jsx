
  import React, { useState, useEffect, Fragment } from 'react';
  import {
    Container, Row, Col, Card, CardHeader, CardBody, Button,
    FormGroup, Label, Input, Form
  } from 'reactstrap';
  import DataTable from 'react-data-table-component';
  import {
    getScannedForm,
    getManageLeaveRequest
  } from '../../../Attendance/utils';
  import Loader from '../../../Attendance/Loader';
  import { useNavigate } from 'react-router-dom';
  import Swal from 'sweetalert2';
  import ViewLeaveModal from '../../Staff_Leave/Leave_Request_Form/ViewLeaveModal';
  import EditStatusModal from '../Manage_Leave_Request/EditStatusModal';

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
        const data = await getManageLeaveRequest(); // Use the correct API for manage leave request
        const allRequests = data.leaveRequests || [];
        
        // Debug: Check if attachments are in the data
        console.log('Leave Requests Data:', allRequests);
        console.log('Attachments found:', allRequests.filter(req => req.attachment).map(req => ({ 
          id: req.request_id, 
          attachment: req.attachment 
        })));
        
        // Filter to show only pending leave requests
        const pendingRequests = allRequests.filter(item => 
          item.status?.toLowerCase() === 'pending'
        );
        
        // Sort by created_at date and time (latest first)
        const sortedRequests = pendingRequests.sort((a, b) => {
          // Convert to Date objects for proper comparison
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          
          // If dates are invalid, fallback to request_id comparison
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return (b.request_id || 0) - (a.request_id || 0);
          }
          
          // Primary sort: by date/time (latest first)
          const timeDiff = dateB.getTime() - dateA.getTime();
          
          // If same date/time, sort by request_id (higher ID = more recent)
          if (timeDiff === 0) {
            return (b.request_id || 0) - (a.request_id || 0);
          }
          
          return timeDiff;
        });
        
        setLeaveHistory(sortedRequests);
        setFilteredData(sortedRequests);
      } catch (err) {
        setError('Failed to load leave history');
        console.error('Error fetching leave history:', err);
      } finally {
        // longer loading time
        setTimeout(() => {
          setLoading(false);
        }, 2000); // 2 seconds delay
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

    // View scanned form - Downloads and opens in PDF app
    const handleViewScannedForm = async (leave) => {
      const requestId = leave?.request_id || leave;
      if (!requestId) {
        Swal.fire({
          icon: 'warning',
          title: 'No Request',
          text: 'No leave request selected.'
        });
        return;
      }

      try {
        // getScannedForm should return something like: { success: true, file_url: '/media/...' }
        const result = await getScannedForm(requestId);

        if (!result) throw new Error('Empty response from server');

        // possible fields: file_url or url — be flexible
        let fileUrl = result.file_url || result.fileUrl || result.url || null;

        // If backend returned a blob or direct data, handle fallback (rare)
        if (!fileUrl && result instanceof Blob) {
          const blobUrl = URL.createObjectURL(result);
          // Download the blob
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `scanned_form_${requestId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
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

        // Extract filename from URL
        const filename = fileUrl.split('/').pop() || `scanned_form_${requestId}.pdf`;

        // Fetch the file and trigger download to open in PDF app
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename; // This forces download instead of browser view
        link.style.display = 'none';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);

      } catch (err) {
        console.error('Error downloading scanned form:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.error || err.message || 'Failed to download scanned form'
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

    // View attachment file (uploaded in form) - Downloads and opens in PDF app
    const handleViewAttachment = async (leave) => {
      const attachment = leave?.attachment;
      if (!attachment) {
        Swal.fire({
          icon: 'warning',
          title: 'No Attachment',
          text: 'This leave request has no attachment file.'
        });
        return;
      }

      try {
        // Build the file URL for attachment
        let fileUrl = attachment;

        // If fileUrl is already absolute leave it; otherwise prefix with base URL
        const isAbsolute = /^https?:\/\//i.test(fileUrl);
        const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

        if (!isAbsolute) {
          // ensure leading slash
          if (!fileUrl.startsWith('/')) fileUrl = `/${fileUrl}`;
          fileUrl = `${baseUrl}${fileUrl}`;
        }

        // Extract filename from URL
        const filename = fileUrl.split('/').pop() || 'attachment.pdf';

        // Fetch the file and trigger download to open in PDF app
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename; // This forces download instead of browser view
        link.style.display = 'none';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);

      } catch (err) {
        console.error('Error downloading attachment file:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download attachment file'
        });
      }
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
          </div>
        ),
        width: '120px'
      },
      {
        name: 'Attachment',
        cell: row =>
          row.attachment ? (
            <Button
              color="info"
              size="sm"
              onClick={() => handleViewAttachment(row)}
              style={{ minWidth: '80px', padding: '6px 12px' }}
              title="Download and open in PDF app"
            >
              <i className="fa fa-download me-1" /> View
            </Button>
          ) : (
            <span className="text-muted">No file</span>
          ),
        width: '120px'
      },
      {
        name: 'Approved File',
        cell: row =>
          row.scanned_form ? (
            <Button
              color="success"
              size="sm"
              onClick={() => handleViewScannedForm(row)}
              style={{ minWidth: '80px', padding: '6px 12px' }}
              title="Download and open in PDF app"
            >
              <i className="fa fa-download me-1" /> View
            </Button>
          ) : (
            <span className="text-muted">No file</span>
          ),
        width: '120px'
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
            isAdmin={true}
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

      </Fragment>
    );
  };

  export default ManageLeaveRequest;