import React, { useState, useEffect, Fragment } from "react";
import { Card, CardHeader, Col, CardBody, Badge } from "reactstrap";
import ApplyLeaveModal from "../Leave_Request_Form/ApplyLeaveModal";
import ViewLeaveModal from "../Leave_Request_Form/ViewLeaveModal";
import EditLeaveModal from "../Leave_Request_Form/EditLeaveModal";
import DeleteConfirmationModal from "../../common/deleteUserModal";
import { getLeaveHistory, getLeaveBalance, deleteLeaveApplication, getScannedForm } from "../../../Attendance/utils";
import Swal from "sweetalert2";
import Loader from "../../../Attendance/Loader";
import UploadImageModal from "../../Admin_Leave/Manage_Leave_Request/UploadImageModal";
import ViewImageModal from "../../Admin_Leave/Manage_Leave_Request/ViewImageModal";

const LeaveRequest = () => {
  const staffId = sessionStorage.getItem("staffId");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [latestRequests, setLatestRequests] = useState([]);
  const [balanceByType, setBalanceByType] = useState({});
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const [editModal, setEditModal] = useState({ open: false, leave: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, leave: null });
  const [loading, setLoading] = useState(true);
  
  // Upload modal states
  const [uploadModal, setUploadModal] = useState({ 
    open: false, 
    leave: null,
    existingScannedForm: null 
  });
  const [imagePreview, setImagePreview] = useState({ open: false, imageUrl: null, loading: false });

  // Fetch pending requests (all, newest first) & balance
  const fetchData = async () => {
    try {
      setLoading(true);
      const latestData = await getLeaveHistory(staffId);
      const allRequests = latestData?.leaveHistory || latestData || [];
      const pendingOnly = Array.isArray(allRequests)
        ? allRequests
            .filter((r) => r.status === "Pending" && !r.is_deleted)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setLatestRequests(pendingOnly);

      const balanceData = await getLeaveBalance(staffId); // API returns leave balances
      setBalanceByType(balanceData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      // Add delay to show loader longer
      setTimeout(() => {
        setLoading(false);
      }, 2000); // 2 seconds delay
    }
  };

  useEffect(() => {
    if (staffId) fetchData();
  }, [staffId]);

  const handleLeaveSubmitted = () => {
    setShowApplyModal(false);
    fetchData(); // Refresh latest requests after applying leave
  };

  const handleDelete = async () => {
    if (!deleteModal.leave) return;

    const leaveId = deleteModal.leave.request_id;
    if (!leaveId) return Swal.fire({ icon: "error", title: "Error", text: "Cannot find leave ID." });

    try {
      await deleteLeaveApplication(leaveId);
      Swal.fire({ icon: "success", title: "Leave deleted successfully!" });
      setDeleteModal({ open: false, leave: null });
      fetchData(); // Refresh after deletion
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.response?.data?.error || "Something went wrong." });
    }
  };

  // Handle upload/reupload button click
  const handleUploadClick = async (leave) => {
    const requestId = leave?.request_id;
    
    if (!requestId) {
      Swal.fire('Error', 'No leave request selected', 'error');
      return;
    }

    // Check if there's an existing scanned form
    let existingScannedForm = null;
    
    if (leave.scanned_form) {
      try {
        setImagePreview({ open: false, imageUrl: null, loading: true });
        
        const result = await getScannedForm(requestId);
        let fileUrl = result.file_url || result.fileUrl || result.url || null;

        if (fileUrl) {
          // If fileUrl is already absolute leave it; otherwise prefix with base URL
          const isAbsolute = /^https?:\/\//i.test(fileUrl);
          const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

          if (!isAbsolute) {
            if (!fileUrl.startsWith('/')) fileUrl = `/${fileUrl}`;
            fileUrl = `${baseUrl}${fileUrl}`;
          }

          existingScannedForm = {
            id: requestId,
            preview: fileUrl,
            name: 'existing_scanned_form.jpg',
            uploadDate: leave.created_at || 'Previously uploaded'
          };
        }
      } catch (err) {
        console.error('Error fetching existing scanned form:', err);
        // Continue without existing form if there's an error
      } finally {
        setImagePreview({ open: false, imageUrl: null, loading: false });
      }
    }

    setUploadModal({ 
      open: true, 
      leave: leave,
      existingScannedForm: existingScannedForm 
    });
  };

  // Handle when image is deleted in upload modal
  const handleImageDeleted = (requestId) => {
    // Update the leave record to remove scanned_form
    setLatestRequests(prev => 
      prev.map(leave => 
        leave.request_id === requestId 
          ? { ...leave, scanned_form: false }
          : leave
      )
    );
  };

  // View scanned form (robust: uses getScannedForm util)
  const handleViewScannedForm = async (leave) => {
    const requestId = leave?.request_id || leave;
    if (!requestId) return;

    setImagePreview({ open: true, imageUrl: null, loading: true });

    try {
      // getScannedForm should return something like: { success: true, file_url: '/media/...' }
      const result = await getScannedForm(requestId);

      if (!result) throw new Error('Empty response from server');

      // possible fields: file_url or url — be flexible
      let fileUrl = result.file_url || result.fileUrl || result.url || null;

      // If backend returned a blob or direct data, handle fallback (rare)
      if (!fileUrl && result instanceof Blob) {
        const blobUrl = URL.createObjectURL(result);
        setImagePreview({ open: true, imageUrl: blobUrl, loading: false });
        return;
      }

      if (!fileUrl) {
        throw new Error(result.message || 'No scanned file url returned');
      }

      // If fileUrl is already absolute leave it; otherwise prefix with base URL
      const isAbsolute = /^https?:\/\//i.test(fileUrl);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

      if (!isAbsolute) {
        // ensure leading slash
        if (!fileUrl.startsWith('/')) fileUrl = `/${fileUrl}`;
        fileUrl = `${baseUrl}${fileUrl}`;
      }

      setImagePreview({ open: true, imageUrl: fileUrl, loading: false });
    } catch (err) {
      console.error('Error loading scanned form:', err);
      setImagePreview({ open: false, imageUrl: null, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to load scanned form'
      });
    }
  };

  // Ensure blob URLs are revoked when closing preview
  const closeImagePreview = () => {
    if (imagePreview.imageUrl && imagePreview.imageUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(imagePreview.imageUrl); } catch (e) { /* ignore */ }
    }
    setImagePreview({ open: false, imageUrl: null, loading: false });
  };

  if (loading) return <Loader />;

  return (
    <Fragment>
      <Col sm="12">
        <Card className="mb-4">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Leave Request</span>
            <button
              style={{
                backgroundColor: "#6f42c1",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                fontWeight: "500",
                cursor: "pointer"
              }}
              onClick={() => setShowApplyModal(true)}
            >
              Apply Leave
            </button>
          </CardHeader>
          <CardBody>
            {/* Pending Leave Requests */}
            {latestRequests.length > 0 ? (
              <div>
                <h5>Pending Requests</h5>
                {latestRequests.map((leave) => (
                  <Card key={leave.request_id} className="mb-2 p-2 shadow-sm">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ flex: "1", minWidth: "200px" }}>
                        <strong>{leave.leave_type}</strong> ({leave.start_date} to {leave.end_date}) - Status:{" "}
                        <span style={{ fontWeight: "bold", color: leave.status === "Approved" ? "green" : leave.status === "Rejected" ? "red" : "orange" }}>
                          {leave.status}
                        </span>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        gap: "8px", 
                        flexWrap: "wrap", 
                        alignItems: "center",
                        minWidth: "200px",
                        justifyContent: "flex-end"
                      }}>
                        <button
                          title="View"
                          onClick={() => setViewModal({ open: true, leave })}
                          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <i className="fa fa-eye" style={{ color: '#555' }} />
                        </button>
                        <button
                          title="Edit"
                          disabled={leave.status === "Approved"}
                          onClick={() => setEditModal({ open: true, leave })}
                          style={{ 
                            border: 'none', 
                            background: 'none', 
                            cursor: leave.status === "Approved" ? 'not-allowed' : 'pointer',
                            opacity: leave.status === "Approved" ? 0.5 : 1
                          }}
                        >
                          <i className="fa fa-pencil" style={{ color: leave.status === "Approved" ? '#ccc' : '#555' }} />
                        </button>
                        <button
                          title="Delete"
                          disabled={leave.status === "Approved"}
                          onClick={() => setDeleteModal({ open: true, leave })}
                          style={{ 
                            border: 'none', 
                            background: 'none', 
                            cursor: leave.status === "Approved" ? 'not-allowed' : 'pointer',
                            opacity: leave.status === "Approved" ? 0.5 : 1
                          }}
                        >
                          <i className="fa fa-trash" style={{ color: leave.status === "Approved" ? '#ccc' : '#d9534f' }} />
                        </button>
                        <button
                          title={leave.scanned_form ? 'Re-upload' : 'Upload'}
                          onClick={() => handleUploadClick(leave)}
                          style={{ 
                            border: 'none', 
                            background: '#007bff', 
                            color: 'white',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            minWidth: '60px'
                          }}
                        >
                          {leave.scanned_form ? 'Re-upload' : 'Upload'}
                        </button>
                        {leave.scanned_form && (
                          <button
                            title="View Form"
                            onClick={() => handleViewScannedForm(leave)}
                            style={{ 
                              border: 'none', 
                              background: '#28a745', 
                              color: 'white',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              minWidth: '60px'
                            }}
                          >
                            View Form
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No recent leave requests.</p>
            )}

            <hr/>
            
            {/* Leave Balance Summary */}
            {balanceByType && Object.keys(balanceByType).length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h5 style={{ marginBottom: "10px" }}>Remaining Leave by Type</h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                  {Object.entries(balanceByType).map(([type, data]) => {
                    const used = Number(data?.used ?? 0);
                    const remaining = Number(data?.remaining ?? 0);
                    const total = used + remaining;
                    const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
                    return (
                      <div key={type} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 600, color: "#444" }}>{type}</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <Badge color="primary" pill>Remaining {remaining}</Badge>
                            <Badge color="secondary" pill>Used {used}</Badge>
                          </div>
                        </div>
                        <div style={{ height: "8px", background: "#f0f2f5", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#4fc3f7" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Modals */}
      {showApplyModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <ApplyLeaveModal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} onSubmitted={handleLeaveSubmitted} />
        </>
      )}
      {viewModal.open && <ViewLeaveModal isOpen={viewModal.open} toggle={() => setViewModal({ open: false, leave: null })} leave={viewModal.leave} isAdmin={false} />}
      {editModal.open && <EditLeaveModal isOpen={editModal.open} toggle={() => setEditModal({ open: false, leave: null })} leave={editModal.leave} onSave={fetchData} />}
      {deleteModal.open && <DeleteConfirmationModal isOpen={deleteModal.open} toggle={() => setDeleteModal({ open: false, leave: null })} onConfirm={handleDelete} userName={`${deleteModal.leave?.leave_type} (${deleteModal.leave?.start_date} to ${deleteModal.leave?.end_date})`} />}
      
      {/* Upload & View Image Modals */}
      <UploadImageModal
        isOpen={uploadModal.open}
        leave={uploadModal.leave}
        existingScannedForm={uploadModal.existingScannedForm}
        onClose={() => setUploadModal({ open: false, leave: null, existingScannedForm: null })}
        fetchLeaveHistory={fetchData}
        onImageDeleted={handleImageDeleted}
      />

      <ViewImageModal
        isOpen={imagePreview.open}
        imageUrl={imagePreview.imageUrl}
        loading={imagePreview.loading}
        onClose={closeImagePreview}
      />
    </Fragment>
  );
};

export default LeaveRequest;
