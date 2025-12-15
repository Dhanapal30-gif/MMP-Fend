import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css'

import Login from './Pages/UserAuthentication/Login/Login'
import HeaderComponents from './components/HeaderComponents/HeaderComponents';
import HomeComponenet from './components/Homecomponents/HomeComponenet';
import ProductFamilyMaster from './Pages/ProductMaster/ProductFamilyMaster';
import CreateAccount from './Pages/UserAuthentication/CreateAccount/CreateAccount';
import RcMainStore from './Pages/MainMaster/RcMainStore';
import VeendorMaster from './Pages/VendorMaster/VeendorMaster';
import BomMaster from './Pages/BomMaster/BomMaster';
import CurencyMaster from './Pages/CuurencyMaster/CurencyMaster';
import ApprovalMaster from './Pages/ApprovalMaster/ApprovalMaster';
import Add_Po_Detail from './Pages/PoDetail/Add_Po_Detail';
import Receving from './Pages/Receving/Receving';
import PrivateRoute from './components/Route/PrivateRoute';
import GRN from './Pages/GRN/GRN';
import PoStatus from './Pages/PoStatus/PoStatus';
import Putaway from './Pages/Putaway/Putaway';
import PTLMaster from './Pages/Local-PTL-Master/PTLMaster';
import Repaier from './Pages/Repaier/Repaier';
import Reworker from './Pages/Reworker/Reworker';
import PTLOpreator from './Pages/PTLOpreator/PTLOpreator';
import LocalndindividualReport from './Pages/LocalndindividualReport/LocalndindividualReport';
import LocalReport from './Pages/LocalReport/LocalReport';
import LocalPutaway from './Pages/LocalPutaway/LocalPutaway';
import RoleMaster from './Pages/RoleMaster/RoleMaster';
import Role from './Pages/Role/Role';
import Technology from './Pages/Technology/Technology';
import OpenReport from './Pages/OpenReport/OpenReport';
import axios from "axios";
import { url } from './app.config';
import UserDetail from './Pages/UserList/UserDetail';
import Requester from './Pages/Requester/Requester';
import Approver from './Pages/Approver/Approver';
import Issuance from './Pages/Issuance/Issuance';
import Returning from './Pages/Returning/Returning';
import StockTransfer from './Pages/StockTransfer/StockTransfer';
import NotificationList from './components/Notification/NotificationList';
import PTLRequest from './Pages/PTLOpreatorRequest/PTLRequest';
import CompatabilityMaster from './Pages/CompatabilityMaster/CompatabilityMaster';
import LocalSummaryReport from './Pages/LocalSummaryReport/LocalSummaryReport';
import StockReport from './Pages/StockReport/StockReport';
import StockUpdate from './Pages/StockUpdate/StockUpdate';
import DeploymentPopup from './Pages/DeploeyementNotification/DeploymentPopup';
import ForgotPassword from './Pages/UserAuthentication/Login/ForgotPassword';
import ScreenRoute from "./ScreenRoute";

import { fetchScreens } from './Services/Services_09';
import ManualRCRequest from './Pages/ManualRCRequest/ManualRCRequest';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allowedScreens, setAllowedScreens] = useState([]);
  const location = useLocation();
  const [userId, setUserId] = useState(sessionStorage.getItem("userId") || "");

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    setIsLoggedIn(!!role);
    registerScreens();
  }, []);

  useEffect(() => {
    const roles = JSON.parse(sessionStorage.getItem("userRole"));
    const storedScreens = sessionStorage.getItem("allowedScreens");

    if (storedScreens) {
      setAllowedScreens(JSON.parse(storedScreens));
    } else if (roles?.length) {
      fetchScreens(roles).then(res => {
        const allowed = res.data
          .map(i => i.split(","))
          .flat()
          .map(s => s.trim());

        sessionStorage.setItem("allowedScreens", JSON.stringify(allowed));
        setAllowedScreens(allowed);
      });
    }
  }, []);

  const registerScreens = async () => {
    const screens = [
      { name: "Login", path: "/" },
      { name: "Create Account", path: "/createAccount" },
      { name: "Home", path: "/home" },
      { name: "Product Family Master", path: "/product" },
      { name: "RC Main Store", path: "/rcMainStore" },
      { name: "Vendor Master", path: "/veendorMaster" },
      { name: "BOM Master", path: "/bomMaster" },
      { name: "Currency Master", path: "/curencyMaster" },
      { name: "Approval Master", path: "/approvalMaster" },
      { name: "Add PO Detail", path: "/add_Po_Detail" },
      { name: "GRN", path: "/grn" },
      { name: "PO Status", path: "/poStatus" },
      { name: "Putaway", path: "/putaway" },
      { name: "PTL Master", path: "/PTLMaster" },
      { name: "Repair", path: "/repaier" },
      { name: "Reworker", path: "/reworker" },
      { name: "PTL Operator", path: "/PTLOpreator" },
      { name: "Local & Individual Report", path: "/localndindividualReport" },
      { name: "Local Report", path: "/localReport" },
      { name: "Local Putaway", path: "/localPutaway" },
      { name: "Role Master", path: "/roleMaster" },
      { name: "Role", path: "/role" },
      { name: "Technology", path: "/technology" },
      { name: "Open Report", path: "/openReport" },
      { name: "Receiving", path: "/receving" },
      { name: "UserDetail", path: "/userDetail" },
      { name: "Requester", path: "/requester" },
      { name: "Approver", path: "/approver" },
      { name: "Issuance", path: "/issuance" },
      { name: "Returning", path: "/returning" },
      { name: "StockTransfer", path: "/stockTransfer" },
      { name: "PTL Request", path: "/ptlRequest" },
      { name: "Compatability Master", path: "/compatabilityMaster" },
      { name: "LocalSummary Report", path: "/localSummaryReport" },
      { name: "StockReport", path: "/stockReport" },
      { name: "StockUpdate", path: "/stockUpdate" },
      { name: "ManualRCRequest", path: "/manualRCRequest" },
    ];

    try {
      await axios.post(`${url}/userAuth/screens/register`, screens);
    } catch (err) {
      console.error("Screen auto-registration failed", err);
    }
  };

  const theme = createTheme({
    typography: {
      allVariants: {
        fontStyle: 'normal',
        fontFamily: 'default',
      },
    },
  });

  const hideHeader =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/createAccount' ||
    location.pathname === '/forgotPassword';

  return (
    <ThemeProvider theme={theme}>
      <div className='App'>

        {!hideHeader && (
          <HeaderComponents
            isLoggedIn={isLoggedIn}
            allowedScreens={allowedScreens}
          />
        )}

        {userId && <NotificationList userId={userId} />}

        <Routes>
          <Route
  path="/grn"
  element={
    <PrivateRoute>
      <ScreenRoute screenName="GRN">
        <GRN />
      </ScreenRoute>
    </PrivateRoute>
  }
/>

          <Route path="/" element={<Login setUserId={setUserId} />} />
          <Route path="/createAccount" element={<CreateAccount />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />

          <Route path="/home" element={<PrivateRoute><HomeComponenet /></PrivateRoute>} />
          <Route path="/product" element={<PrivateRoute><ProductFamilyMaster /></PrivateRoute>} />
          <Route path="/rcMainStore" element={<PrivateRoute><RcMainStore /></PrivateRoute>} />
          <Route path="/veendorMaster" element={<PrivateRoute><VeendorMaster /></PrivateRoute>} />
          <Route path="/bomMaster" element={<PrivateRoute><BomMaster /></PrivateRoute>} />
          <Route path="/curencyMaster" element={<PrivateRoute><CurencyMaster /></PrivateRoute>} />
          <Route path="/approvalMaster" element={<PrivateRoute><ApprovalMaster /></PrivateRoute>} />
          <Route path="/add_Po_Detail" element={<PrivateRoute><Add_Po_Detail /></PrivateRoute>} />
          <Route path="/grn" element={<PrivateRoute><GRN /></PrivateRoute>} />
          <Route path="/poStatus" element={<PrivateRoute><PoStatus /></PrivateRoute>} />
          <Route path="/putaway" element={<PrivateRoute><Putaway /></PrivateRoute>} />
          <Route path="/PTLMaster" element={<PrivateRoute><PTLMaster /></PrivateRoute>} />
          <Route path="/repaier" element={<PrivateRoute><Repaier /></PrivateRoute>} />
          <Route path="/reworker" element={<PrivateRoute><Reworker /></PrivateRoute>} />
          <Route path="/PTLOpreator" element={<PrivateRoute><PTLOpreator /></PrivateRoute>} />
          <Route path="/localndindividualReport" element={<PrivateRoute><LocalndindividualReport /></PrivateRoute>} />
          <Route path="/localReport" element={<PrivateRoute><LocalReport /></PrivateRoute>} />
          <Route path="/localPutaway" element={<PrivateRoute><LocalPutaway /></PrivateRoute>} />
          <Route path="/roleMaster" element={<PrivateRoute><RoleMaster /></PrivateRoute>} />
          <Route path="/role" element={<PrivateRoute><Role /></PrivateRoute>} />
          <Route path="/technology" element={<PrivateRoute><Technology /></PrivateRoute>} />
          <Route path="/openReport" element={<PrivateRoute><OpenReport /></PrivateRoute>} />
          <Route path="/userDetail" element={<PrivateRoute><UserDetail /></PrivateRoute>} />
          <Route path="/requester" element={<PrivateRoute><Requester /></PrivateRoute>} />
          <Route path="/approver" element={<PrivateRoute><Approver /></PrivateRoute>} />
          <Route path="/issuance" element={<PrivateRoute><Issuance /></PrivateRoute>} />
          <Route path="/returning" element={<PrivateRoute><Returning /></PrivateRoute>} />
          <Route path="/stockTransfer" element={<PrivateRoute><StockTransfer /></PrivateRoute>} />
          <Route path="/ptlRequest" element={<PrivateRoute><PTLRequest /></PrivateRoute>} />
          <Route path="/localSummaryReport" element={<PrivateRoute><LocalSummaryReport /></PrivateRoute>} />
          <Route path="/compatabilityMaster" element={<PrivateRoute><CompatabilityMaster /></PrivateRoute>} />
          <Route path="/stockReport" element={<PrivateRoute><StockReport /></PrivateRoute>} />
          <Route path="/stockUpdate" element={<PrivateRoute><StockUpdate /></PrivateRoute>} />
          <Route path="/deploymentPopup" element={<PrivateRoute><DeploymentPopup /></PrivateRoute>} />
          <Route path="/receving" element={<PrivateRoute><Receving /></PrivateRoute>} />
          <Route path="/manualRCRequest" element={<PrivateRoute><ManualRCRequest/></PrivateRoute>} />

        </Routes>

      </div>
    </ThemeProvider>
    
  );
}

export default App;
