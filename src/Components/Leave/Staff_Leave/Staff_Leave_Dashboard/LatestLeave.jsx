import React from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';

const LatestLeave = ({ staffLeave, loading, error }) => {
  // Show only the 3 newest requests
  const latestRequests =Array.isArray(staffLeave)
    ?staffLeave.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3) : [];

  const columns = [
    {
      name: 'Request ID',
      selector: row => row.request_id,
      sortable: true,
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: row => row.start_date,
      sortable: true,
    },
    {
      name: 'End Date',
      selector: row => row.end_date,
      sortable: true,
    },
    {
      name: 'Is Half Day',
      selector: row => row.is_half_day,
      sortable: true,
      cell: row => (row.is_half_day ? 'Yes' : 'No')
    },
    {
      name: 'Total days',
      selector: row => row.total_days,
      sortable: true,
    },
    {
      name: 'Job Taken Over By',
      selector: row => row.job_taken_over_by,
      sortable: true,
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
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Leave Request</h3>
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
