// Component for deployment popup
import React, { useEffect, useState } from 'react';

const DeploymentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  // Listen to changes in localStorage
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "deploymentStatus" && event.newValue === "true") {
        setShowPopup(true);
      } else if (event.key === "deploymentStatus" && event.newValue === "false") {
        setShowPopup(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const startDeployment = () => {
    // Show popup on current page
    setShowPopup(true);
    // Notify other tabs
    localStorage.setItem("deploymentStatus", "true");

    // Automatically hide after few seconds (optional)
    setTimeout(() => {
      setShowPopup(false);
      localStorage.setItem("deploymentStatus", "false");
    }, 5000); // 5 seconds
  };

  return (
    <>
      <button onClick={startDeployment}>Start Deployment</button>

      {showPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 9999
        }}>
          Deployment in progress...
        </div>
      )}
    </>
  );
};

export default DeploymentPopup;
