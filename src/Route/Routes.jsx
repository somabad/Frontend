
//Admin
import UserTable from "../Components/Attendance/Admin_Dashboard/UserTable";
import LocationTable from "../Components/Attendance/Admin_Dashboard/LocationTable";
import AdminDashboard from "../Components/Attendance/Admin_Dashboard";
import AdminLeaveDashboard from "../Components/Leave/Admin_Leave/Admin_Leave_Dashboard";
import ManageLeaveRequest from "../Components/Leave/Admin_Leave/Manage_Leave_Request";
import AdminLeaveHistory from "../Components/Leave/Admin_Leave/Admin_Leave_History/Admin_Leave_History";


//Staff
import Attendance from "../Components/Attendance/Staff_Dashboard";
import ClockLogPage from "../Components/Attendance/Staff_Dashboard/ClockLog/clocklog";
import ProfilePage from "../Components/Attendance/Staff_Dashboard/Profile/userprofile";
import StaffLeaveDashboard from "../Components/Leave/Staff_Leave/Staff_Leave_Dashboard";
import LeaveRequestForm from "../Components/Leave/Staff_Leave/Leave_Request_Form/ApplyLeaveModal";
import LeaveHistory  from "../Components/Leave/Staff_Leave/Staff_Leave_History/Leave_History";



export const routes = [

  //admin
  { path: `/admin-attendance/manage-staff/`, Component: <UserTable /> },
  { path: `/admin-attendance/manage-location/`, Component: <LocationTable /> },
  { path: `/admin-attendance/dashboard/`, Component: <AdminDashboard /> },
  { path: `/admin-leave/leave-dashboard/`, Component: <AdminLeaveDashboard /> },
  { path: `/admin-leave/manage-leave-request/`, Component: <ManageLeaveRequest />},
  { path: `/admin-leave/leave-history/`, Component: <AdminLeaveHistory />},

  //staff
  { path: `/staff-attendance/dashboard/`, Component: <Attendance /> },
  { path: `/staff-attendance/all-records/`, Component: <ClockLogPage /> },
  { path: `/staff-attendance/manage-profile/`, Component: <ProfilePage /> },
  { path: `/staff-leave/leave-dashboard/` , Component: <StaffLeaveDashboard />},
  { path: `/staff-leave/leave-request-form/`, Component: <LeaveRequestForm />},
  { path: `/staff-leave/leave-history/`, Component: <LeaveHistory />}

];




