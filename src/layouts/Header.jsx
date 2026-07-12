import React from 'react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { LogOut, Bell, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/vehicles')) return 'Vehicles Registry';
    if (path.startsWith('/drivers')) return 'Driver Profiles';
    if (path.startsWith('/trips')) return 'Trip Management';
    if (path.startsWith('/maintenance')) return 'Maintenance Logs';
    if (path.startsWith('/expenses')) return 'Expenses & Fuel Logs';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    return 'TransitOps';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
