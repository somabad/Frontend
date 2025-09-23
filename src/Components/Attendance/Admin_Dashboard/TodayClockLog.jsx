import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Col, Card, CardHeader, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { FaFileCsv, FaFilePdf, FaChevronDown } from 'react-icons/fa';

const TodayClocklog = ({ clockLogs, loading, error }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const getFormattedDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const exportCSV = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // For filename
    const readableDate = today.toLocaleDateString('en-GB'); // 10/6/2025

    // First few custom rows
    const headerLines = [
      `CLOCK LOG,${readableDate}`,
      '',
      '',
      'Staff Name,Phone Number,Clock In,Clock Out,Location,Notes,Status',
    ];

    const rows = clockLogs.map(row => {
      const staffName = row.staff?.name || `Staff #${row.staffId}`;
      let phone = row.staff?.phone || '-';
      if (phone && /^\d+$/.test(phone) && phone.length === 9 && phone.startsWith('1')) {
        phone = `60${phone}`;
      }
      const clockIn = row.clock_in
        ? new Date(row.clock_in).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        : 'N/A';
      const clockOut = row.clock_out
        ? new Date(row.clock_out).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        : 'Not clocked out yet.';
      const location = row.location?.name || `Location #${row.locationId}`;
      const notes = row.notes || `-`;
      const status = row.status || 'On Time';

      return `${staffName},${phone},${clockIn},${clockOut},${location},${notes},${status}`;
    });

    const csvContent = [...headerLines, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${formattedDate}_ClockLogs.csv`);
  };



  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${getFormattedDate()}_ClockLogs`, 14, 15);

    const tableColumn = ['Staff Name', 'Phone Number', 'Clock In', 'Clock Out', 'Location', 'Notes', 'Status'];

    const tableRows = clockLogs.map(row => {
      const staffName = row.staff?.name || `Staff #${row.staffId}`;
      let phone = row.staff?.phone || '-';
      if (phone && /^\d+$/.test(phone) && phone.length === 9 && phone.startsWith('1')) {
        phone = `60${phone}`;
      }
      const clockIn = row.clock_in
        ? new Date(row.clock_in).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        : 'N/A';
      const clockOut = row.clock_out
        ? new Date(row.clock_out).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        : 'Not clocked out yet.';
      const location = row.location?.name || `Location #${row.locationId}`;
      const notes = row.notes || `-`;

      const status = row.status || 'On Time';

      return [staffName, phone, clockIn, clockOut, location, notes, status];
    });

    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`${getFormattedDate()}_ClockLogs.pdf`);
  };


  const columns = [
    {
      name: 'Staff Name',
      selector: row => row.staff?.name || `Staff #${row.staffId}`,
      sortable: true,
    },
    {
      name: 'Phone Number',
      selector: row => row.staff?.phone || `—`,
      sortable: true,
    },
    {
      name: 'Clock In',
      selector: row =>
        row.clock_in
          ? new Date(row.clock_in).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
          : 'N/A',
    },
    {
      name: 'Clock Out',
      selector: row =>
        row.clock_out
          ? new Date(row.clock_out).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
          : 'Not clocked out yet.',
    },
    {
      name: 'Notes',
      selector: row => row.notes || '-',
    },
    {
      name: 'Status',
      cell: row => {
        const status = row.status || 'On Time';
        const color = status === 'Late' ? 'text-danger' : 'text-success';
        return (
          <span className={color} style={{ fontWeight: 'bold' }}>
            {status}
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
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Today's Clock Logs</h3>

          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} disabled={clockLogs.length === 0}>
            <DropdownToggle
              tag="button"
              className="btn"
              style={{
                ...exportBtnStyle,
                opacity: clockLogs.length === 0 ? 0.5 : 1,
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
          data={clockLogs}
          pagination
          striped
          highlightOnHover
          responsive
          noDataComponent="No logs for today."
        />
      </Card>
    </Col>
  );
};

export default TodayClocklog;
