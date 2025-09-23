import React, { useState, useEffect, Fragment } from 'react';
import { getLeaveHistory } from '../../utils';
import ApplyLeaveModal from './ApplyLeaveModal';
import DataTable from 'react-data-table-component';
import { Card, CardHeader, Col } from 'reactstrap';
import Swal from 'sweetalert2';
import DeleteConfirmationModal from '../../common/deleteUserModal';
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Row } from 'reactstrap';
import ViewLeaveModal from './ViewLeaveModal';
import EditLeaveModal from './EditLeaveModal';
import { updateLeaveApplication, deleteLeaveApplication } from '../../utils';

const statusMap = {
  P: { label: 'Pending', color: '#ffc107' },
  A: { label: 'Approved', color: '#28a745' },
  R: { label: 'Rejected', color: '#dc3545' },
};

const BACKEND_URL = 'http://127.0.0.1:8000';

// Helper to check if a file is an image
const isImage = (filename) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename || '');
};

const LeaveHistory = () => {
  const [showModal, setShowModal] = useState(false);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const staffId = 5;
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const [editModal, setEditModal] = useState({ open: false, leave: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, leave: null });

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      const data = await getLeaveHistory(staffId);
      setLeaveApplications(data || []);
    } catch (err) {
      setLeaveApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffId) fetchLeaveHistory();
  }, [staffId]);

  const handleModalClose = () => setShowModal(false);
  const handleModalOpen = () => setShowModal(true);

  const handleLeaveSubmitted = () => {
    fetchLeaveHistory();
    setShowModal(false);
  };

  const getDocumentUrl = (doc) => {
    if (!doc) return null;
    if (doc.startsWith('http')) return doc;
    return `${BACKEND_URL}${doc}`;
  };

  // DataTable columns
  const columns = [
    {
      name: 'Leave Type',
      selector: row => row.leave_type,
      sortable: true,
    },
    { name: 'Start Date', selector: row => row.start_date, sortable: true },
    { name: 'End Date', selector: row => row.end_date, sortable: true },
    {
      name: 'Status',
      cell: row => (
        <span style={{
          display: 'inline-block',
          color: statusMap[row.status]?.color || '#555',
          background: row.status === 'A' ? '#e6f4ea' : row.status === 'R' ? '#fdeaea' : '#fffbe6',
          borderRadius: '999px',
          padding: '4px 16px',
          fontSize: '12px',
          textAlign: 'center',
        }}>
          {statusMap[row.status]?.label || row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Reason',
      selector: row => row.reason,
      sortable: true,
    },
    {
      name: 'Applied At',
      selector: row => row.applied_at ? new Date(row.applied_at).toISOString().slice(0, 10) : '',
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-xs"
            title="View"
            style={{ background: 'none', border: 'none' }}
            onClick={() => setViewModal({ open: true, leave: row })}
          >
            <i className="fa fa-eye action-icon" style={{ fontSize: '15px' }} />
          </button>
          <button
            className="btn btn-xs"
            title={row.status === 'A' ? 'Cannot edit approved leave' : 'Edit'}
            style={{ background: 'none', border: 'none' }}
            onClick={() => row.status !== 'A' && setEditModal({ open: true, leave: row })}
            disabled={row.status === 'A'}
          >
            <i className={`fa fa-pencil action-icon${row.status === 'A' ? ' disabled' : ''}`} style={{ fontSize: '15px' }} />
          </button>
          <button
            className="btn btn-xs"
            title={row.status === 'A' ? 'Cannot delete approved leave' : 'Delete'}
            style={{ background: 'none', border: 'none' }}
            onClick={() => row.status !== 'A' && setDeleteModal({ open: true, leave: row })}
            disabled={row.status === 'A'}
          >
            <i className={`fa fa-trash-o action-icon${row.status === 'A' ? ' disabled' : ''}`} style={{ fontSize: '15px' }} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      left: true,
    },
  ];

  // Filtered data for search
  const filteredData = leaveApplications.filter(
    row =>
      row.leave_type?.toLowerCase().includes(search.toLowerCase()) ||
      row.reason?.toLowerCase().includes(search.toLowerCase()) ||
      statusMap[row.status]?.label.toLowerCase().includes(search.toLowerCase())
  );

  // Delete handler
  const handleDelete = async () => {
    if (!deleteModal.leave) return;
    try {
      await deleteLeaveApplication(deleteModal.leave.id);
      Swal.fire({ icon: 'success', title: 'Leave deleted!' });
      setDeleteModal({ open: false, leave: null });
      fetchLeaveHistory();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err.response?.data?.error || 'Something went wrong.' });
    }
  };

  return (
    <Fragment>
      <style>{`
        .rdt_TableHead th {
          font-weight: bold !important;
        }
        .action-icon {
          color: #222 !important;
        }
        .action-icon.disabled {
          color: #bbb !important;
          cursor: not-allowed !important;
        }
        .input-styled {
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 13px;
          outline: none;
          transition: box-shadow 0.2s ease;
          color: #555555;
        }
        .input-styled:focus {
          box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.4);
        }
        .btn-purple-effect {
          position: relative;
          background-color: #6f42c1;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-weight: 500;
        }
        .btn-purple-effect:hover {
          background-color: #59309e;
        }
        .filter-container {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>
      <div
        style={{
          padding: '20px',
          fontFamily: 'Arial',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          color: '#555555',
        }}
      >
        <Col sm="12">
          <Card>
            <CardHeader>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.5rem', color: '#555555', fontWeight: 'bold' }}>Leave History</span>
                <div className="filter-container">
                  <button
                    className="btn-purple-effect"
                    onClick={handleModalOpen}
                  >
                    Apply Leave
                  </button>
                </div>
              </div>
            </CardHeader>
            <DataTable
              columns={columns}
              data={filteredData}
              progressPending={loading}
              pagination
              striped
              highlightOnHover
              responsive
            />
          </Card>
        </Col>
      </div>
      {showModal && (
        <ApplyLeaveModal onClose={handleModalClose} onSubmitted={handleLeaveSubmitted} />
      )}
      {viewModal.open && (
        <ViewLeaveModal isOpen={viewModal.open} toggle={() => setViewModal({ open: false, leave: null })} leave={viewModal.leave} />
      )}
      {editModal.open && (
        <EditLeaveModal
          isOpen={editModal.open}
          toggle={() => setEditModal({ open: false, leave: null })}
          leave={editModal.leave}
          onSave={fetchLeaveHistory}
          updateLeaveApplication={updateLeaveApplication}
          Swal={Swal}
        />
      )}
      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          toggle={() => setDeleteModal({ open: false, leave: null })}
          onConfirm={handleDelete}
          userName={deleteModal.leave?.leave_type + ' (' + deleteModal.leave?.start_date + ' to ' + deleteModal.leave?.end_date + ')'}
        />
      )}
    </Fragment>
  );
};

export default LeaveHistory; 