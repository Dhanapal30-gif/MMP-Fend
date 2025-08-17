import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Importing hamburger menu icons
import Avatar from "@mui/material/Avatar";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagee from "../../assets/Nokia_9-removebg-preview.png";
import './HeaderComponents.css';
import {
  Badge, IconButton, Menu, MenuItem, ListItemText, Box,
  ListItemSecondaryAction
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FaHome, FaCog, FaCubes, FaStore, FaWarehouse, FaChartPie, FaFileAlt } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { GiCube } from "react-icons/gi";
import { HiChartBar } from "react-icons/hi";
import CloseIcon from '@mui/icons-material/Close';

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
    const roleStr = sessionStorage.getItem("userRole") || "[]";
    const role = JSON.parse(roleStr); // now it's an array
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

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [notifications, setNotifications] = useState([
    "Have receving ticket RE0000789",
    "Have GRN ticket RE0000789",
    "Have Putaway ticket RE0000789",
    "Have Isuuance ticket RE0000789",
  ]);
  const handleRemove = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };


  const [screen, setScreen] = useState([]); // <-- add this

  useEffect(() => {
    const storedScreens = sessionStorage.getItem("allowedScreens");
    if (storedScreens) setScreen(JSON.parse(storedScreens));
  }, []);

  console.log("allowedScreens", sessionStorage.getItem("allowedScreens"))

  const isScreenAllowed = (screenName) => {
    const allowedScreens = JSON.parse(sessionStorage.getItem("allowedScreens") || "[]");
    return allowedScreens.includes(screenName);
  };

  console.log("userRole", userRole)


  return (
    <>
      <header className="header-container">
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
            <IconButton sx={{ color: 'white' }} onClick={handleClick}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {notifications.length === 0 ? (
                <MenuItem disabled>No new notifications</MenuItem>
              ) : (
                notifications.map((note, index) => (
                  <MenuItem key={index} disableRipple>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#e0d5d5ff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        width: '100%',
                        gap: 1
                      }}
                    >
                      <ListItemText primary={note} />
                      <IconButton size="small" onClick={() => handleRemove(index)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>
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
              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <IoSettingsSharp className="nav-icon" /> Settings <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li>
                   {(userRole.includes("Admin") ||isScreenAllowed("userDetail")) && <li><Link to="/userDetail" className="dropdown-item" onClick={closeServicesDropdown}>User Detail</Link></li>}
                   {(userRole.includes("Admin") ||isScreenAllowed("Role")) && <li><Link to="/role" className="dropdown-item" onClick={closeServicesDropdown}>role</Link></li> }
                  </ul>
                )}
              </li>

              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <GiCube className="nav-icon" /> Masters <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    {(userRole.includes("Admin") ||isScreenAllowed("Product Family Master")) && <li><Link to="/product" className="dropdown-item" onClick={closeServicesDropdown}>Product family master</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("BOM Master")) && <li><Link to="/bomMaster" className="dropdown-item" onClick={closeServicesDropdown}>Bom Master</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("RC Main Store")) && <li><Link to="/rcMainStore" className="dropdown-item" onClick={closeServicesDropdown}>RC main store</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("Vendor Master")) && <li><Link to="/veendorMaster" className="dropdown-item" onClick={closeServicesDropdown}>VendorMaster</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("Currency Master")) && <li><Link to="/curencyMaster" className="dropdown-item" onClick={closeServicesDropdown}>curencyMaster</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("Product Family Master")) && <li><Link to="/compatabilityMaster" className="dropdown-item" onClick={closeServicesDropdown}>compatabilityMaster</Link></li>}
                    {(userRole.includes("Admin") ||isScreenAllowed("Approval Master")) && <li><Link to="/approvalMaster" className="dropdown-item" onClick={closeServicesDropdown}>Approval Master</Link></li>}
                  </ul>
                )}
              </li>

              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <FaStore className="nav-icon" /> Local PTL Store <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    {(userRole.includes("Admin") ||isScreenAllowed("PTL Master")) && (<li><Link to="/PTLMaster" className="dropdown-item" onClick={closeServicesDropdown}>PTL Master</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("Repair")) && (<li><Link to="/repaier" className="dropdown-item" onClick={closeServicesDropdown}>Repaier</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("Reworker")) && (<li><Link to="/reworker" className="dropdown-item" onClick={closeServicesDropdown}>Reworker</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("PTL Operator")) && (<li><Link to="/PTLOpreator" className="dropdown-item" onClick={closeServicesDropdown}>PTLOpreator</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("Local Putaway")) && (<li><Link to="/localPutaway" className="dropdown-item" onClick={closeServicesDropdown}>Putaway</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("Technology")) && (<li><Link to="/technology" className="dropdown-item" onClick={closeServicesDropdown}>Technology</Link></li> )}

                  </ul>
                )}
              </li>

              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <FaWarehouse className="nav-icon" /> Rc Main Store <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    {(userRole.includes("Admin") ||isScreenAllowed("Add PO Detail")) && (<li><Link to="/add_Po_Detail" className="dropdown-item" onClick={closeServicesDropdown}>Add Po Detail</Link></li> )}
                    {(userRole.includes("Admin") || isScreenAllowed("Receiving")) && (<li><Link to="/receving" className="dropdown-item" onClick={closeServicesDropdown}>Receving</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("GRN")) && (<li><Link to="/grn" className="dropdown-item" onClick={closeServicesDropdown}>GRN</Link></li> )}
                    {(userRole.includes("Admin") ||isScreenAllowed("PO Status")) && (<li><Link to="/poStatus" className="dropdown-item" onClick={closeServicesDropdown}>PoStatus</Link></li> )}
                    {(userRole.includes("Admin") || isScreenAllowed("Putaway")) && (<li><Link to="/putaway" className="dropdown-item" onClick={closeServicesDropdown}>Putaway</Link></li> )}

                    {/* <li><Link to="/service3" className="dropdown-item" onClick={closeServicesDropdown}>AcountActivation</Link></li> */}
                  </ul>
                )}
              </li>

              {/* Dashboard Dropdown */}
              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <FaChartPie className="nav-icon" /> Dashboard <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/localndindividualReport" className="dropdown-item" onClick={closeServicesDropdown}>localndindividualReport</Link></li>
                    <li><Link to="/localndindividualReport" className="dropdown-item" onClick={closeServicesDropdown}>localReport</Link></li>

                  </ul>
                )}
              </li>

              {/* Report Dropdown */}
              <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                <span className="nav-link">
                  <FaFileAlt className="nav-icon" /> Report <FaChevronDown className="dropdown-icon" />
                </span>
                {servicesDropdown && (
                  <ul className="dropdown-menu">
                    {(userRole.includes("Admin") || isScreenAllowed("Local & Individual Report")) && (
                      <li><Link to="/localndindividualReport" className="dropdown-item" onClick={closeServicesDropdown}>localnd individual Report</Link></li>)}
                    {(userRole.includes("Admin") || isScreenAllowed("Local Report")) && (<li><Link to="/localReport" className="dropdown-item" onClick={closeServicesDropdown}>local Report</Link></li>)}
                   {(userRole.includes("Admin") || isScreenAllowed("Open Report")) && (<li><Link to="/openReport" className="dropdown-item" onClick={closeServicesDropdown}>Open Report</Link></li>)}

                  </ul>
                )}
              </li>
            </ul>
          </nav>
        </div>

      </header>
      {/* <div class="footer">Footer</div> */}
    </>
  );
}
export default HeaderComponents;
