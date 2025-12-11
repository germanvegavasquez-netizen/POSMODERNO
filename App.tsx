
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { User, UserRole, CompanySettings, CashRegisterSession, PaymentMethod } from './types';
import { MOCK_USERS, DEFAULT_SETTINGS, MOCK_PAYMENT_METHODS } from './services/mockData';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import ClientsPage from './pages/Clients';
import ProductsPage from './pages/Inventory/Products';
import CategoriesPage from './pages/Inventory/Categories';
import BrandsPage from './pages/Inventory/Brands';
import InventoryReport from './pages/Inventory/InventoryReport';
import POSPage from './pages/Sales/POS';
import SalesHistoryPage from './pages/Sales/SalesHistory';
import SalesByProductPage from './pages/Sales/SalesByProduct';
import SettingsPage from './pages/Settings';
import CashRegisterPage from './pages/CashRegister';
import PaymentMethodsPage from './pages/PaymentMethods';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  
  // Cash Register State
  const [currentSession, setCurrentSession] = useState<CashRegisterSession | null>(null);

  // Payment Methods State (Hoisted to share between Settings and POS)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedSettings = localStorage.getItem('pos_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedSession = localStorage.getItem('pos_session');
    if (savedSession) setCurrentSession(JSON.parse(savedSession));

    const savedPaymentMethods = localStorage.getItem('pos_payment_methods');
    if (savedPaymentMethods) setPaymentMethods(JSON.parse(savedPaymentMethods));
  }, []);

  const handleLogin = (email: string) => {
    const foundUser = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
    setUser(foundUser);
    localStorage.setItem('pos_user', JSON.stringify(foundUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    localStorage.setItem('pos_settings', JSON.stringify(newSettings));
  };

  const handleSessionChange = (session: CashRegisterSession | null) => {
    setCurrentSession(session);
    if (session) {
      localStorage.setItem('pos_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('pos_session');
    }
  };

  const updateSessionSales = (amount: number) => {
    if (currentSession) {
      const updated = { ...currentSession, salesTotal: currentSession.salesTotal + amount };
      setCurrentSession(updated);
      localStorage.setItem('pos_session', JSON.stringify(updated));
    }
  };

  const handlePaymentMethodsChange = (methods: PaymentMethod[]) => {
    setPaymentMethods(methods);
    localStorage.setItem('pos_payment_methods', JSON.stringify(methods));
  };

  return (
    <Router>
      <Layout user={user} settings={settings} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pos" element={
                <POSPage 
                  settings={settings} 
                  isRegisterOpen={!!currentSession} 
                  onSaleComplete={updateSessionSales}
                  paymentMethods={paymentMethods.filter(pm => pm.isActive)}
                />
              } />
              <Route path="/cash-register" element={
                <CashRegisterPage 
                  settings={settings} 
                  currentSession={currentSession} 
                  onSessionChange={handleSessionChange} 
                />
              } />
              <Route path="/sales" element={<SalesHistoryPage settings={settings} />} />
              <Route path="/sales/products" element={<SalesByProductPage settings={settings} />} />
              
              <Route path="/inventory/products" element={<ProductsPage settings={settings} />} />
              <Route path="/inventory/categories" element={<CategoriesPage />} />
              <Route path="/inventory/brands" element={<BrandsPage />} />
              <Route path="/inventory/report" element={<InventoryReport settings={settings} />} />
              
              <Route path="/users" element={<UsersPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/payment-methods" element={
                <PaymentMethodsPage 
                  paymentMethods={paymentMethods} 
                  onUpdate={handlePaymentMethodsChange} 
                />
              } />
              <Route path="/settings" element={<SettingsPage settings={settings} onSave={handleSaveSettings} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Layout>
    </Router>
  );
}
