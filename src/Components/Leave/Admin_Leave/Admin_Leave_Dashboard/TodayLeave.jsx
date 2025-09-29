import React from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';

const TodayLeave = ({ onLeaveTodayNames, loading, error }) => {
  const columns = [
    { 
      name: 'Staff Name', 
      selector: row => row.staff_name,
      sortable: true 
    },
    { 
      name: 'Staff Department', 
      selector: row => row.staff_department,
      sortable: true
    },
    { name: 'Leave Type', 
      selector: row => row.leave_type, 
      sortable: true 
    },
    { name: 'Start Date', 
      selector: row => row.start_date, 
      sortable: true 
    },
    { name: 'End Date', 
      selector: row => row.end_date, 
      sortable: true 
    },
    { name: 'Job Taken by', 
      selector: row => row.job_taken_over_by, 
      sortable: true },
    {
      name: 'Status',
      selector: row => row.status || '-',
      cell: row => {
        const color = row.status === 'Pending' ? 'text-danger' : 'text-success';
        return <span className={color} style={{ fontWeight: 'bold' }}>{row.status}</span>;
      },
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
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Today's Staff Leave</h3>
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
