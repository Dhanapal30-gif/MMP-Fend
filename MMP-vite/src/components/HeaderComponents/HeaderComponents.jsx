import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Importing hamburger menu icons
import Avatar from "@mui/material/Avatar";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagee from "../../assets/Nokia_9-removebg-preview.png";
import './HeaderComponents.css';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FaHome, FaCog, FaCubes, FaStore, FaWarehouse, FaChartPie, FaFileAlt } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { GiCube } from "react-icons/gi";
import { HiChartBar } from "react-icons/hi";

const HeaderComponents = () => {
  const [empName, setEmpName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the mobile menu
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // const sessionName = sessionStorage.getItem("userName") || "";
    const sessionName = sessionStorage.getItem("userName") || localStorage.getItem("userName") || "";
    const role = sessionStorage.getItem("userRole") || "";
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";

    setEmpName(sessionName);
    setUserRole(role);
    setIsLoggedIn(loginStatus);
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.clear();         
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
    <header >
      <div className="header7">
        <div class="header-logo-box"></div>
        <div className="logo-section">
          <img src={Imagee} alt="Logo" className="logo" />
          {/* <span className="logo-text">Mat Man Pro</span> */}
          {/* <div class="logo-text">
  <div class="logo-text">OrkaTrack • OrkaTrack • OrkaTrack •</div>
</div> */}
          <div class="scroll-box">
            <div class="scroll-text">Mat Man Pro</div>
          </div>

        </div>
        <div className="notification">
          <IconButton sx={{ color: 'white' }} >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </div>
        <div className="avatar-container">
          {isLoggedIn ? (
            <div className="avatar-wrapper">
              <Avatar
                className="avatar"
                sx={{ bgcolor: "#076935" }}
                onClick={handleSignOut}
              />
              <h5 className="avatar-name">{empName}</h5>
            </div>
          ) : (
            <Link to="/" className="signup-btn">{empName}</Link>
          )}
        </div>
      </div>
      <div className="header">
        <div className="hamburger-menu" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />} {/* Show hamburger icon or close icon */}
        </div>
        <nav className={`navgation ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li className="dropdown-container" >
              {/* <ul><Link to="/home">Home</Link></ul> */}
              <span className="nav-link">
                <AiFillHome className="nav-icon" /> Home
              </span>
            </li>
            {/* Settings Dropdown */}
            <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
              {/* <span className="nav-link">
                Settings <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <IoSettingsSharp className="nav-icon" /> Settings <FaChevronDown className="dropdown-icon" />
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
              {/* <span className="nav-link">
                Masters <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <GiCube className="nav-icon" /> Masters <FaChevronDown className="dropdown-icon" />
              </span>
              {servicesDropdown && (
                <ul className="dropdown-menu">
                  <li><Link to="/product" className="dropdown-item" onClick={closeServicesDropdown}>Product family master</Link></li>
                  <li><Link to="/bomMaster" className="dropdown-item" onClick={closeServicesDropdown}>Bom Master</Link></li>
                  <li><Link to="/rcMainStore" className="dropdown-item" onClick={closeServicesDropdown}>RC main store</Link></li>
                  <li><Link to="/veendorMaster" className="dropdown-item" onClick={closeServicesDropdown}>VendorMaster</Link></li>
                  <li><Link to="/curencyMaster" className="dropdown-item" onClick={closeServicesDropdown}>curencyMaster</Link></li>
                  <li><Link to="/compatabilityMaster" className="dropdown-item" onClick={closeServicesDropdown}>compatabilityMaster</Link></li>
                  <li><Link to="/approvalMaster" className="dropdown-item" onClick={closeServicesDropdown}>Approval Master</Link></li>
                </ul>
              )}
            </li>
            {/* Local PTL Store Dropdown */}
            <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
              {/* <span className="nav-link">
                Local PTL Store <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <FaStore className="nav-icon" /> Local PTL Store <FaChevronDown className="dropdown-icon" />
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
              {/* <span className="nav-link">
                Rc Main Store <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <FaWarehouse className="nav-icon" /> Rc Main Store <FaChevronDown className="dropdown-icon" />
              </span>
              {servicesDropdown && (
                <ul className="dropdown-menu">
                  <li><Link to="/add_Po_Detail" className="dropdown-item" onClick={closeServicesDropdown}>Add Po Detail</Link></li>
                  <li><Link to="/receving" className="dropdown-item" onClick={closeServicesDropdown}>Receving</Link></li>
                  <li><Link to="/grn" className="dropdown-item" onClick={closeServicesDropdown}>GRN</Link></li>
                  <li><Link to="/poStatus" className="dropdown-item" onClick={closeServicesDropdown}>PoStatus</Link></li>

                  {/* <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li> */}
                </ul>
              )}
            </li>

            {/* Dashboard Dropdown */}
            <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>
              {/* <span className="nav-link">
                Dashboard <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <FaChartPie className="nav-icon" /> Dashboard <FaChevronDown className="dropdown-icon" />
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
              {/* <span className="nav-link">
                Report <FaChevronDown className="dropdown-icon" />
              </span> */}
              <span className="nav-link">
                <FaFileAlt className="nav-icon" /> Report <FaChevronDown className="dropdown-icon" />
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
      </div>
    </header>
  );
}
export default HeaderComponents;
