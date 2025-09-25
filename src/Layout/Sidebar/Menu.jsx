export const getMenuItems = () => {
  const userType = sessionStorage.getItem("userType");

  const adminMenu = [
    {menutitle: "Admin Attendance",
    menucontent: "Dashboard,Manage Staff,Manage Location",
    active: true,
    Items: [
      { path: `/admin-attendance/dashboard/`, icon: "home", title: "Dashboard", type: "link", active: true },
      { path: `/admin-attendance/manage-staff/`, icon: "user", title: "Manage Staff", type: "link", active: true },
      { path: `/admin-attendance/manage-location/`, icon: "maps", title: "Manage Location", type: "link", active: true },
    ]},
    {menutitle: "Admin Leave",
    menucontent: "Leave Dashboard, Manage Staff Leave, Leave History",
    active: true,
    Items: [
      { path: `/admin-leave/leave-dashboard/` , icon: "home", title: "Leave Dashboard", type: "link", active: true},
      { path: `/admin-leave/manage-leave-request/` , icon: "user", title: "Manage Leave Reques", type: "link", active:true},
      { path: `/admin-leave/leave-history/` , icon: "file", title: "Leave History", type: "link", active:true},
    ]}
  ]

  const staffMenu = [
    {menutitle: "Staff Attendance",
    menucontent: "Dashboard,All Records,Leave History,Manage Profile",
    active: true,
    Items: [
      { path: `/staff-attendance/dashboard/`, icon: "home", title: "Dashboard", type: "link", active: true },
      { path: `/staff-attendance/all-records/`, icon: "calendar", title: "All Records", type: "link", active: true },
      { path: `/staff-attendance/manage-profile/`, icon: "user", title: " Manage Profile", type: "link", active: true },
    ]},
    {menutitle: "Staff Leave",
    menucontent: "Leave Dashboard, Leave Request Form, Leave History",
    active: true,
    Items: [
      { path: `/staff-leave/leave-dashboard/`, icon: "home", title: "Leave Dashboard", type: "link", active: true },
      { path: `/staff-leave/leave-request-form/`, icon: "user", title: "Leave Request Form", type: "link", active: true },
      { path: `/staff-leave/leave-history/`, icon: "file", title: "Leave History", type: "link", active: true }
    ]},
  ]

  if (userType === "Admin") return adminMenu;
  if (userType === "Staff") return staffMenu;
};
