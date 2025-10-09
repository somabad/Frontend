import React, { useState } from 'react';
import { Col, Card, CardHeader, Tooltip } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const TodayLeave = ({ onLeaveTodayNames, loading, error }) => {

  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Toggle the tooltip visibility
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const columns = [
    {
      name: 'Name',
      selector: row => row.staff_name,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.staff_name || '-'}
        </div>
      ),
      width: '110px',
    },
    { 
      name: 'Department', 
      selector: row => row.staff_department,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.staff_department || '-'}
        </div>
      ),
      width: '150px',
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.leave_type || '-'}
        </div>
      ),
      width: '120px',
    },
    {
      name: 'Start Date',
      selector: row => row.start_date,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.start_date || '-'}
        </div>
      ),
      width: '190px',
    },
    {
      name: 'End Date',
      selector: row => row.end_date,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.end_date || '-'}
        </div>
      ),
      width: '160px',
    },
    { 
      name: 'Job Taken by', 
      selector: row => row.job_taken_over_by, 
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
          {row.job_taken_over_by || '-'}
        </div>
      ),
      width: '170px',
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      cell: row => {
        const color = row.status === 'Pending' ? 'text-danger' : 'text-success';
        return <span className={color} style={{ fontWeight: 'bold' }}>{row.status}</span>;
      },
      width: '150px'
    },
    {
      name: 'Submitted At',
      selector: row => row.created_at
    },
  ];

  if (loading) return <Col sm="12"><div>Loading...</div></Col>;
  if (error) return <Col sm="12"><div>{error}</div></Col>;

  return (
    <Col sm="12">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>
            Today's Staff Leave
            <span
              id="today-staff-leave-info" 
              style={{ marginLeft: '8px', cursor: 'pointer', color: '#888'}} 
              onMouseEnter={toggleTooltip} 
              onMouseLeave={toggleTooltip} 
            >
            <AiOutlineInfoCircle size={20} />
            </span>
            <Tooltip
              placement="right"
              isOpen={tooltipOpen}
              target="today-staff-leave-info"
              toggle={toggleTooltip}
            >
              This section shows staff who are currently on leave today.
            </Tooltip>
          </h3>
        </CardHeader>

        <DataTable
          columns={columns}
          data={onLeaveTodayNames}
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