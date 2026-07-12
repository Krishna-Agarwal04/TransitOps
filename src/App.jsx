import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './context/AuthContext';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { SidebarLayout } from './layouts/SidebarLayout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Layout Routes */}
          <Route element={
            <ProtectedLayout>
              <SidebarLayout />
            </ProtectedLayout>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Fleet Manager Routes */}
            <Route path="/vehicles" element={
              <ProtectedLayout allowedRoles={[ROLES.FLEET_MANAGER]}>
                <Vehicles />
              </ProtectedLayout>
            } />
            <Route path="/maintenance" element={
              <ProtectedLayout allowedRoles={[ROLES.FLEET_MANAGER]}>
                <Maintenance />
              </ProtectedLayout>
            } />

            {/* Safety Officer Routes */}
            <Route path="/drivers" element={
              <ProtectedLayout allowedRoles={[ROLES.SAFETY_OFFICER]}>
                <Drivers />
              </ProtectedLayout>
            } />

            {/* Driver Routes */}
            <Route path="/trips" element={
              <ProtectedLayout allowedRoles={[ROLES.DRIVER]}>
                <Trips />
              </ProtectedLayout>
            } />

            {/* Financial Analyst Routes */}
            <Route path="/expenses" element={
              <ProtectedLayout allowedRoles={[ROLES.FINANCIAL_ANALYST]}>
                <Expenses />
              </ProtectedLayout>
            } />

            {/* Reports (Manager, Safety, Analyst) */}
            <Route path="/reports" element={
              <ProtectedLayout allowedRoles={[ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST]}>
                <Reports />
              </ProtectedLayout>
            } />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
              <p className="text-slate-500 mb-4 text-sm">Page not found.</p>
              <a href="/dashboard" className="text-blue-600 font-semibold text-sm hover:underline">
                Go to Dashboard
              </a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
