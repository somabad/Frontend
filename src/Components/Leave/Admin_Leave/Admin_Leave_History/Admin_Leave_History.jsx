import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, FormGroup, Label, Input, Form } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { getAdminLeaveHistory } from '../../../Attendance/utils';
import Loader from '../../../Attendance/Loader';
import { useNavigate } from 'react-router-dom';
import ViewLeaveModal from '../../Staff_Leave/Leave_Request_Form/ViewLeaveModal';


const AdminLeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
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
      width: '120px'
    },
    {
      name: 'Department',
      selector: row => row.staff_department,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
          {row.staff_department || '-'}
        </div>
      ),
      width: '120px'
    },
    {
      name: 'Position',
      selector: row => row.staff_position,
      sortable: true,
      cell: row => row.staff_position || '-',
      width: '100px'
    },
    {
      name: 'Applied Date',
      selector: row => row.created_at,
      sortable: true,
      cell: row => new Date(row.created_at).toLocaleDateString(),
      width: '120px'
    },
    {
      name: <div style={{textAlign: 'center', width: '110px'}}>From</div>,
      selector: row => row.start_date,
      sortable: true,
      cell: row => <div style={{textAlign: 'center'}}>{new Date(row.start_date).toLocaleDateString()}</div>,
      width: '110px'
    },
    {
      name: <div style={{textAlign: 'center', width: '110px'}}>To</div>,
      selector: row => row.end_date,
      sortable: true,
      cell: row => <div style={{textAlign: 'center'}}>{new Date(row.end_date).toLocaleDateString()}</div>,
      width: '110px'
    },
    {
      name: 'Total Days',
      selector: row => row.total_days,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.total_days || '-'}
        </div>
      ),
      width: '100px'
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Taken Over By',
      selector: row => row.job_taken_over_by,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
          {row.job_taken_over_by || '-'}
        </div>
      ),
      width: '130px'
    },
    {
      name: 'Reason',
      selector: row => row.reason,
      sortable: true,
      cell: row => row.reason || '-',
      width: '130px'
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
      width: '100px'
    }
    ,
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            title='View'
            onClick={() => handleView(row)}
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <i className='fa fa-eye' style={{ color: '#555' }} />
          </button>
          <button
            title='Archive'
            onClick={() => handleArchive(row)}
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <i className='fa fa-archive' style={{ color: '#555' }} />
          </button>
        </div>
      ),
      width: '90px'
    }
  ];

  // Archive handler and confirmation modal
  const [archived, setArchived] = useState(() => {
    const savedArchived = localStorage.getItem('archivedLeaveRequests');
    return savedArchived ? JSON.parse(savedArchived) : [];
  });
  const [archiveModal, setArchiveModal] = useState({ open: false, leave: null });
  const [archiveLoading, setArchiveLoading] = useState(false);
  const handleArchive = (row) => {
    setArchiveModal({ open: true, leave: row });
  };
  const confirmArchive = () => {
    setArchiveLoading(true);
    setTimeout(() => {
      const row = archiveModal.leave;
      if (row) {
        const newArchived = [...archived, row];
        setArchived(newArchived);
        localStorage.setItem('archivedLeaveRequests', JSON.stringify(newArchived));
        setLeaveHistory(prev => prev.filter(item => item.request_id !== row.request_id));
        setFilteredData(prev => prev.filter(item => item.request_id !== row.request_id));
      }
      setArchiveModal({ open: false, leave: null });
      setArchiveLoading(false);
    }, 1000);
  };
  const cancelArchive = () => {
    setArchiveModal({ open: false, leave: null });
  };

  // View modal state and handler
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const handleView = (row) => {
    setViewModal({ open: true, leave: row });
  };

  // Archived modal state
  const [archivedModal, setArchivedModal] = useState(false);

  // Fetch leave history data
  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const data = await getAdminLeaveHistory(staffId);
      const allHistory = data.leaveHistory || [];
      
      // Filter out archived items
      const archivedIds = archived.map(item => item.request_id);
      const filteredHistory = allHistory.filter(item => !archivedIds.includes(item.request_id));
      
      setLeaveHistory(filteredHistory);
      setFilteredData(filteredHistory);
    } catch (err) {
      setError('Failed to load leave history');
      console.error('Error fetching leave history:', err);
    } finally {
      setTimeout(() => setLoading(false), 2000);
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

  useEffect(() => {
    // Check sessionStorage for staffId and userType
    const userType = sessionStorage.getItem('userType');

    if (!staffId || userType === 'Staff') {
      navigate('/login');
    } else {
      fetchLeaveHistory();
    }
  }, [staffId, navigate, archived]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Container fluid={true} style={{ paddingTop: "30px" }}>
        <Row>
          <Col xl="12">
            <Card className="shadow-sm border-0 rounded-3">
              <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
                <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>
                  Leave History
                </h3>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => setShowFilter(!showFilter)}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="fa fa-filter"></i>
                    Filter
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setArchivedModal(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="fa fa-archive"></i>
                    View Archived
                  </Button>
                </div>
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

      {viewModal.open && (
        <ViewLeaveModal
          isOpen={viewModal.open}
          toggle={() => setViewModal({ open: false, leave: null })}
          leave={viewModal.leave}
          isAdmin={false}
        />
      )}

      {/* Archive Confirmation*/}
      {archiveModal.open && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Archive Confirmation</h5>
                <button type="button" className="btn-close" onClick={cancelArchive}></button>
              </div>
              <div className="modal-body">
                {archiveLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Processing...</div>
                  </div>
                ) : (
                  <p>Are you sure you want to archive this record?</p>
                )}
              </div>
              <div className="modal-footer">
                {!archiveLoading && (
                  <>
                    <button className="btn btn-secondary" onClick={cancelArchive}>Cancel</button>
                    <button className="btn btn-warning" onClick={confirmArchive}>Yes, Archive</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archived Modal */}
      {archivedModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document" style={{ maxWidth: '95vw', width: '95vw', height: '90vh', margin: '2.5vh auto' }}>
            <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header bg-secondary text-white">
                <h5 className="modal-title">Archived Leave Requests</h5>
                <button type="button" className="btn-close" onClick={() => setArchivedModal(false)}></button>
              </div>
              <div className="modal-body" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
                {archiveLoading ? (
                  <div className="text-center py-4" style={{ padding: '2rem' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Processing...</div>
                  </div>
                ) : archived.length === 0 ? (
                  <div className="text-center py-4" style={{ padding: '2rem' }}>No archived records.</div>
                ) : (
                   <table className="table table-bordered table-striped">
                     <thead>
                       <tr>
                         <th>Name</th>
                         <th>Department</th>
                         <th>Position</th>
                         <th>Applied Date</th>
                         <th>From</th>
                         <th>To</th>
                         <th>Total Days</th>
                         <th>Leave Type</th>
                         <th>Taken Over By</th>
                         <th>Reason</th>
                         <th>Status</th>
                         <th>Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {archived.map((item, idx) => (
                         <tr key={idx}>
                           <td>{item.staff_name}</td>
                           <td>{item.staff_department || '-'}</td>
                           <td>{item.staff_position || '-'}</td>
                           <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                           <td>{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</td>
                           <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</td>
                           <td>{item.total_days || '-'}</td>
                           <td>{item.leave_type}</td>
                           <td>{item.job_taken_over_by || '-'}</td>
                           <td>{item.reason || '-'}</td>
                           <td>
                             <span className={`fw-bold ${
                               item.status?.toLowerCase() === 'approved' ? 'text-success' :
                               item.status?.toLowerCase() === 'rejected' ? 'text-danger' :
                               item.status?.toLowerCase() === 'pending' ? 'text-warning' : 'text-muted'
                             }`}>
                               {item.status || '-'}
                             </span>
                             {item.is_deleted && (
                               <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7em' }}>
                                 DELETED
                               </span>
                             )}
                           </td>
                           <td>
                             <div style={{ display: 'flex', gap: '8px' }}>
                               <button
                                 title='View'
                                 onClick={() => setViewModal({ open: true, leave: item })}
                                 style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                               >
                                 <i className='fa fa-eye' style={{ color: '#555' }} />
                               </button>
                               <button className="btn btn-success btn-sm" onClick={() => {
                                 setArchiveLoading(true);
                                 setTimeout(() => {
                                   const newArchived = archived.filter(a => a.request_id !== item.request_id);
                                   setArchived(newArchived);
                                   localStorage.setItem('archivedLeaveRequests', JSON.stringify(newArchived));
                                   setLeaveHistory(prev => [...prev, item]);
                                   setFilteredData(prev => [...prev, item]);
                                   setArchiveLoading(false);
                                 }, 1000);
                               }}>Unarchive</button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setArchivedModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLeaveHistory;