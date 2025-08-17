import { createContext, useState, useContext } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [roleScreens, setRoleScreens] = useState([]);

  return (
    <RoleContext.Provider value={{ roleScreens, setRoleScreens }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
