import React, { useState } from 'react';
import { Col, Card, CardHeader} from 'reactstrap';
import DataTable from 'react-data-table-component'; //not same as HTML(not user-friendly))

const TodayLeave = ({ staffLeave, loading, error }) => {
  const columns = [
    {
      name: 'Staff ID',
      selector: row => row.staffID,
      sortable: true
    },
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
      name: 'Job Taken by',
      selector: row => row.jobTaken,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.status || '-',
      cell: row => {
        const color = row.status === 'Pending' ? 'text-danger' : 'text-success';
        return (
          <span className={color} style={{ fontWeight: 'bold' }}>
            {row.status}
          </span>
        );
      },
    },
    {
      name: 'SubmittedAt',
      selector: row =>
        row.submittedAt ? new Date(row.submittedAt).toLocaleString(): '-',
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
          data={staffLeave}
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
