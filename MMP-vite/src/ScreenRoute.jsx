import React from "react";
import { Navigate } from "react-router-dom";

const ScreenRoute = ({ screenName, children }) => {
  const screens = JSON.parse(sessionStorage.getItem("allowedScreens") || "[]");
  return screens.includes(screenName) ? children : <Navigate to="/home" />;
};

export default ScreenRoute;


