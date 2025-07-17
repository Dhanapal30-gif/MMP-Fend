import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
const loginFlag = localStorage.getItem("isLoggedIn") === "true";
    console.log("PrivateRoute - isLoggedIn:", loginFlag);
    setIsLoggedIn(loginFlag);
    setChecked(true);
  }, []);

  if (!checked) return null; // Wait for check before rendering

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
