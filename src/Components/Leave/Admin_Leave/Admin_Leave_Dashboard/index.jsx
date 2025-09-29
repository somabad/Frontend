import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import WidgetsWraper from "../Admin_Leave_Dashboard/WidgetsWraper";
import TodayLeave from "../Admin_Leave_Dashboard/TodayLeave";
import LatestLeave from "../Admin_Leave_Dashboard/LatestLeave";
import { getAdminLeaveDashboard } from "../../../Attendance/utils";
import Loader from "../../../Attendance/Loader"; // Adjust the path if needed
import { useNavigate } from "react-router-dom"; // Ensure correct import for useNavigate

const AdminLeaveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [onLeaveTodayNames, setOnLeaveTodayNames] = useState([]);
  const [latestRequests, setLatestRequests] = useState(null);

  const navigate = useNavigate();  // Correctly initialize navigate hook

  const staffId = sessionStorage.getItem("staffId");  // Fetch staffId from sessionStorage

  // Define the fetchData function outside the useEffect
  const fetchData = async () => {
    try {
      if (!staffId) throw new Error("No staff Id found in session");
      const data = await getAdminLeaveDashboard(staffId);
      console.log("API.Response:",data);
      setTotalPending(data.totalPending || 0);
      setTotalApproved(data.totalApproved || 0);
      setTotalRejected(data.totalRejected || 0);
      setTotalRequests(data.totalRequests || 0);
      setOnLeaveTodayNames(data.onLeaveTodayNames || []);
      setLatestRequests(data.latestRequests || []);

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
                  totalRejected = {totalRejected}
                  totalRequests = {totalRequests}
                />
              </Col>
            </Row>
            <Row>
              <TodayLeave onLeaveTodayNames={onLeaveTodayNames} loading={loading} error={error} />
              <LatestLeave staffLeave={latestRequests} loading={loading} error={error} />
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default AdminLeaveDashboard;
