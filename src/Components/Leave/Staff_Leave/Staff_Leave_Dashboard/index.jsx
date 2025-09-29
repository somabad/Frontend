import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import WidgetsWraper from "../Staff_Leave_Dashboard/WidgetsWraper";
import LatestLeave from "../Staff_Leave_Dashboard/LatestLeave";
import { getStaffLeaveDashboard } from "../../../Attendance/utils"
import Loader from "../../../Attendance/Loader"; // Adjust the path if needed
import { useNavigate } from "react-router-dom"; // Ensure correct import for useNavigate

const StaffLeaveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carryForwardDays, setCarryForwardDays] = useState(null);
  const [entitledDays, setEntitledDays] = useState(null);
  const [totalEntitlement, setTotalEntitlement] = useState(null);
  const [usedDays,setUsedDays] = useState(null);
  const [balanceThisYear, setBalanceThisYear] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);
  const [latestRequests, setLatestRequests] = useState(null);

  const navigate = useNavigate();  // Correctly initialize navigate hook

  const staffId = sessionStorage.getItem("staffId");  // Fetch staffId from sessionStorage

  // Define the fetchData function outside the useEffect
  const fetchData = async () => {
    try {
      if (!staffId) throw new Error("No staff Id found in session");
      const data = await getStaffLeaveDashboard(staffId);
      console.log("API.Response:",data);
      setCarryForwardDays(data.carry_forward_days || 0);
      setEntitledDays(data.entitled_days || 0);
      setTotalEntitlement(data.total_entitlement || 0);
      setUsedDays(data.used_days || 0);
      setBalanceThisYear(data.balance_this_year || 0);
      setTotalBalance(data.total_balance || 0);
      setLatestRequests(data.latestRequests || []);

    } catch (err) {
      setError("Failed to load staff data");
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

    if (!staffId || userType !== 'Staff') {
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
                  carryFowardDays = {carryForwardDays}
                  entitledDays = {entitledDays}
                  totalEntitlement = {totalEntitlement}
                  usedDays = {usedDays}
                  balanceThisYear = {balanceThisYear}
                  totalBalance = {totalBalance}
                />
              </Col>
            </Row>
            <Row>
              <LatestLeave staffLeave={latestRequests} loading={loading} error={error} />
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default StaffLeaveDashboard;
