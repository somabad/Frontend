import React from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';

const LatestLeave = ({ staffLeave, loading, error }) => {
  const latestRequests = Array.isArray(staffLeave)
    ? staffLeave.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)
    : [];

  const columns = [
    {
      name: 'Request ID',
      selector: row => row.request_id,
      sortable: true,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
          {row.request_id || '-'}
        </div>
      ),
    },
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
      width: '150px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80%' }}>
          {row.leave_type || '-'}
        </div>
      ),
    },
    {
      name: 'Start Date',
      selector: row => row.start_date,
      sortable: true,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80%' }}>
          {row.start_date || '-'}
        </div>
      ),
    },
    {
      name: 'End Date',
      selector: row => row.end_date,
      sortable: true,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {row.end_date || '-'}
        </div>
      ),
    },
    {
      name: 'Is Half Day',
      selector: row => row.is_half_day,
      sortable: true,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
          {row.is_half_day ? 'Yes' : 'No'}
        </div>
      ),
    },
    {
      name: 'Total Days',
      selector: row => row.total_days,
      sortable: true,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
          {row.total_days || '-'}
        </div>
      ),
    },
    {
      name: 'Job Taken By',
      selector: row => row.job_taken_over_by,
      sortable: true,
      width: '140px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80%' }}>
          {row.job_taken_over_by || '-'}
        </div>
      ),
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      sortable: true,
      width: '130px',
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
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70%', fontWeight: 'bold' }}
            className={getStatusColor(row.status)}
          >
            {row.status || '-'}
          </div>
        );
      },
    },
    {
      name: 'Submitted At',
      selector: row => row.created_at,
      width: '130px',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '85%' }}>
          {row.created_at || '-'}
        </div>
      ),
    },
  ];

  if (loading) return <Col sm="12"><div>Loading...</div></Col>;
  if (error) return <Col sm="12"><div>{error}</div></Col>;

  return (
    <Col sm="12">
      <Card>
        <CardHeader>
          <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Latest Leave Requests</h3>
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
