import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Importing hamburger menu icons
import Avatar from "@mui/material/Avatar";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagee from "../../assets/Nokia_9-removebg-preview.png";
import './HeaderComponents.css';
import {
  Badge, IconButton, Menu, MenuItem, ListItemText, Box, Typography,
  ListItemSecondaryAction
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FaHome, FaCog, FaCubes, FaStore, FaWarehouse, FaChartPie, FaFileAlt } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { GiCube } from "react-icons/gi";
import { HiChartBar } from "react-icons/hi";
import CloseIcon from '@mui/icons-material/Close';

const HeaderComponents = ({ isLoggedIn, setIsLoggedIn, setUserId, notificationCount }) => {
  const [empName, setEmpName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the mobile menu
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const navigate = useNavigate();
  const [openIcon, setOpenIcon] = useState(false);
  const [screen, setScreen] = useState([]); // <-- add this
  const [notifications, setNotifications] = useState([]);
  const [avatarEl, setAvatarEl] = useState(null);
  const avatarOpen = Boolean(avatarEl);

  // useEffect(() => {
  //   const sessionName = sessionStorage.getItem("userName") || localStorage.getItem("userName") || "";
  //   const roleStr = sessionStorage.getItem("userRole") || "[]";
  //   const role = JSON.parse(roleStr);
  //   setEmpName(sessionName);
  //   setUserRole(role);
  // }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setEmpName("");
      setUserRole([]);
      return;
    }

    const sessionName =
      sessionStorage.getItem("userName") ||
      localStorage.getItem("userName") ||
      "";

    const roleStr = sessionStorage.getItem("userRole") || "[]";

    setEmpName(sessionName);
    setUserRole(JSON.parse(roleStr));
  }, [isLoggedIn]);   // 👈 THIS IS THE FIX

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setOpenIcon(false);
    setServicesDropdown(false);
  };
  const handleAvatarClick = (e) => {
    setAvatarEl(e.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarEl(null);
  };

  const confirmLogout = () => {
    handleAvatarClose();
    handleSignOut();
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUserId(null);       // 🔥 VERY IMPORTANT
    setIsLoggedIn(false); // 🔥
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

  const handleRemove = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const storedScreens = sessionStorage.getItem("allowedScreens");
    if (storedScreens) setScreen(JSON.parse(storedScreens));
  }, []);

  const isScreenAllowed = (screenName) => {
    const allowedScreens = JSON.parse(sessionStorage.getItem("allowedScreens") || "[]");
    const result = allowedScreens.includes(screenName);
    return result;
  };

  return (
    <>
      <header className="header-container">
        <div className="header7">
          <div class="header-logo-box"></div>
          <div className="logo-section">
            {/* <p>NOKIA   </p> */}
            <img src={Imagee} alt="Nokia Logo" className="logo" />

            {/* <img src={Imagee} alt="Logo" className="logo" /> */}
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
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              disableScrollLock
              PaperProps={{
                sx: {
                  maxHeight: 300,
                  maxWidth: 300,
                  width: 'auto',
                  overflowX: 'hidden',
                }
              }}
            >
              {notifications.length === 0 ? (
                <MenuItem disabled>No new notifications</MenuItem>
              ) : (
                notifications.map((note, index) => (
                  <MenuItem key={index} disableRipple sx={{ whiteSpace: 'normal' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        backgroundColor: '#e0d5d5ff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        width: '100%',
                        gap: 1,
                      }}
                    >
                      {/* Wrap text properly */}
                      <Box sx={{ flex: 1, wordBreak: 'break-word' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Have notification
                        </Typography>
                        <Typography variant="body2">
                          {note}
                        </Typography>
                      </Box>

                      {/* Close button fixed right side */}
                      <IconButton
                        size="small"
                        sx={{ flexShrink: 0, mt: 0.5 }}
                        onClick={() => handleRemove(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>
          </div>

          <div className="avatar-container">
            {isLoggedIn && (
              <>
                <div className="avatar-wrapper">
                  <Avatar
                    className="avatar"
                    sx={{ bgcolor: "#076935", cursor: "pointer" }}
                    onClick={handleAvatarClick}
                  />
                  <h5 className="avatar-name">{empName}</h5>
                </div>

                <Menu
                  anchorEl={avatarEl}
                  open={avatarOpen}
                  onClose={handleAvatarClose}
                  disableScrollLock
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={confirmLogout} sx={{ color: "red" }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>

        </div>


        <div className="header">
          <div className="hamburger-menu" onClick={() => setOpenIcon(!openIcon)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />} {/* Show hamburger icon or close icon */}
          </div>


          <nav className={`navgation ${isMenuOpen ? "open" : ""}`}>
            <nav className={`navigation ${openIcon ? "show" : ""}`}>
              <ul className="nav-links">
                <li className="dropdown-container" >
                  {/* <ul><Link to="/home">Home</Link></ul> */}
                  {/* <span className="nav-link">
                    <AiFillHome className="nav-icon" /> Home
                  </span> */}
                  <span className="nav-link">
                    <Link to="/home" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                      <AiFillHome className="nav-icon" style={{ marginRight: '5px' }} /> Home
                    </Link>
                  </span>
                </li>
                <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                  <span className="nav-link">
                    <IoSettingsSharp className="nav-icon" /> Settings <FaChevronDown className="dropdown-icon" />
                  </span>
                  {servicesDropdown && (
                    <ul className="dropdown-menu">
                      {/* <li><Link to="/userList" className="dropdown-item" onClick={closeServicesDropdown}>userList</Link></li> */}
                      {(userRole.includes("Admin") || isScreenAllowed("userDetail")) && <li><Link to="/userDetail" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}  >User Detail</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("Role")) && <li><Link to="/role" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Role Master</Link></li>}
                    </ul>
                  )}
                </li>

                <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                  <span className="nav-link">
                    <GiCube className="nav-icon" /> Masters <FaChevronDown className="dropdown-icon" />
                  </span>
                  {servicesDropdown && (
                    <ul className="dropdown-menu">
                      {(userRole.includes("Admin") || isScreenAllowed("Product Family Master")) && <li><Link to="/product" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Product Family Master</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("BOM Master")) && <li><Link to="/bomMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Bom Master</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("RC Main Store")) && <li><Link to="/rcMainStore" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>RC main store</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("Vendor Master")) && <li><Link to="/veendorMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Vendor Master</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("Currency Master")) && <li><Link to="/curencyMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Currency Master</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("Compatability Master")) && <li><Link to="/compatabilityMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Compatability Master</Link></li>}
                      {(userRole.includes("Admin") || isScreenAllowed("Approval Master")) && <li><Link to="/approvalMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Approval Master</Link></li>}
                      {/* {(userRole.includes("Admin") || isScreenAllowed("Compatability Master")) && <li><Link to="/compatabilityMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Compatability Master</Link></li>} */}
                    </ul>
                  )}
                </li>

                <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                  <span className="nav-link">
                    <FaStore className="nav-icon" /> Local PTL Store <FaChevronDown className="dropdown-icon" />
                  </span>
                  {servicesDropdown && (
                    <ul className="dropdown-menu">
                      {(userRole.includes("Admin") || isScreenAllowed("PTL Master")) && (<li><Link to="/PTLMaster" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>PTL Master</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Repair")) && (<li><Link to="/repaier" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Repaier</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Reworker")) && (<li><Link to="/reworker" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Reworker</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("PTL Operator")) && (<li><Link to="/PTLOpreator" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>PTL Opreator</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("PTL Request")) && (<li><Link to="/ptlRequest" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>PTL Request</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Local Putaway")) && (<li><Link to="/localPutaway" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Putaway</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Technology")) && (<li><Link to="/technology" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Technology</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("ManualDoor")) && (<li><Link to="/manualDoor" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Manual Door</Link></li>)}

                    </ul>
                  )}
                </li>

                <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                  <span className="nav-link">
                    <FaWarehouse className="nav-icon" /> Rc Main Store <FaChevronDown className="dropdown-icon" />
                  </span>
                  {servicesDropdown && (
                    <ul className="dropdown-menu">
                      {(userRole.includes("Admin") || isScreenAllowed("Add PO Detail")) && (<li><Link to="/add_Po_Detail" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Add Po Detail</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Receiving")) && (<li><Link to="/receving" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Receving</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("GRN")) && (<li><Link to="/grn" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>GRN</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("PO Status")) && (<li><Link to="/poStatus" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Po Status</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Putaway")) && (<li><Link to="/putaway" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Putaway</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Requester")) && (<li><Link to="/requester" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Requester</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Approver")) && (<li><Link to="/approver" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Approver</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Issuance")) && (<li><Link to="/issuance" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Issuance</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Returning")) && (<li><Link to="/returning" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Returning</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("DeploymentPopup")) && (<li><Link to="/deploymentPopup" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>DeploymentPopup</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("ManualRCRequest")) && (<li><Link to="/manualRCRequest" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Manual RC Request</Link></li>)}

                    </ul>
                  )}
                </li>

                <li className="dropdown-container" onMouseEnter={toggleServicesDropdown} onMouseLeave={closeServicesDropdown}>

                  <span className="nav-link">
                    <FaFileAlt className="nav-icon" /> Stock <FaChevronDown className="dropdown-icon" />
                  </span>
                  {servicesDropdown && (
                    <ul className="dropdown-menu">
                      {(userRole.includes("Admin") || isScreenAllowed("Local Report")) && (<li><Link to="/stockTransfer" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Stock Transfer</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Open Report")) && (<li><Link to="/stockReport" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Stock Report</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Open Report")) && (<li><Link to="/stockUpdate" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Manual Stock Update</Link></li>)}
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
                        <li><Link to="/localndindividualReport" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Local Indiviual Report</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Local Report")) && (<li><Link to="/localReport" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Local Report</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("Open Report")) && (<li><Link to="/openReport" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Open Report</Link></li>)}
                      {(userRole.includes("Admin") || isScreenAllowed("LocalSummary Report")) && (<li><Link to="/localSummaryReport" className="dropdown-item" onClick={() => { closeServicesDropdown(); handleLinkClick(); }}>Local Summary Report</Link></li>)}
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
                      {/* <li><Link to="/localndindividualReport" className="dropdown-item" onClick={closeServicesDropdown}>localndindividualReport</Link></li>
                    <li><Link to="/localndindividualReport" className="dropdown-item" onClick={closeServicesDropdown}>localReport</Link></li> */}
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </nav>
        </div>
      </header>
      {/* <div class="footer">Footer</div> */}
    </>
  );
}
export default HeaderComponents;
