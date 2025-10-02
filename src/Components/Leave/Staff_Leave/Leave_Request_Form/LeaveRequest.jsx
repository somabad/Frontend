import React, { useState, Fragment } from "react";
import ApplyLeaveModal from "../Leave_Request_Form/ApplyLeaveModal";
import { Card, CardHeader, Col } from "reactstrap";

const LeaveRequest = () => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => setShowModal(false);
  const handleModalOpen = () => setShowModal(true);

  const handleLeaveSubmitted = () => {
    // You can refresh data here if needed
    setShowModal(false);
  };

  return (
    <Fragment>
      <style>{`
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
      `}</style>

      <div
        style={{
          padding: "20px",
          fontFamily: "Arial",
          width: "100%",
          maxWidth: "100%",
          color: "#555555",
        }}
      >
        <Col sm="12">
          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                    color: "#555555",
                    fontWeight: "bold",
                  }}
                >
                  Leave Request
                </span>
                <button className="btn-purple-effect" onClick={handleModalOpen}>
                  Apply Leave
                </button>
              </div>
            </CardHeader>
          </Card>
        </Col>
      </div>

      {showModal && (
        <ApplyLeaveModal
          onClose={handleModalClose}
          onSubmitted={handleLeaveSubmitted}
        />
      )}
    </Fragment>
  );
};

export default LeaveRequest;
