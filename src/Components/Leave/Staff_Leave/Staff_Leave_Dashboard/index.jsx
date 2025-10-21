import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
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
  const [balanceByType, setBalanceByType] = useState(null);
  const [latestRequests, setLatestRequests] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const navigate = useNavigate();  // Correctly initialize navigate hook

  const staffId = sessionStorage.getItem("staffId");  // Fetch staffId from sessionStorage

  // Define the fetchData function outside the useEffect
  const fetchData = async () => {
    try {
      if (!staffId) throw new Error("No staff Id found in session");
      const data = await getStaffLeaveDashboard(staffId);
      console.log("API.Response:",data);
      setCarryForwardDays(data.carry_forward_days || 0);
      setEntitledDays(data.leave_entitled || 0);
      setTotalEntitlement(data.total_entitlement || 0);
      setUsedDays(data.used_days || 0);
      setBalanceThisYear(data.current_balance || 0);
      setTotalBalance(data.total_balance || 0);
      setBalanceByType(data.balance_by_type || {});
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

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (staffId) {
      const interval = setInterval(() => {
        console.log("Auto-refreshing staff dashboard data...");
        fetchData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [staffId]);

  // Show reminder notification on every page load
  useEffect(() => {
    setShowReminderModal(true);
  }, []);

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div fluid={true} style={{ paddingTop: "30px" }}>
          <Container fluid={true}>
            <Row className="mb-3">
              <Col xl="12">
                <div className="d-flex justify-content-between align-items-center">
                  <h4>Leave Dashboard</h4>

              </div>
              </Col>
            </Row>
            <Row className="widget-grid">
              <Col xl="12">
                <WidgetsWraper
                  carryFowardDays = {carryForwardDays}
                  entitledDays = {entitledDays}
                  totalEntitlement = {totalEntitlement}
                  usedDays = {usedDays}
                  balanceThisYear = {balanceThisYear}
                  balanceByType= {balanceByType}
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

      {/* Carry Forward Days Reminder Modal */}
      <Modal isOpen={showReminderModal} toggle={() => setShowReminderModal(false)} centered>
        <ModalHeader toggle={() => setShowReminderModal(false)}>
          <i className="fa fa-exclamation-circle" style={{ marginRight: '8px', color: '#ff9800', fontSize: '20px' }}></i>
          Important Reminder
        </ModalHeader>
        <ModalBody>
          <div style={{ padding: '10px' }}>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
              <strong>Carry Forward Days Policy:</strong>
            </p>
            <ul style={{ lineHeight: '1.8', fontSize: '15px' }}>
              <li>You have <strong>{carryForwardDays || 0} carry forward days</strong> from the previous year.</li>
              <li>All carry forward days must be <strong>utilized within 4 months</strong> from the start of the calendar year.</li>
              <li>Any unused carry forward days after the 4-month period will be <strong>forfeited</strong>.</li>
              <li>Please plan your leave accordingly to ensure you use your carry forward days before they expire.</li>
            </ul>
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              backgroundColor: '#fff3e0', 
              borderLeft: '4px solid #ff9800',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#e65100' }}>
                <i className="fa fa-calendar-check-o" style={{ marginRight: '6px' }}></i>
                <strong>Tip:</strong> Submit your leave requests early to make full use of your carry forward days.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={() => setShowReminderModal(false)}>
            I Understand
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default StaffLeaveDashboard;
