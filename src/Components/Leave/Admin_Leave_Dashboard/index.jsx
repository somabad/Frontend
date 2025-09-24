import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import GreetingCard from "./GreetingCard";
import WidgetWraper from "./WidgetsWraper";
import TodayClocklog from "./TodayClockLog";
import TodayStaffLate from "./TodayStaffLate";
import TodayNotClockIn from "./TodayNotClockIn";
import { getAdminDashboard } from "../utils";
import Loader from "../Loader"; // Adjust the path if needed
import { useNavigate } from "react-router-dom"; // Ensure correct import for useNavigate

const Dashboard = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clockLogs, setClockLogs] = useState([]);
  const [lateStaff, setLateStaff] = useState([]);
  const [notClockedInStaff, setNotClockedInStaff] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalLocation, setTotalLocation] = useState(0);
  const [totalClockInToday, setTotalClockInToday] = useState(0);
  const [totalLateToday, setTotalLateToday] = useState(0);

  const navigate = useNavigate();  // Correctly initialize navigate hook

  const staffId = sessionStorage.getItem("staffId");  // Fetch staffId from sessionStorage

  // Define the fetchData function outside the useEffect
  const fetchData = async () => {
    try {
      if (!staffId) throw new Error("No staffId found in session");
      const data = await getAdminDashboard(staffId);
      setAdminName(data.currentAdmin?.name || "Admin");
      setClockLogs(data.clockLogToday || []);
      setLateStaff(data.lateStaffToday || []);
      setTotalStaff(data.totalStaff || 0);
      setTotalLocation(data.totalLocations || 0);
      setTotalClockInToday(data.totalClockinToday || 0);
      setTotalLateToday(data.totalLateToday || 0);
      setNotClockedInStaff(data.notClockedIn || []);
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
                <WidgetWraper
                  totalStaff={totalStaff}
                  totalLocation={totalLocation}
                  totalClockInToday={totalClockInToday}
                  totalLateToday={totalLateToday}
                />
              </Col>
            </Row>
            <Row>
              <TodayStaffLate lateStaff={lateStaff} loading={loading} error={error} />
              <TodayNotClockIn notClockedInStaff={notClockedInStaff} loading={loading} error={error} />
              <TodayClocklog clockLogs={clockLogs} loading={loading} error={error} />
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default Dashboard;
