import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import WidgetsWraper from "../Admin_Leave_Dashboard/WidgetsWraper";
import TodayLeave from "../Admin_Leave_Dashboard/TodayLeave";
import LatestLeave from "../Admin_Leave_Dashboard/LatestLeave";
import { getAdminLeaveDashboard } from "../../../Attendance/utils";
import Loader from "../../../Attendance/Loader"; // Adjust the path if needed
import { useNavigate } from "react-router-dom"; // Ensure correct import for useNavigate

const AdminLeaveDashboard = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalReject, setTotalReject] = useState(0);
  const [totalRequest, setTotalRequest] = useState(0);
  const [onLeaveTodayNames, setOnLeaveTodayNames] = useState([]);
  const [latestRequest, setLatestRequest] = useState([]);

  const navigate = useNavigate();  // Correctly initialize navigate hook

  const staffId = sessionStorage.getItem("staffId");  // Fetch staffId from sessionStorage

  // Define the fetchData function outside the useEffect
  const fetchData = async () => {
    try {
      if (!staffId) throw new Error("No staff Id found in session");
      const data = await getAdminLeaveDashboard(staffId);
      console.log("API.Response:",data);
      setAdminName(data.currentAdmin?.name || "Admin");
      setTotalPending(data.totalPending || 0);
      setTotalApproved(data.totalApproved || 0);
      setTotalReject(data.totalReject || 0);
      setTotalRequest(data.totalRequest || 0);
      setOnLeaveTodayNames(data.onLeaveTodayNames || []);
      setLatestRequest(data.latestRequest || []);

    } catch (err) {
      setError("Failed to load admin data");
      console.error(err);
    } finally {
      // Delay removal of loader slightly
      setTimeout(() => {
        setLoading(false);
      }, 3000); // 500ms extra delay
    }
  };

  // useEffect for checking sessionStorage and navigating
  useEffect(() => {
    // Check sessionStorage for staffId and userType
    const userType = sessionStorage.getItem('userType');

    if (!staffId || userType === 'Staff') {
      // Redirect to login if conditions are met using navigate
      navigate('/login');
    } else {
      fetchData();  // Call the fetchData function here
    }
  }, [staffId, navigate]);  // Add navigate to dependency array

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div fluid={true} style={{ paddingTop: "30px" }}>
          <Container fluid={true}>
            <Row className="widget-grid">
              <Col xl="12">
                <WidgetsWraper
                  totalPending = {totalPending}
                  totalApproved = {totalApproved}
                  totalReject = {totalReject}
                  totalRequest = {totalRequest}
                />
              </Col>
            </Row>
            <Row>
              <TodayLeave onLeaveTodayName={onLeaveTodayNames} loading={loading} error={error} />
              <LatestLeave latestRequest={latestRequest} loading={loading} error={error} />
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default AdminLeaveDashboard;
