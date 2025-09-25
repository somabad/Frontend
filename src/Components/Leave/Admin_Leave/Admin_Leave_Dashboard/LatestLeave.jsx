import React from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';

const LatestLeave = ({ staffLeave, loading, error }) => {
  // Show only the 3 newest requests
  const latestLeaves = staffLeave
    ?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3) || [];

  const columns = [
    {
      name: 'Staff Name',
      selector: row => row.staffName,
      sortable: true,
    },
    {
      name: 'Leave Type',
      selector: row => row.leaveType,
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: row => row.startDate,
      sortable: true,
    },
    {
      name: 'End Date',
      selector: row => row.endDate,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.status,
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
      selector: row => row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '-',
    },
  ];

  if (loading) return <Col sm="12"><div>Loading...</div></Col>;
  if (error) return <Col sm="12"><div>{error}</div></Col>;

  return (
    <Col sm="12">
      <Card>
        <CardHeader>
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Staff Leave Requests</h3>
        </CardHeader>

        <DataTable
          columns={columns}
          data={latestLeaves}
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
