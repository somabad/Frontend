import axios from 'axios';

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://v21.mysutera.my/api"
    : "http://127.0.0.1:8000/api";


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

export const getStaffList = async () => {
  const response = await axios.get(`${BASE_URL}/staff-list/`);
  return response.data;
};

export const createNewUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/create-new-user/`, userData);
  return response.data;
};

//Leave Module - Contract Type List ###

export const getContractTypeList = async () => {
  const response = await axios.get(`${BASE_URL}/contract-type-list/`);
  return response.data;
};

// Get contract type leave entitlements
export const getContractTypeLeaveEntitlements = async (contractTypeId) => {
  const response = await axios.get(`${BASE_URL}/contract-type-leave-entitlements/${contractTypeId}/`);
  return response.data;
};

// Set carry forward days for staff
export const setStaffCarryForward = async (staffId, carryForwardData) => {
  const response = await axios.post(`${BASE_URL}/staff/${staffId}/set-carry-forward/`, carryForwardData);
  return response.data;
};

// Get staff leave balance
export const getStaffLeaveBalance = async (staffId, year = null) => {
  const url = year ? `${BASE_URL}/staff/${staffId}/leave-balance/?year=${year}` : `${BASE_URL}/staff/${staffId}/leave-balance/`;
  const response = await axios.get(url);
  return response.data;
};


//###

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

// Leave Type list
export const getLeaveTypeList = async () => {
  const response = await axios.get(`${BASE_URL}/leave-type-list/`);
  return response.data;
};

export const applyLeave = async (formData) => {
  const staffId = formData.get('staffId');
  const response = await axios.post(`http://127.0.0.1:8000/api/apply-leave-request/${staffId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update Leave Request Status (Admin)
export const updateLeaveStatus = async (requestId, data) => {
  const response = await axios.post(`${BASE_URL}/manage-leave-request/${requestId}/update-status/`, data);
  return response.data;
};


export const getStaffLatestRequests = async (staffId) => {
  // Backend does not expose /staff/{id}/latest-leave-requests; use staff-leave-dashboard and extract latestRequests
  const response = await axios.get(`${BASE_URL}/staff-leave-dashboard/${staffId}/`);
  return response.data?.latestRequests || [];
};

export const getLeaveBalance = async (staffId) => {
  // Backend balance is available via staff-leave-dashboard under balance_by_type
  const response = await axios.get(`${BASE_URL}/staff-leave-dashboard/${staffId}/`);
  return response.data?.balance_by_type || {};
};


// Staff Leave History
export const getLeaveHistory = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/staff-leave-history/${staffId}/`);
  return response.data;
};


// All pending requests (newest first) for a staff
export const getStaffPendingRequests = async (staffId) => {
  const history = await getLeaveHistory(staffId);
  const items = history?.leaveHistory || history || [];
  return Array.isArray(items)
    ? items
        .filter((r) => r.status === 'Pending')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];
};


export const updateLeaveApplication = async (leaveId, data) => {
  const response = await axios.post(`http://127.0.0.1:8000/api/leave-application/${leaveId}/update/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Upload Scanned Form
export const uploadScannedForm = async (requestId, file) => {
  const formData = new FormData();
  formData.append('scanned_form', file);
  formData.append('request_id', requestId);

  console.log('Uploading scanned form for request:', requestId); // Debug log
  
  const response = await axios.post(`${BASE_URL}/upload-scanned-form/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Get Scanned Form
export const getScannedForm = async (requestId) => {
  const response = await axios.get(`${BASE_URL}/get-scanned-form/${requestId}/`);
  return response.data;
};

export const deleteLeaveApplication = async (leaveId) => {
  const response = await axios.delete(`${BASE_URL}/leave-application/${leaveId}/delete/`);
  return response.data;
};

export const getManageLeaveRequest = async (statusFilter = null) => {
  const url = statusFilter 
    ? `${BASE_URL}/manage-leave-request/?status=${statusFilter}`
    : `${BASE_URL}/manage-leave-request/`;
  const response = await axios.get(url);
  return response.data;
};


export const getAdminLeaveHistory = async (staffId) => {
  const response = await axios.get(`${BASE_URL}/admin-leave-history/${staffId}/`);
  return response.data;
};


