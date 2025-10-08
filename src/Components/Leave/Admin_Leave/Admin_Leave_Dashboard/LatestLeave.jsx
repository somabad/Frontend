import React from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';

const LatestLeave = ({ staffLeave, loading, error }) => {
  // Show staff who submitted requests today OR start their leave today (no limit)
  const latestRequests = staffLeave
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
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
      width: '170px',
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
    { name: 'Job Taken by', 
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
        const getStatusColor = (status) => {
          switch (status) {
            case 'Approved': return 'text-success';
            case 'Rejected': return 'text-danger';
            case 'Pending': return 'text-warning';
            default: return '';
          }
        };
        return (
          <span className={getStatusColor(row.status)} style={{ fontWeight: 'bold' }}>
            {row.status}
          </span>
        );
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
        <CardHeader>
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Today's Leave Request</h3>
        </CardHeader>

        <DataTable
          columns={columns}
          data={latestRequests}
          striped
          highlightOnHover
          responsive
          noDataComponent={
            <div style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center' }}>
              No leave requests found.
            </div>
          }
        />
      </Card>
    </Col>
  );
};

export default LatestLeave;