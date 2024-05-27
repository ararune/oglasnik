// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, isLoggedIn, ...rest }) => {
  return (
    <Route
      {...rest}
      element={isLoggedIn ? <Element /> : <Navigate to="/prijava" replace />}
    />
  );
};

export default PrivateRoute;
