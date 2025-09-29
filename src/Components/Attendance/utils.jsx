import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

// Dashboard APIs
export const getStaffDashboard = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/staff-dashboard/${staffId}/`);
  return response.data;
};

export const getAdminDashboard = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/admin-dashboard/${staffId}/`);
  return response.data;
};

// Clock APIs
export const clockIn = async (data) => {
  const response = await axios.post(`${BASE_URL}/clock-in/`, data);
  return response.data;
};

export const clockOut = async (data) => {
  const response = await axios.post(`${BASE_URL}/clock-out/`, data);
  return response.data;
};

export const getClockLogs = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/staff-clock-logs/${staffId}/`);
  return response.data;
};

export const generateClockLogReport = async (staffId, startDate, endDate) => {
  const response = await axios.post(`${BASE_URL}/clocklog-report/${staffId}/`, {
    startDate,
    endDate,
  });
  return response.data;
};

// User and Role APIs
export const getRoleList = async () => {
  const response = await axios.get(`${BASE_URL}/role-list/`);
  return response.data;
};

export const createNewUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/create-new-user/`, userData);
  return response.data;
};

export const updateProfile = async (staffId, updatedData) => {
  const response = await axios.post(`${BASE_URL}/update-profile/${staffId}/`, updatedData);
  return response.data;
};

export const resetPassword = async (staffId, oldPassword, newPassword) => {
  const response = await axios.post(`${BASE_URL}/update-password/${staffId}/`, {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

// Location APIs
export const getLocationList = () => {
  return axios.get(`${BASE_URL}/location-list/`);
};


export const getStaffLocations = async () => {
  const response = await axios.get(`${BASE_URL}/staff-location/`);
  return response.data;
};

export const updateStaffLocations = async (staffId, locationIds) => {
  console.log('updateStaffLocations called with:', { staffId, locationIds });
  const response = await axios.post(`${BASE_URL}/update-staff-locations/${staffId}/`, {
    locationIds,
  });
  console.log('updateStaffLocations response:', response.data);
  return response.data;
};

// Staff Update
export const updateStaff = async (staffId, data) => {
  const response = await axios.post(`${BASE_URL}/update-staff/${staffId}/`, data);
  return response.data;
};

// Leave APIs
export const getAdminLeaveDashboard = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/admin-leave-dashboard/${staffId}/`);
  return response.data;
};

export const getStaffLeaveDashboard = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/staff-leave-dashboard/${staffId}/`);
  return response.data;
};

export const applyLeave = async (formData) => {
  const response = await axios.post(`http://127.0.0.1:8000/api/apply-leave/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getLeaveHistory = async (staffId) => {
  const response = await axios.get(`http://127.0.0.1:8000/api/leave-history/${staffId}/`);
  return response.data;
};

export const updateLeaveApplication = async (leaveId, data) => {
  const response = await axios.post(`http://127.0.0.1:8000/api/leave-application/${leaveId}/update/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteLeaveApplication = async (leaveId) => {
  const response = await axios.delete(`http://127.0.0.1:8000/api/leave-application/${leaveId}/delete/`);
  return response.data;
};
