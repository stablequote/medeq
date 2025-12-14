import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Home from './pages/Home';
import './App.css'
import VerifiyTransaction from './pages/VerifyTransaction';
import PosPage from './pages/PosPage';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import ProductSales from './pages/ProductSales';
import Login from './pages/Login';
import PrivateRoute from './pages/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from "react-i18next";
import UnAuthorized from './pages/UnAuthorized';
import SuppliersList from './components/SuppliersList';
import Expenses from './pages/Expenses';
import Cashout from './pages/Cashout';
import Ledger from './pages/Ledger';

const App = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
            {/* <Route index  element={<Login />} /> */}
            <Route element={<PrivateRoute allowedRoles={['owner', 'manager', 'staff']} />}>
              <Route path="/" element={<DashboardLayout changeLanguage={changeLanguage} value={i18n.language} />}>
                <Route path="home" element={<Home />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="pos" element={<PosPage />} />
                <Route path="verify" element={<VerifiyTransaction />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="orders" element={<Orders />} />
                <Route path="suppliers" element={<SuppliersList />} />
                <Route path="/supplier/orders" element={<Suppliers />} />
                <Route path="sales" element={<ProductSales />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="cashout" element={<Cashout />} />
                <Route path="ledger" element={<Ledger />} />
              </Route>
            </Route>
          {/* Default Route */}
          <Route path='/login' element={<Login />} />
          <Route path='/unauthorized' element={<UnAuthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;