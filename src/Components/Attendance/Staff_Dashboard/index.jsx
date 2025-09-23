import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row } from "reactstrap";
import Swal from 'sweetalert2';

import GreetingCard from "./GreetingCard";
import ClockInOut from "./ClockInOut";
import { getStaffDashboard, clockIn } from '../utils';
import DashboardCards from "./Cards";
import TableClock from "./tableClock";
import DigitalClock from "./clock";
import LateModal from './LateModal';
import Loader from '../Loader'; // Loader component

const Dashboard = () => {
  const [refreshLogs, setRefreshLogs] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);
  const [pendingClockIn, setPendingClockIn] = useState(false);
  const [loading, setLoading] = useState(true); // For showing loader
  const [initialLoad, setInitialLoad] = useState(true); // Tracks only first load

  const navigate = useNavigate();
  const staffId = sessionStorage.getItem('staffId');

  useEffect(() => {
    if (!staffId) {
      navigate('/login');
    }
  }, [staffId, navigate]);

  const triggerRefresh = () => setRefreshLogs(prev => !prev);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (initialLoad) {
        setLoading(true); // Only show loader on first mount
      }

      try {
        const data = await getStaffDashboard(staffId);
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

  const handleClockIn = async (data, isLate) => {
    if (isLate) {
      setPendingClockIn(data);
      setShowLateModal(true);
    } else {
      await proceedClockIn(data);
    }
  };

  const handleLateReasonSubmit = async (reason) => {
    setLateReason(reason);
    setShowLateModal(false);

    if (pendingClockIn) {
      const dataWithNotes = {
        ...pendingClockIn,
        notes: reason
      };
      await proceedClockIn(dataWithNotes);
      setPendingClockIn(null);
    }
  };

  const proceedClockIn = async (data) => {
    try {
      await clockIn(data);
      Swal.fire({
        icon: 'success',
        title: 'Clock-in successful!',
        timer: 2000,
        showConfirmButton: false,
      });
      triggerRefresh(); // Refresh silently, without showing loader
    } catch (err) {
      console.error('Clock-in error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Clock-in failed',
        text: err.message || 'Please try again later.',
      });
    }
  };

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <Container>
        {loading ? (
          <Loader /> // Only shown on first page load
        ) : (
          <Row className="widget-grid">
            <GreetingCard staffData={staffData} error={error} />
            <DigitalClock />
            <ClockInOut
              staffData={staffData}
              onClockChange={triggerRefresh}
              onHandleClockIn={handleClockIn}
            />
            <LateModal
              show={showLateModal}
              onClose={() => setShowLateModal(false)}
              onSubmitReason={handleLateReasonSubmit}
            />
            <DashboardCards staffData={staffData} />
            <TableClock refresh={refreshLogs} staffData={staffData} />
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
