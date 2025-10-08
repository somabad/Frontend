import React, { useState, useEffect, Fragment } from "react";
import { Card, CardHeader, Col, CardBody, Badge } from "reactstrap";
import ApplyLeaveModal from "../Leave_Request_Form/ApplyLeaveModal";
import ViewLeaveModal from "../Leave_Request_Form/ViewLeaveModal";
import EditLeaveModal from "../Leave_Request_Form/EditLeaveModal";
import DeleteConfirmationModal from "../../common/deleteUserModal";
import { getLeaveHistory, getLeaveBalance, deleteLeaveApplication } from "../../../Attendance/utils";
import Swal from "sweetalert2";

const LeaveRequest = () => {
  const staffId = sessionStorage.getItem("staffId");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [latestRequests, setLatestRequests] = useState([]);
  const [balanceByType, setBalanceByType] = useState({});
  const [viewModal, setViewModal] = useState({ open: false, leave: null });
  const [editModal, setEditModal] = useState({ open: false, leave: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, leave: null });

  // Fetch pending requests (all, newest first) & balance
  const fetchData = async () => {
    try {
      const latestData = await getLeaveHistory(staffId);
      const allRequests = latestData?.leaveHistory || latestData || [];
      const pendingOnly = Array.isArray(allRequests)
        ? allRequests
            .filter((r) => r.status === "Pending")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setLatestRequests(pendingOnly);

      const balanceData = await getLeaveBalance(staffId); // API returns leave balances
      setBalanceByType(balanceData);
    } catch (err) {
      console.error("Error fetching data:", err);
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{leave.leave_type}</strong> ({leave.start_date} to {leave.end_date}) - Status:{" "}
                        <span style={{ fontWeight: "bold", color: leave.status === "Approved" ? "green" : leave.status === "Rejected" ? "red" : "orange" }}>
                          {leave.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setViewModal({ open: true, leave })}>View</button>
                        <button
                          disabled={leave.status === "Approved"}
                          onClick={() => setEditModal({ open: true, leave })}
                        >
                          Edit
                        </button>
                        <button
                          disabled={leave.status === "Approved"}
                          onClick={() => setDeleteModal({ open: true, leave })}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No recent leave requests.</p>
            )}

            
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
    </Fragment>
  );
};

export default LeaveRequest;
