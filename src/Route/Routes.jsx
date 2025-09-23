
//Admin
import UserTable from "../Components/Attendance/Admin_Dashboard/UserTable";
import LocationTable from "../Components/Attendance/Admin_Dashboard/LocationTable";
import AdminDashboard from "../Components/Attendance/Admin_Dashboard";

//Staff
import Attendance from "../Components/Attendance/Staff_Dashboard";
import ClockLogPage from "../Components/Attendance/Staff_Dashboard/ClockLog/clocklog"
import ProfilePage from "../Components/Attendance/Staff_Dashboard/Profile/userprofile"
import { LeaveHistory } from "../Components/Attendance/Staff_Dashboard/ApplyLeave";




export const routes = [

  //admin
  { path: `/admin-attendance/manage-staff/`, Component: <UserTable /> },
  { path: `/admin-attendance/manage-location/`, Component: <LocationTable /> },
  { path: `/admin-attendance/dashboard/`, Component: <AdminDashboard /> },

  //staff
  { path: `/staff-attendance/dashboard/`, Component: <Attendance /> },
  { path: `/staff-attendance/all-records/`, Component: <ClockLogPage /> },
  { path: `/staff-attendance/manage-profile/`, Component: <ProfilePage /> },
  { path: `/staff-attendance/leave-history/`, Component: <LeaveHistory /> },






];




