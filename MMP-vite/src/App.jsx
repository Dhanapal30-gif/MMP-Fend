import React, { useState, useEffect } from 'react';
import { Route, Routes ,useLocation  } from 'react-router-dom';
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

function App() {
  const [count, setCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // Get current route
  // console.log(location.pathname);
  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    setIsLoggedIn(!!role); // Set login status based on session
  }, []);

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

  return (
    <ThemeProvider theme={theme}>
      <div className='App'>
      {!hideHeader && <HeaderComponents isLoggedIn={isLoggedIn} />} 
    <Routes>
        <Route path="/" element ={<Login />}   />
        <Route path="/createAccount" element ={<CreateAccount />}   />
        <Route path="/home" element ={<HomeComponenet />}   />
        <Route path="/product" element ={<ProductFamilyMaster />}   />
        <Route path="/rcMainStore" element ={<RcMainStore />}   />
        <Route path="/veendorMaster" element ={<VeendorMaster />}   />        
        <Route path='/bomMaster' element={<BomMaster />} />
        <Route path='/curencyMaster' element={<CurencyMaster />} />
        <Route path='/approvalMaster' element={<ApprovalMaster />} />
        <Route path='/add_Po_Detail' element={<Add_Po_Detail />} />
        <Route path='/grn' element={<GRN />} />
        <Route path='/poStatus' element={<PoStatus />} />

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
