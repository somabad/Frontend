import React, { useState } from 'react';
import { Col, Card, CardHeader, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import DataTable from 'react-data-table-component'; //not same as HTML(not user-friendly))

const TodayLeave = ({ staffLeave, loading, error }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const formatTimeDiff = (timeStr) => {
    if (!timeStr) return '00:00:00';
    return timeStr.replace(/^\+/, '').replace(/\./g, ':');
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

  if (loading) return <Col sm="12"><div>Loading...</div></Col>;
  if (error) return <Col sm="12"><div>{error}</div></Col>;

  return (
    <Col sm="12">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Today's Staff Leave</h3>

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
              No leave staff today.
            </div>
          }
        />
      </Card>
    </Col>
  );
};

export default TodayLeave;
