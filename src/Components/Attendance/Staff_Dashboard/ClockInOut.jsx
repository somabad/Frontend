import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { parse, isAfter } from 'date-fns';

import { Card, CardBody, Col, Media, Row } from 'reactstrap';
import { H1, H2, H3, H4, H6, P } from '../../../AbstractElements';
import { clockIn, clockOut } from '../utils';
import { FaHandPaper } from "react-icons/fa";
import { FaCheckCircle } from 'react-icons/fa';  // import the thumbs-up icon




function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ClockPage = ({ staffData, onClockChange, onHandleClockIn }) => {
  const numericStaffId = Number(sessionStorage.getItem('staffId'));
  const [hoveredButton, setHoveredButton] = useState(null); // 'clockIn' or 'clockOut'
  const [nearestLocationId, setNearestLocationId] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);
  const [isInRange, setIsInRange] = useState(false);
  const [nearestLocationName, setNearestLocationName] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);


  const assignedLocations = staffData?.assignedLocations || [];
  const clockToday = staffData?.clockLogToday || [];


  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  // Update clockIn/out state when staffData changes
  useEffect(() => {
    if (clockToday.length > 0) {
      const log = clockToday[0];
      setClockedIn(!!log.clock_in);
      setClockedOut(!!log.clock_out);
    } else {
      setClockedIn(false);
      setClockedOut(false);
    }
  }, [clockToday]);

  // Track user geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      Swal.fire({ icon: 'error', title: 'Geolocation Not Supported' });
      setLoadingLocation(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.error('Location error:', err);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Check if user is within range of any assigned location

  useEffect(() => {
    if (userLocation.latitude && assignedLocations.length > 0) {
      let nearestLocation = null;
      let minDistance = Infinity;

      for (const loc of assignedLocations) {
        const distance = getDistanceFromLatLonInMeters(
          userLocation.latitude,
          userLocation.longitude,
          loc.latitude,
          loc.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestLocation = loc;
        }
      }

      if (nearestLocation && minDistance <= nearestLocation.radius) {
        setIsInRange(true);
        setNearestLocationName(nearestLocation.name);
        setNearestLocationId(nearestLocation.locationId);
      } else {
        setIsInRange(false);
        setNearestLocationName('');
        setNearestLocationId(null);
      }

      if (nearestLocation) {
        console.log('Nearest Location:', nearestLocation.name);
        console.log('Distance:', minDistance);
        console.log('Radius:', nearestLocation.radius);
      }
    } else {
      setIsInRange(false);
      setNearestLocationName('');
      setNearestLocationId(null);
    }
  }, [userLocation, assignedLocations]);


  const handleClockIn = async () => {
    if (assignedLocations.length === 0) {
      return Swal.fire({ icon: 'error', title: 'No assigned locations!' });
    }

    if (!isInRange) {
      return Swal.fire({
        icon: 'error',
        title: 'Out of range',
        text: 'You are not within range of the assigned location.',
      });
    }

    if (clockedIn) {
      return Swal.fire({
        icon: 'warning',
        title: 'Already clocked in',
        text: 'You have already clocked in today.',
      });
    }

    const nearestLoc = assignedLocations.find(
      loc => loc.locationId === nearestLocationId
    );

    const now = new Date();
    let isLate = false;

    if (nearestLoc) {
      const [startHour, startMinute] = nearestLoc.start_hour.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(startHour, startMinute, 0, 0);

      if (now > startTime) {
        isLate = true;
      }
    }

    const data = {
      staffId: numericStaffId,
      locationId: nearestLocationId,
      clock_in_lat: userLocation.latitude,
      clock_in_lon: userLocation.longitude,
      devices_info: navigator.userAgent,
      notes: isLate ? '' : 'On Time', // <-- 👈 add "On Time" if not late
    };

    // Send the data to Dashboard to handle clock-in
    onHandleClockIn(data, isLate);
  };



  const handleClockOut = async () => {
    if (assignedLocations.length === 0) {
      return Swal.fire({ icon: 'error', title: 'No assigned locations!' });
    }
    if (!isInRange) {
      return Swal.fire({
        icon: 'error',
        title: 'Out of range',
        text: 'You are not within range of the assigned location.',
      });
    }
    if (!clockedIn) {
      return Swal.fire({
        icon: 'warning',
        title: 'Cannot clock out',
        text: 'You must clock in before clocking out.',
      });
    }
    if (clockedOut) {
      return Swal.fire({
        icon: 'warning',
        title: 'Already clocked out',
        text: 'You have already clocked out today.',
      });
    }

    const data = {
      staffId: numericStaffId,
      locationId: nearestLocationId,  // use nearestLocationId here
      clock_out_lat: userLocation.latitude,
      clock_out_lon: userLocation.longitude,
    };

    try {
      await clockOut(data);
      setClockedOut(true);
      Swal.fire({ icon: 'success', title: 'Clock-out successful!', timer: 2000, showConfirmButton: false });
      onClockChange?.();
    } catch (err) {
      console.error('Clock-out error:', err);
      Swal.fire({ icon: 'error', title: 'Clock-out failed', text: err.message || 'Please try again later.' });
    }
  };



  const buttonStyleBase = {
    marginTop: '25px',
    padding: '10px',
    width: '130px',
    height: '130px',
    borderRadius: '15%',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Icon circle style
  const iconCircleStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '10%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  };


  const clockInButtonStyle = {
    ...buttonStyleBase,
    background:
      hoveredButton === 'clockIn'
        ? 'linear-gradient(135deg, #f87171, #ef4444)' // lighter to medium red
        : 'linear-gradient(135deg, #ef4444, #dc2626)', // medium to deep red
    boxShadow:
      hoveredButton === 'clockIn'
        ? '0 6px 16px rgba(239, 68, 68, 0.6)'
        : '0 4px 12px rgba(239, 68, 68, 0.4)',
  };

  // Clock Out button styles with yellow theme
  const clockOutButtonStyle = {
    ...buttonStyleBase,
    background:
      hoveredButton === 'clockOut'
        ? 'linear-gradient(135deg, #facc15, #eab308)' // lighter to rich yellow
        : 'linear-gradient(135deg, #eab308, #ca8a04)', // rich to deeper yellow
    boxShadow:
      hoveredButton === 'clockOut'
        ? '0 6px 16px rgba(234, 179, 8, 0.6)'
        : '0 4px 12px rgba(234, 179, 8, 0.4)',
  };


  // Disabled button style (not used here but defined)
  const disabledButtonStyle = {
    ...buttonStyleBase,
    background: '#999',
    cursor: 'not-allowed',
    boxShadow: 'none',
  };


  return (
    <Col xs="12" sm="12" md="6" lg="6" xl="6" xxl="6" className="mb-2 mt-1">
      <Card className='profile-box clock-in-card pb-0' style={{ background: '#eaf1fb' }}>
        <CardBody style={{ height: '90%' }}>
          <div
            className="text-center"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {loadingLocation ? (
              <>
                <p
                  style={{
                    fontSize: '16px',
                    marginBottom: '1rem',
                    color: '#333',
                    fontWeight: '500',
                  }}
                >
                  Getting your location...
                </p>
                <div
                  style={{
                    border: '6px solid #f3f3f3',
                    borderTop: '6px solid #007bff',
                    borderRadius: '50%',
                    width: '170px',
                    height: '170px',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto',
                    marginBottom: '1rem'
                  }}
                />
                <style>
                  {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
                </style>
              </>
            ) : (
              <>
                {isInRange ? (
                  <>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '400',
                      color: '#555555',
                      marginBottom: 0,
                      paddingBottom: 0,
                    }}>
                      You're in range of:
                    </p>

                    <h4 style={{
                      fontSize: '2rem', color: '#555555', margin: 0, padding: 0, letterSpacing: '2px'
                    }}>
                      {nearestLocationName}
                    </h4>
                  </>
                ) : (
                  <h4 style={{ color: '#555555', margin: 0, padding: 0 }}>
                    Not in range of any assigned location
                  </h4>
                )}

                {!clockedIn && (
                  <button
                    style={clockInButtonStyle}
                    onClick={handleClockIn}
                    onMouseEnter={() => setHoveredButton('clockIn')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <div style={iconCircleStyle}>
                      <FaHandPaper size={32} />
                    </div>
                    Clock In
                  </button>
                )}

                {clockedIn && !clockedOut && (
                  <button
                    style={clockOutButtonStyle}
                    onClick={handleClockOut}
                    onMouseEnter={() => setHoveredButton('clockOut')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <div style={iconCircleStyle}>
                      <FaHandPaper size={32} />
                    </div>
                    Clock Out
                  </button>
                )}

                {clockedIn && clockedOut && (
                  <div
                    style={{
                      marginTop: '25px',
                      width: '130px',
                      height: '130px',
                      borderRadius: '15%',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      boxShadow: '0 6px 16px rgba(34, 197, 94, 0.6)',
                      color: '#fff',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'default',
                      userSelect: 'none',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      textAlign: 'center',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <FaCheckCircle size={48} style={{ marginBottom: '10px' }} />
                    Complete
                  </div>
                )}
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ClockPage;