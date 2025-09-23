
import UserLogins from '../Auth/UserSignIn';
import AdminLogins from '../Auth/AdminSignIn';  //add new


export const authRoutes = [
  { path: `/login`, Component: <UserLogins /> },
  { path: `/admin-login`, Component: <AdminLogins /> },   //Add new


];
