import React, { useState } from 'react';
import { Col, Card, CardHeader } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const TodayLeave = ({ onLeaveTodayNames, loading, error }) => {
  const [hoveredInfoIndex, setHoveredInfoIndex] = useState(null);

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
    {
      name: 'Info',
      cell: (row, index) => (
        <AiOutlineInfoCircle
          size={16}
          color="#888"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHoveredInfoIndex(index)}
          onMouseLeave={() => setHoveredInfoIndex(null)}
        />
      ),
      width: '50px',
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

      {/* Fullscreen overlay on hover */}
      {hoveredInfoIndex !== null && (
        <div className="info-overlay">
          <div className="info-box">
            <p>{onLeaveTodayNames[hoveredInfoIndex]?.info || "No additional info available"}</p>
          </div>
        </div>
      )}

      {/* Info icon hover */}
      <style jsx>{`
        .info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none;
        }
        .info-box {
          background-color: #fff;
          padding: 24px 32px;
          border-radius: 12px;
          max-width: 90%;
          text-align: center;
          font-size: 18px;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .info-box p {
          margin: 0;
          font-size: 1.2rem;
        }
        .icon-wrapper {
          cursor: pointer;
        }
      `}</style>
    </Col>
  );
};

export default TodayLeave;
