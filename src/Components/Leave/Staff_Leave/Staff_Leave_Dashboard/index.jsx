import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row } from "reactstrap";
import {getStaffLeaveDashboard} from "../../../Attendance/utils"
import Loader from '../../../Attendance/Loader'; // Loader component

const StaffLeaveDashboard = () => {
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // For showing loader
  const [initialLoad, setInitialLoad] = useState(true); // Tracks only first load

  const navigate = useNavigate();
  const staffId = sessionStorage.getItem('staffId');

  useEffect(() => {
    if (!staffId) {
      navigate('/login');
    }
  }, [staffId, navigate]);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (initialLoad) {
        setLoading(true); // Only show loader on first mount
      }

      try {
        const data = await getStaffLeaveDashboard(staffId);
        setStaffData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching staff dashboard:', err);
        setError('Unable to fetch staff data');
      } finally {
        if (initialLoad) {
          setTimeout(() => {
            setLoading(false);       // Hide loader after 3s
            setInitialLoad(false);   // Prevent loader from showing again
          }, 3000);
        }
      }
    };

    if (staffId) {
      fetchStaffData();
    }
  }, [staffId, refreshLogs]);

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <Container>
        {loading ? (
          <Loader /> // Only shown on first page load
        ) : (
          <Row className="widget-grid">
            <DashboardCards staffData={staffData} />
            <TableClock refresh={refreshLogs} staffData={staffData} />
          </Row>
        )}
      </Container>
    </div>
  );
};

export default StaffLeaveDashboard;
