import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, FormGroup, Label, Input, Form, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { getAdminLeaveHistory } from '../../../Attendance/utils';
import Loader from '../../../Attendance/Loader';
import { useNavigate } from 'react-router-dom';
import ViewLeaveModal from '../../Staff_Leave/Leave_Request_Form/ViewLeaveModal';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const AdminLeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(null); // For managing tooltip state
  const [exportModal, setExportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
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
      name: 'Request ID',
      selector: row => row.request_id,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {row.request_id || '-'}
        </div>
      ),
      width: '100px'
    },
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
        
        // Check for admin name who rejected the request (only for rejected status)
        const rejectedByName = row.approved_by_name;
        const isRejected = row.status?.toLowerCase() === 'rejected';
        const remarks = row.remarks && row.remarks.trim() ? `Remarks: ${row.remarks.trim()}` : 'Remarks: No remarks provided';
        const tooltipId = `tooltip-${row.request_id}`;
        
        return (
          <div style={{ textAlign: 'center', padding: '4px 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <div className={`${getStatusColor(row.status)} fw-bold`} style={{ 
                fontSize: '0.85em'
              }}>
                {row.status || '-'}
              </div>
              {isRejected && (
                <>
                  <span
                    id={tooltipId}
                    style={{ cursor: 'pointer', color: '#888' }}
                    onMouseEnter={() => setTooltipOpen(tooltipId)}
                    onMouseLeave={() => setTooltipOpen(null)}
                  >
                    <AiOutlineInfoCircle size={14} />
                  </span>
                  <Tooltip
                    placement='top'
                    isOpen={tooltipOpen === tooltipId}
                    target={tooltipId}
                    toggle={() => setTooltipOpen(tooltipOpen === tooltipId ? null : tooltipId)}
                  >
                    {remarks}
                  </Tooltip>
                </>
              )}
            </div>
            {isRejected && rejectedByName && (
              <div style={{ 
                fontSize: '0.65em', 
                color: '#666', 
                lineHeight: '1.1',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                marginTop: '2px'
              }}>
                Rejected by: {rejectedByName}
              </div>
            )}
          </div>
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
      
      // Sort by created_at date and time (latest first)
      const sortedHistory = filteredHistory.sort((a, b) => {
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
      
      setLeaveHistory(sortedHistory);
      setFilteredData(sortedHistory);
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

  // Get months for export dropdown
  const getAvailableMonths = () => {
    const months = [...new Set(leaveHistory.map(item => {
      const date = new Date(item.created_at);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();
    return months;
  };

  // Export to PDF function
  const exportToPDF = () => {
    if (!selectedMonth) {
      alert('Please select a month to export');
      return;
    }

    // Filter data by selected month
    const filteredByMonth = leaveHistory.filter(item => {
      const itemDate = new Date(item.created_at);
      const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      return itemMonth === selectedMonth;
    });

    if (filteredByMonth.length === 0) {
      alert('No data found for the selected month');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Add title
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[parseInt(month) - 1];
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Leave History Report - ${monthName} ${year}`, 148, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 148, 28, { align: 'center' });

    // Prepare table data
    const tableColumns = [
      'Request ID',
      'Name',
      'Department',
      'Position', 
      'Applied Date',
      'From',
      'To',
      'Total Days',
      'Leave Type',
      'Taken Over By',
      'Reason',
      'Status'
    ];

    const tableRows = filteredByMonth.map(item => [
      item.request_id || '-',
      item.staff_name || '-',
      item.staff_department || '-',
      item.staff_position || '-',
      new Date(item.created_at).toLocaleDateString(),
      new Date(item.start_date).toLocaleDateString(),
      new Date(item.end_date).toLocaleDateString(),
      item.total_days || '-',
      item.leave_type || '-',
      item.job_taken_over_by || '-',
      item.reason || '-',
      item.status || '-'
    ]);

    // Add table
    const tableResult = autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Request ID
        1: { cellWidth: 25 }, // Name
        2: { cellWidth: 20 }, // Department
        3: { cellWidth: 20 }, // Position
        4: { cellWidth: 20 }, // Applied Date
        5: { cellWidth: 18 }, // From
        6: { cellWidth: 18 }, // To
        7: { cellWidth: 15 }, // Total Days
        8: { cellWidth: 20 }, // Leave Type
        9: { cellWidth: 25 }, // Taken Over By
        10: { cellWidth: 30 }, // Reason
        11: { cellWidth: 15 } // Status
      },
      margin: { left: 10, right: 10 }
    });

    // Add summary
    const approvedCount = filteredByMonth.filter(item => item.status?.toLowerCase() === 'approved').length;
    const rejectedCount = filteredByMonth.filter(item => item.status?.toLowerCase() === 'rejected').length;
    const totalCount = filteredByMonth.length;

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 10, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Requests: ${totalCount}`, 10, finalY + 8);
    doc.text(`Approved: ${approvedCount}`, 10, finalY + 16);
    doc.text(`Rejected: ${rejectedCount}`, 10, finalY + 24);

    // Save the PDF
    doc.save(`Leave_History_${monthName}_${year}.pdf`);
    setExportModal(false);
    setSelectedMonth('');
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
                    color="success"
                    size="sm"
                    onClick={() => setExportModal(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="fa fa-download"></i>
                    Export PDF
                  </Button>
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

      {/* Export PDF Modal */}
      <Modal isOpen={exportModal} toggle={() => setExportModal(false)} centered>
        <ModalHeader toggle={() => setExportModal(false)}>
          Export Leave History to PDF
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="monthSelect">Select Month to Export</Label>
            <Input
              type="select"
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Choose a month...</option>
              {getAvailableMonths().map((month) => {
                const [year, monthNum] = month.split('-');
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
                const monthName = monthNames[parseInt(monthNum) - 1];
                return (
                  <option key={month} value={month}>
                    {monthName} {year}
                  </option>
                );
              })}
            </Input>
          </FormGroup>
          <div className="text-muted small">
            <i className="fa fa-info-circle me-1"></i>
            This will export all leave records (approved and rejected) for the selected month.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setExportModal(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={exportToPDF} disabled={!selectedMonth}>
            <i className="fa fa-download me-1"></i>
            Export PDF
          </Button>
        </ModalFooter>
      </Modal>

    </>
  );
};

export default AdminLeaveHistory;