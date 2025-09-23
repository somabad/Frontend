import React, { useEffect, useState } from 'react';
import { getStaffDashboard } from '../../utils';
import { useNavigate } from 'react-router-dom';

import ModalProfile from './modalProfile';
import ModalResetPassword from './ModalResetPassword';
import { FaEdit } from 'react-icons/fa';
import Loader from '../../Loader'; // Loader component

const ProfilePage = () => {
  const staffId = sessionStorage.getItem('staffId');
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loader state
  const [initialLoad, setInitialLoad] = useState(true); // Prevents loader on updates
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (initialLoad) {
        setLoading(true); // Show loader only on first load
      }

      try {
        const data = await getStaffDashboard(staffId);
        setUser(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        if (initialLoad) {
          setTimeout(() => {
            setLoading(false);
            setInitialLoad(false); // After first load, never show loader again
          }, 3000); // Optional delay to keep loader visible briefly
        }
      }
    };

    fetchUser();
  }, [staffId, initialLoad]);

if (loading) return <Loader />;
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleResetClickFromProfile = () => {
    setShowProfileModal(false);
    setTimeout(() => setShowResetModal(true), 300);
  };

  const handleProfileUpdated = (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-stretch"
      style={{ paddingTop: '1.5rem', paddingBottom: '3rem', minHeight: 'auto' }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: '3000px',
        }}
      >
        <div className="text-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={`${user.name}'s profile`}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #007bff',
              }}
              className="mx-auto"
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#ddd',
                display: 'inline-block',
                lineHeight: '120px',
                fontSize: '48px',
                color: '#888',
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}

          <div className="d-flex justify-content-center align-items-center mt-3">
            <h3 className="mb-0 me-2" style={{ color: '#555555' }}>{user.name}</h3>
            <FaEdit
              style={{ cursor: 'pointer', color: '#007bff' }}
              size={18}
              onClick={() => setShowProfileModal(true)}
              title="Edit Profile"
            />
          </div>

          <div className="text-muted" style={{ color: '#555555' }}>{user.email}</div>
          <div className="text-muted" style={{ color: '#555555' }}>{user.phone}</div>

          <div className="text-secondary" style={{ fontSize: '0.9rem', color: '#555555' }}>
            {user.roleName || 'Role not assigned'}
          </div>
        </div>

        <hr />

        <div className="row mt-4">
          <div className="col-md-12">
            <h5 style={{ color: '#555555' }}>Total Assigned Locations</h5>
            <p style={{ color: '#555555' }}>{user.totalLocationsAssigned}</p>
          </div>
        </div>

        <hr />

        <div className="row mt-4">
          <div className="col-md-6">
            <h5 style={{ color: '#555555' }}>Total Late Hours (Week)</h5>
            <p style={{ color: '#555555' }}>
              {user.totalLateHoursThisWeek != null ? user.totalLateHoursThisWeek : '0'}
            </p>
          </div>

          <div className="col-md-6">
            <h5 style={{ color: '#555555' }}>Total Working Hours (Week)</h5>
            <p style={{ color: '#555555' }}>
              {user.totalWorkHoursThisWeek != null ? user.totalWorkHoursThisWeek : '0'}
            </p>
          </div>
        </div>

        <hr />

        <div className="mt-3">
          <h5 style={{ color: '#555555' }}>Assigned Locations</h5>
          {user.assignedLocations && user.assignedLocations.length > 0 ? (
            <ul>
              {user.assignedLocations.map((location) => (
                <li key={location.locationId} style={{ color: '#555555' }}>
                  {location.name} - {location.address} ({location.type})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted" style={{ color: '#555555' }}>
              Not assigned location yet.
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalProfile
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onResetPassword={handleResetClickFromProfile}
        onProfileUpdated={handleProfileUpdated}
      />

      <ModalResetPassword
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
