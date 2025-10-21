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
import axios from 'axios';


const AdminLeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [allLeaveRecords, setAllLeaveRecords] = useState([]); // Store all records including pending for export
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(null); // For managing tooltip state
  const [exportModal, setExportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [exportType, setExportType] = useState('month'); // 'month' or 'staff'
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [staffLeaveBalance, setStaffLeaveBalance] = useState([]);
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
      
      // Store ALL records (including pending AND deleted) for export - for audit trail
      setAllLeaveRecords(allHistory);
      
      // Filter to show only approved and rejected leave requests (exclude pending from table view)
      const filteredHistory = allHistory.filter(item => 
        (item.status?.toLowerCase() === 'approved' || item.status?.toLowerCase() === 'rejected') && !item.is_deleted
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

  // Get months for export dropdown (use all records including pending)
  const getAvailableMonths = () => {
    const months = [...new Set(allLeaveRecords.map(item => {
      const date = new Date(item.created_at);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();
    return months;
  };

  // Export to PDF function (by month)
  const exportToPDFByMonth = () => {
    if (!selectedMonth) {
      alert('Please select a month to export');
      return;
    }

    // Use allLeaveRecords which includes pending, approved, rejected (excludes deleted)
    // Filter data by selected month
    const filteredByMonth = allLeaveRecords.filter(item => {
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

    const tableRows = filteredByMonth.map(item => {
      // Add "(Deleted)" indicator to status if record was deleted by staff
      const statusText = item.is_deleted 
        ? `${item.status || '-'} (Deleted)` 
        : item.status || '-';
      
      return [
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
        statusText
      ];
    });

    // Add table
    autoTable(doc, {
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
    const approvedCount = filteredByMonth.filter(item => item.status?.toLowerCase() === 'approved' && !item.is_deleted).length;
    const rejectedCount = filteredByMonth.filter(item => item.status?.toLowerCase() === 'rejected' && !item.is_deleted).length;
    const pendingCount = filteredByMonth.filter(item => item.status?.toLowerCase() === 'pending' && !item.is_deleted).length;
    const deletedCount = filteredByMonth.filter(item => item.is_deleted).length;
    const totalCount = filteredByMonth.length;

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 10, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Requests: ${totalCount}`, 10, finalY + 8);
    doc.text(`Approved: ${approvedCount}`, 10, finalY + 16);
    doc.text(`Rejected: ${rejectedCount}`, 10, finalY + 24);
    doc.text(`Pending: ${pendingCount}`, 10, finalY + 32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); // Red color for deleted
    doc.text(`Deleted by Staff: ${deletedCount}`, 10, finalY + 40);
    doc.setTextColor(0, 0, 0); // Reset to black

    // Save the PDF
    doc.save(`Leave_History_${monthName}_${year}.pdf`);
    setExportModal(false);
    setSelectedMonth('');
  };

  // Export to PDF function (by staff)
  const exportToPDFByStaff = () => {
    if (!selectedStaff) {
      alert('Please select a staff member to export');
      return;
    }

    const currentYear = new Date().getFullYear();
    const staff = staffList.find(s => s.staffId === parseInt(selectedStaff));
    
    if (!staff) {
      alert('Staff member not found');
      return;
    }

    // Filter data by selected staff
    const staffLeaveData = leaveHistory.filter(item => item.staffId === parseInt(selectedStaff));

    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Leave Report - ${staff.name}`, 148, 15, { align: 'center' });
    
    // Add staff info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Department: ${staff.department || 'N/A'} | Position: ${staff.position?.name || 'N/A'}`, 148, 22, { align: 'center' });
    doc.text(`Year: ${currentYear} | Generated on: ${new Date().toLocaleDateString()}`, 148, 28, { align: 'center' });

    let currentY = 35;

    // Add Leave Balance Section
    if (staffLeaveBalance.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Leave Balance Summary', 10, currentY);
      
      currentY += 8;

      const balanceColumns = ['Leave Type', 'Entitled', 'Carry Forward', 'Total Entitlement', 'Used', 'Remaining'];
      const balanceRows = staffLeaveBalance.map(balance => {
        // Get leave type name
        const leaveTypeName = balance.leave_type_name || 'N/A';
        return [
          leaveTypeName,
          balance.entitled_days?.toString() || '0',
          balance.carry_forward_days?.toString() || '0',
          balance.total_entitlement?.toString() || '0',
          balance.used_days?.toString() || '0',
          balance.total_balance?.toString() || '0'
        ];
      });

      autoTable(doc, {
        head: [balanceColumns],
        body: balanceRows,
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [40, 167, 69],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { left: 10, right: 10 }
      });

      currentY = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('No leave balance information available', 10, currentY);
      currentY += 12;
    }

    // Add Leave History Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Leave History', 10, currentY);
    
    currentY += 8;

    if (staffLeaveData.length > 0) {
      const tableColumns = [
        'Request ID',
        'Applied Date',
        'From',
        'To',
        'Days',
        'Leave Type',
        'Reason',
        'Status'
      ];

      const tableRows = staffLeaveData.map(item => [
        item.request_id || '-',
        new Date(item.created_at).toLocaleDateString(),
        new Date(item.start_date).toLocaleDateString(),
        new Date(item.end_date).toLocaleDateString(),
        item.total_days || '-',
        item.leave_type || '-',
        item.reason ? (item.reason.length > 30 ? item.reason.substring(0, 30) + '...' : item.reason) : '-',
        item.status || '-'
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: currentY,
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 30 },
          6: { cellWidth: 50 },
          7: { cellWidth: 20 }
        },
        margin: { left: 10, right: 10 }
      });

      // Add summary
      const approvedCount = staffLeaveData.filter(item => item.status?.toLowerCase() === 'approved').length;
      const rejectedCount = staffLeaveData.filter(item => item.status?.toLowerCase() === 'rejected').length;
      const totalDaysUsed = staffLeaveData
        .filter(item => item.status?.toLowerCase() === 'approved')
        .reduce((sum, item) => sum + parseFloat(item.total_days || 0), 0);

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 10, finalY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Requests: ${staffLeaveData.length}`, 10, finalY + 8);
      doc.text(`Approved: ${approvedCount}`, 10, finalY + 16);
      doc.text(`Rejected: ${rejectedCount}`, 10, finalY + 24);
      doc.text(`Total Days Used: ${totalDaysUsed.toFixed(1)}`, 10, finalY + 32);
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('No leave history available for this staff member', 10, currentY);
    }

    // Save the PDF
    doc.save(`Leave_Report_${staff.name.replace(/\s+/g, '_')}_${currentYear}.pdf`);
    setExportModal(false);
    setSelectedStaff('');
  };

  // Main export handler
  const handleExport = () => {
    if (exportType === 'month') {
      exportToPDFByMonth();
    } else {
      exportToPDFByStaff();
    }
  };

  // Fetch staff list for export dropdown
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/staff-list/');
        setStaffList(response.data);
      } catch (error) {
        console.error('Error fetching staff list:', error);
      }
    };

    if (exportModal) {
      fetchStaffList();
    }
  }, [exportModal]);

  // Fetch staff leave balance when staff is selected
  useEffect(() => {
    const fetchStaffLeaveBalance = async () => {
      if (selectedStaff) {
        try {
          const currentYear = new Date().getFullYear();
          const response = await axios.get(
            `http://127.0.0.1:8000/api/staff/${selectedStaff}/leave-balance/?year=${currentYear}`
          );
          setStaffLeaveBalance(response.data);
        } catch (error) {
          console.error('Error fetching staff leave balance:', error);
          setStaffLeaveBalance([]);
        }
      }
    };

    fetchStaffLeaveBalance();
  }, [selectedStaff]);

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
      <Modal isOpen={exportModal} toggle={() => {
        setExportModal(false);
        setExportType('month');
        setSelectedMonth('');
        setSelectedStaff('');
      }} centered size="lg">
        <ModalHeader toggle={() => {
          setExportModal(false);
          setExportType('month');
          setSelectedMonth('');
          setSelectedStaff('');
        }}>
          Export Leave History to PDF
        </ModalHeader>
        <ModalBody>
          {/* Export Type Selection */}
          <FormGroup>
            <Label className="fw-bold">Export Type</Label>
            <div className="d-flex gap-3 mt-2">
              <div className="form-check">
                <Input
                  type="radio"
                  id="exportByMonth"
                  name="exportType"
                  value="month"
                  checked={exportType === 'month'}
                  onChange={(e) => {
                    setExportType(e.target.value);
                    setSelectedStaff('');
                  }}
                  className="form-check-input"
                />
                <Label for="exportByMonth" className="form-check-label">
                  Export by Month
                </Label>
              </div>
              <div className="form-check">
                <Input
                  type="radio"
                  id="exportByStaff"
                  name="exportType"
                  value="staff"
                  checked={exportType === 'staff'}
                  onChange={(e) => {
                    setExportType(e.target.value);
                    setSelectedMonth('');
                  }}
                  className="form-check-input"
                />
                <Label for="exportByStaff" className="form-check-label">
                  Export by Staff Member
                </Label>
              </div>
            </div>
          </FormGroup>
          <hr className="my-3" />

          {/* Month Selection */}
          {exportType === 'month' && (
            <>
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
            </>
          )}

          {/* Staff Selection */}
          {exportType === 'staff' && (
            <>
              <FormGroup>
                <Label for="staffSelect">Select Staff Member</Label>
                <Input
                  type="select"
                  id="staffSelect"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">Choose a staff member...</option>
                  {staffList
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((staff) => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.name} - {staff.department || 'No Department'}
                      </option>
                    ))}
                </Input>
              </FormGroup>
              <div className="text-muted small">
                <i className="fa fa-info-circle me-1"></i>
                This will export a detailed leave report for the selected staff member, including:
                <ul className="mt-2 mb-0" style={{ fontSize: '12px' }}>
                  <li>Leave balance summary (entitled, used, and remaining)</li>
                  <li>Complete leave history (all approved and rejected requests)</li>
                  <li>Statistical summary</li>
                </ul>
              </div>
            </>
          )}
          <div className="text-muted small">
            <i className="fa fa-info-circle me-1"></i>
            This will export all leave records (pending, approved, rejected, and deleted) for the selected month.
            <br />
            <i className="fa fa-exclamation-triangle me-1" style={{ color: '#dc3545' }}></i>
            <strong>Audit Trail:</strong> Deleted records will be marked as "(Deleted)" in the Status column.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => {
            setExportModal(false);
            setExportType('month');
            setSelectedMonth('');
            setSelectedStaff('');
          }}>
            Cancel
          </Button>
          <Button 
            color="success" 
            onClick={handleExport} 
            disabled={exportType === 'month' ? !selectedMonth : !selectedStaff}
          >
            <i className="fa fa-download me-1"></i>
            Export PDF
          </Button>
        </ModalFooter>
      </Modal>

    </>
  );
};

export default AdminLeaveHistory;