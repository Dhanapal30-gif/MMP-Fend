import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import Avatar from "@mui/material/Avatar";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagee from "../assets/Nokia_9-removebg-preview.png";
import './HeaderComponents.css'

const HeaderComponents = () => {
    const [empName, setEmpName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionName = sessionStorage.getItem("userName") || "";
    const role = sessionStorage.getItem("userRole") || "";
    const loginStatus = sessionStorage.getItem("isLoggedIn") === "true";

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

  const [servicesDropdown, setServicesDropdown] = useState(false);
  return (
<header className="header">
      <div className="logo-section">
        <img src={Imagee} alt="Logo" className="logo" />
        <span className="logo-text">Mat Man Pro</span>
      </div>

      <nav className="navgation {
">
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>

          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Settings <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>
                  userList
                  </Link>
                </li>
                <li>
                  <Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>
                  ScreenAccess
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>
                    AcountActivation
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Masters <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/product" className="dropdown-item" onClick={closeServicesDropdown}>
                  Product family master
                  </Link>
                </li>
                <li>
                  <Link to="/rcMainStore" className="dropdown-item" onClick={closeServicesDropdown}>
                  RC main store
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item">
                    Approver master
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item">
                    Technologies
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item">
                    CurancyMaster
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item">
                    DHL master
                  </Link>
                </li>
                
              </ul>
            )}
          </li>
          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Local PTL Store <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>
                  userList
                  </Link>
                </li>
                <li>
                  <Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>
                  ScreenAccess
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>
                    AcountActivation
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Rc Main Store <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>
                  userList
                  </Link>
                </li>
                <li>
                  <Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>
                  ScreenAccess
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>
                    AcountActivation
                  </Link>
                </li>
                
              </ul>
            )}
          </li>
          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Dashboard <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>
                  userList
                  </Link>
                </li>
                <li>
                  <Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>
                  ScreenAccess
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>
                    AcountActivation
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="dropdown-container" 
          onMouseEnter={toggleServicesDropdown}
          onMouseLeave={closeServicesDropdown}
          >
            <span className="nav-link">
              Report <FaChevronDown className="dropdown-icon" />
            </span>
            {servicesDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>
                  userList
                  </Link>
                </li>
                <li>
                  <Link to="/ProjectDashBoard" className="dropdown-item" onClick={closeServicesDropdown}>
                  ScreenAccess
                  </Link>
                </li>
                <li>
                  <Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>
                    AcountActivation
                  </Link>
                </li>
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
              sx={{ width: 40, height: 40, bgcolor: "#1976D2",cursor: "pointer" }}
              onClick={handleSignOut} // Clicking the Avatar logs out
            />
            
            <span className="emp-name" style={{color:'white'}}>{empName}</span>
          </div>
        ) : (
          <Link to="/" className="signup-btn">LogOut</Link>
        )}
      </div>
    </header>
  );    
}

export default HeaderComponents