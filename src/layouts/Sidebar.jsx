import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Compass, 
  Wrench, 
  Receipt, 
  BarChart3, 
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user, ROLES, switchRole } = useAuth();

  const getNavItems = () => {
    const role = user?.role;
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    if (role === ROLES.FLEET_MANAGER) {
      items.push(
        { path: '/vehicles', label: 'Vehicles', icon: Truck },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/reports', label: 'Reports', icon: BarChart3 }
      );
    } else if (role === ROLES.DRIVER) {
      items.push(
        { path: '/trips', label: 'Trips', icon: Compass }
      );
    } else if (role === ROLES.SAFETY_OFFICER) {
      items.push(
        { path: '/drivers', label: 'Drivers', icon: Users },
        { path: '/reports', label: 'Reports', icon: BarChart3 }
      );
    } else if (role === ROLES.FINANCIAL_ANALYST) {
      items.push(
        { path: '/expenses', label: 'Expenses', icon: Receipt },
        { path: '/reports', label: 'Reports', icon: BarChart3 }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200 flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600" />
          <span>TransitOps</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Smart Transport Platform</p>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Development Helper: Role Switcher */}
        <div className="pt-6 border-t border-slate-200">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Role Switcher</span>
          </p>
          <div className="px-3">
            <select
              value={user?.role || ''}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.keys(ROLES).map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {ROLE_LABELS[roleKey]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm uppercase">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{ROLE_LABELS[user?.role] || 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
