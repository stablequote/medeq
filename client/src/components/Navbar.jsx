import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Divider, Navbar } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next';

const AppNavbar = () => {

  const activeStyle = {
    backgroundColor: '#009099', // Light background for the active link
    fontWeight: 'bold',        // Highlight the text
    borderRadius: '4px',       // Rounded edges for better UI
  };

  const isMobile = useMediaQuery('(max-width: 375px)');

  const { logout } = useAuth()
  const { t } = useTranslation()

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <Navbar width={!isMobile ? { base: 250 } : 100} p="xs" sx={{ background: '#1D242E' }}>
      <NavLink to="/home" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("Home")}
      </NavLink>

      <NavLink to="/pos" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("POS")}
      </NavLink>

      <NavLink to="/inventory" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("INVENTORY")}
      </NavLink>

      <NavLink to="/expenses" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("EXPENSES")}
      </NavLink>
      
      <NavLink to="/cashout" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("CASHOUT")}
      </NavLink>

      <NavLink to="/ledger" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("LEDGER")}
      </NavLink>

      <Divider size={1} my={10} />

      {(role === "owner" || role === "manager") && (
        <NavLink to="/orders" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
          {t("ORDERS")}
        </NavLink>
      )}

      {(role === "owner" || role === "manager") && (
        <NavLink to="/suppliers" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
          {t("SUPPLIERS")}
        </NavLink>
      )}

      <NavLink to="/sales" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("SALES")}
      </NavLink>

      {(role === "owner" || role === "manager") && (
        <NavLink to="/analytics" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
          {t("ANALYTICS")}
        </NavLink>
      )}

      <Divider size={1} my={10} />

      {(role === "owner" || role === "manager") && (
      <NavLink to="/profile" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        {t("PROFILE")}
      </NavLink>
      )}

      <Button
        color="red"
        mt="lg"
        onClick={logout}
        sx={{ position: "absolute", bottom: 22, left: 10, width: "90%" }}
      >
        {t("LOGOUT")}
      </Button>
    </Navbar>
  );
};

export default AppNavbar;
