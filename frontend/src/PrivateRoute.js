// PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const user = null
  return user ?  <Outlet/> : <Navigate to="/prijava"/>
}


export default PrivateRoute;
