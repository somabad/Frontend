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
        </div>
      ),
      width: '90px'
    }
  ];


  // View modal state and handler
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const handleView = (row) => {
    setViewModal({ open: true, leave: row });
  };


  // Fetch leave history data
  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const data = await getAdminLeaveHistory(staffId);
      const allHistory = data.leaveHistory || [];
      
      // Filter to show only approved and rejected leave requests
      const filteredHistory = allHistory.filter(item => 
        item.status?.toLowerCase() === 'approved' || item.status?.toLowerCase() === 'rejected'
      );
      
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
  }, [staffId, navigate]);

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

    </>
  );
};

export default AdminLeaveHistory;