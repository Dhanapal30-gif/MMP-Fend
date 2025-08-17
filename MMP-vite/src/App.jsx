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
import LocalndindividualReportCom from './components/LocalndindividualReport/LocalndindividualReportCom';
import LocalndindividualReport from './Pages/LocalndindividualReport/LocalndindividualReport';
import LocalReport from './Pages/LocalReport/LocalReport';
import LocalPutaway from './Pages/LocalPutaway/putaway';
import RoleMaster from './Pages/RoleMaster/RoleMaster';
import Role from './Pages/Role/Role';
import Technology from './Pages/Technology/Technology';
import OpenReport from './Pages/OpenReport/OpenReport';
import axios from "axios";
import { url } from './app.config';
import UserDetail from './Pages/UserList/UserDetail';
function App() {
  const [count, setCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    setIsLoggedIn(!!role);
    registerScreens();

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
            { name: "UserDetail", path: "/userDetail" }

    ];
    try {
      await axios.post(`${url}/userAuth/screens/register`, screens);
    } catch (err) {
      console.error("Screen auto-registration failed", err);
    }
  }
  const theme = createTheme({
    typography: {
      allVariants: {
        fontStyle: 'normal',
        fontFamily: 'default',
      },
    },
  });

  const currentPath = location.pathname.replace(/\/$/, "");
  const hideHeader = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/createAccount' || location.pathname === '/ChangePassword';

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



  return (
    <ThemeProvider theme={theme}>
      <div className='App'>
        {!hideHeader && <HeaderComponents isLoggedIn={isLoggedIn} />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/createAccount" element={<CreateAccount />} />
          <Route path="/home" element={<HomeComponenet />} />
         
            <Route path="/product" element={<ProductFamilyMaster />} />
              
           <Route path="/rcMainStore" element={<RcMainStore />} />
          <Route path="/veendorMaster" element={<VeendorMaster />} />
          <Route path='/bomMaster' element={<BomMaster />} />
          <Route path='/curencyMaster' element={<CurencyMaster />} />
          <Route path='/approvalMaster' element={<ApprovalMaster />} />
          <Route path='/add_Po_Detail' element={<Add_Po_Detail />} />
          <Route path='/grn' element={<GRN />} />
          <Route path='/poStatus' element={<PoStatus />} />
          <Route path='/putaway' element={<Putaway />} />
          <Route path='/PTLMaster' element={<PTLMaster />} />
          <Route path='/repaier' element={<Repaier />} />
          <Route path='/reworker' element={<Reworker />} />
          <Route path='/PTLOpreator' element={<PTLOpreator />} />
          <Route path='/localndindividualReport' element={<LocalndindividualReport />} />
          <Route path='/localReport' element={<LocalReport />} />
          <Route path='/localPutaway' element={<LocalPutaway />} />
          <Route path='/roleMaster' element={<RoleMaster />} />
          <Route path='/role' element={<Role />} />
          <Route path='/technology' element={<Technology />} />
          <Route path='/openReport' element={<OpenReport />} />
          <Route path='/userDetail' element={<UserDetail />} />

          <Route
            path="/receving"
            element={
              <PrivateRoute>
                <Receving />
              </PrivateRoute>
            }
          />



        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
