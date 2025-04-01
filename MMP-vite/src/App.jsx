import React, { useState, useEffect } from 'react';
import { Route, Routes ,useLocation  } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import './App.css'
import Login from './userAuth/Login'
import HeaderComponents from './components/HeaderComponents';
import HomeComponenet from './components/HomeComponenet';
import ProductFamilyMaster from './Master/ProductFamilyMaster';

function App() {
  const [count, setCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // Get current route
  console.log(location.pathname);
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
  const hideHeader = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/createaccount' || location.pathname === '/ChangePassword';

  return (
    <ThemeProvider theme={theme}>
      <div className='App'>
      {!hideHeader && <HeaderComponents isLoggedIn={isLoggedIn} />} 
    <Routes>
        <Route path="/" element ={<Login />}   />
        <Route path="/home" element ={<HomeComponenet />}   />
        <Route path="/product" element ={<ProductFamilyMaster />}   />

    </Routes>
    </div>
    </ThemeProvider>
  )
}

export default App
