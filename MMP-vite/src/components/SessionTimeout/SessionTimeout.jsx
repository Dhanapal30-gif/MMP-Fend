import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;

    const logout = () => {
      localStorage.clear();
      // sessionStorage.clear();
    //   alert("Session expired");
      navigate("/");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 30 * 60 * 1000);
    };

    const events = ["click", "mousemove", "keydown", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeout);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return null;
};

export default SessionTimeout;