import React, { useState } from 'react';
import {
  Col,
  Card,
  CardHeader,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { FaFileCsv, FaFilePdf, FaChevronDown } from 'react-icons/fa';

const TodayStaffLate = ({ lateStaff, loading, error }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const formatTimeDiff = (timeStr) => {
    if (!timeStr) return '00:00:00';
    return timeStr.replace(/^\+/, '').replace(/\./g, ':');
  };

  const formatPhoneNumber = (phone) => {
    return phone || '-';
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const exportCSV = () => {
    const titleRow = [`LATE STAFF`, getFormattedDate()];
    const emptyRow = ['', '', ''];
    const headers = ['Staff Name', 'Phone Number', 'Clock In Time', 'Late Duration', 'Location', 'Notes', 'Status'];

    const rows = lateStaff.map(row => [
      row.staffName,
      formatPhoneNumber(row.staffphone),
      row.clockInTime ? new Date(row.clockInTime).toLocaleTimeString().toUpperCase() : '-',
      formatTimeDiff(row.timeDiff),
      row.locationName || '-',
      row.staffNotes,
      row.status
    ]);

    const csvContent = [
      titleRow,
      emptyRow,
      headers,
      ...rows
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${getFormattedDate()}_LateStaff.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${getFormattedDate()}_LateStaff`, 14, 15);

    const tableColumn = ['Staff Name', 'Phone Number', 'Clock In Time', 'Late Duration', 'Location', 'Notes', 'Status'];
    const tableRows = lateStaff.map(row => [
      row.staffName,
      formatPhoneNumber(row.staffphone),
      row.clockInTime ? new Date(row.clockInTime).toLocaleTimeString().toUpperCase() : '-',
      formatTimeDiff(row.timeDiff),
      row.locationName || '-',
      row.staffNotes,
      row.status,
    ]);

    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`${getFormattedDate()}_LateStaff.pdf`);
  };

  const columns = [
    {
      name: 'Staff Name',
      selector: row => row.staffName,
      sortable: true,
    },
    {
      name: 'Phone Number',
      selector: row => formatPhoneNumber(row.staffphone || row.user?.staffphone),
      sortable: true,
    },
    {
      name: 'Clock In Time',
      selector: row =>
        row.clockInTime ? new Date(row.clockInTime).toLocaleTimeString().toUpperCase() : '-',
    },
    {
      name: 'Late Duration',
      selector: row => formatTimeDiff(row.timeDiff),
    },
    {
      name: 'Location',
      selector: row => row.locationName || '-',
    },
    {
      name: 'Notes',
      selector: row => row.staffNotes || '-',
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      cell: row => {
        const color = row.status === 'Late' ? 'text-danger' : 'text-success';
        return (
          <span className={color} style={{ fontWeight: 'bold' }}>
            {row.status}
          </span>
        );
      },
    },
  ];

  const exportBtnStyle = {
    padding: '6px 12px',
    fontSize: '0.875rem',
    backgroundColor: '#7B61FF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
  };

  if (loading) return <Col sm="12"><div>Loading...</div></Col>;
  if (error) return <Col sm="12"><div>{error}</div></Col>;

  return (
    <Col sm="12">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Today's Late Staff</h3>

          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} disabled={lateStaff.length === 0}>
            <DropdownToggle
              tag="button"
              className="btn"
              style={{
                ...exportBtnStyle,
                opacity: lateStaff.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Export <FaChevronDown />
            </DropdownToggle>

            <DropdownMenu end>
              <DropdownItem onClick={exportCSV}>
                <FaFileCsv style={{ marginRight: '8px' }} />
                Export as CSV
              </DropdownItem>
              <DropdownItem onClick={exportPDF}>
                <FaFilePdf style={{ marginRight: '8px' }} />
                Export as PDF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>

        <DataTable
          columns={columns}
          data={lateStaff}
          pagination
          striped
          highlightOnHover
          responsive
          noDataComponent={
            <div style={{ fontSize: '1.3rem', padding: '1rem', textAlign: 'center' }}>
              No late staff today.
            </div>
          }
        />
      </Card>
    </Col>
  );
};

export default TodayStaffLate;
