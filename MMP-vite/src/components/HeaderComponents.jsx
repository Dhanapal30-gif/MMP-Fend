import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Importing hamburger menu icons
import Avatar from "@mui/material/Avatar";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagee from "../assets/Nokia_9-removebg-preview.png";
import './HeaderComponents.css';

const HeaderComponents = () => {
  const [empName, setEmpName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the mobile menu
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionName = sessionStorage.getItem("userName") || "";
    const role = sessionStorage.getItem("userRole") || "";
    const loginStatus = sessionStorage.getItem("isLoggedIn") === "true";
    console.log("empName",sessionName)

    setEmpName(sessionName);
    setUserRole(role);
    setIsLoggedIn(loginStatus);
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  const toggleServicesDropdown = () => {
    setServicesDropdown((prev) => !prev);
  };

  const closeServicesDropdown = () => {
    setServicesDropdown(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Toggle the mobile menu open/close
  };

  return (
    <header className="header">
      <div className="logo-section">
        <img src={Imagee} alt="Logo" className="logo" />
        <span className="logo-text">Mat Man Pro</span>
      </div>

      <div className="hamburger-menu" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />} {/* Show hamburger icon or close icon */}
      </div>

      <nav className={`navgation ${isMenuOpen ? "open" : ""}`}>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          
          {/* Settings Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Settings <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                <li><Link to="/child" className="dropdown-item" onClick={closeServicesDropdown}>child</Link></li>
                <li><Link to="/paranet" className="dropdown-item" onClick={closeServicesDropdown}>paranet</Link></li>
              </ul>
            )}
          </li>

          {/* Masters Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Masters <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/product" className="dropdown-item" onClick={closeServicesDropdown}>Product family master</Link></li>
                <li><Link to="/rcMainStore" className="dropdown-item" onClick={closeServicesDropdown}>RC main store</Link></li>
                <li><Link to="/veendorMaster" className="dropdown-item" onClick={closeServicesDropdown}>VendorMaster</Link></li>
                <li><Link to="/compatabilityMaster" className="dropdown-item" onClick={closeServicesDropdown}>compatabilityMaster</Link></li>
                <li><Link to="/bom" className="dropdown-item" onClick={closeServicesDropdown}>BOM</Link></li>
                <li><Link to="/flexDemo" className="dropdown-item" onClick={closeServicesDropdown}>FlexDemo</Link></li>
                <li><Link to="/headerComponent1" className="dropdown-item" onClick={closeServicesDropdown}>HeaderComponent1</Link></li>
                <li><Link to="/bomMaster" className="dropdown-item" onClick={closeServicesDropdown}>Bom Master</Link></li>

              </ul>
            )}
          </li>

          {/* Local PTL Store Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Local PTL Store <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                <li><Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>ScreenAccess</Link></li>
                <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li>
              </ul>
            )}
          </li>

          {/* Rc Main Store Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Rc Main Store <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                <li><Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>ScreenAccess</Link></li>
                <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li>
              </ul>
            )}
          </li>

          {/* Dashboard Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Dashboard <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                <li><Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>ScreenAccess</Link></li>
                <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li>
              </ul>
            )}
          </li>

          {/* Report Dropdown */}
          <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
            <span className="nav-link">
              Report <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                <li><Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>ScreenAccess</Link></li>
                <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="auth-buttons">
        {isLoggedIn ? (
          <div className="user-info">
            <Avatar
              className="avatar"
              sx={{ width: 40, height: 40, bgcolor: "#1976D2", cursor: "pointer" }}
              onClick={handleSignOut}
            />
            <span className="emp-name" style={{ color: 'white' }}>{empName}</span>
          </div>
        ) : (
          <Link to="/" className="signup-btn">{empName}</Link>
        )}
      </div>

    </header>
  );
}

export default HeaderComponents;
