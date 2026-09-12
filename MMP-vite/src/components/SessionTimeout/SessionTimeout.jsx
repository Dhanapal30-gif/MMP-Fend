// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const SessionTimeout = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     let timeout;

//     const logout = () => {
//       localStorage.clear();
//       // sessionStorage.clear();
//     //   alert("Session expired");
//       navigate("/");
//     };

//     const resetTimer = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(logout, 1 * 60 * 1000);
//     };

//     const events = ["click", "mousemove", "keydown", "scroll"];

//     events.forEach((event) => {
//       window.addEventListener(event, resetTimer);
//     });

//     resetTimer();

//     return () => {
//       clearTimeout(timeout);

//       events.forEach((event) => {
//         window.removeEventListener(event, resetTimer);
//       });
//     };
//   }, [navigate]);

//   return null;
// };

// export default SessionTimeout;


import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // change this one line to change timeout duration

const SessionTimeout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const logout = () => {
      localStorage.clear();
      navigate("/");
    };

    const resetTimer = () => {
      clearTimeout(timerRef.current);
      // Store the exact time the session will expire — Header reads this to show countdown
      localStorage.setItem("sessionExpiry", (Date.now() + AUTO_LOGOUT_TIME).toString());
      timerRef.current = setTimeout(logout, AUTO_LOGOUT_TIME);
    };

    const events = ["click", "mousemove", "keydown", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  return null;
};

export default SessionTimeout;