import React, { createContext, useState, useContext } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = {
  FLEET_MANAGER: 'FLEET_MANAGER',
  DRIVER: 'DRIVER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST',
};

export const ROLE_LABELS = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password, role = ROLES.FLEET_MANAGER) => {
    try {
      const response = await apiService.auth.login(email, password);
      if (response && response.data) {
        const userData = {
          id: response.data.user?.id || 'usr-1',
          name: response.data.user?.name || email.split('@')[0].toUpperCase(),
          email: response.data.user?.email || email,
          role: response.data.user?.role || role,
          token: response.data.token
        };
        setUser(userData);
        localStorage.setItem('transitops_user', JSON.stringify(userData));
        return true;
      }
    } catch (err) {
      console.warn("Backend auth failed or unreachable. Falling back to mock login.", err);
      const mockUser = {
        id: 'usr-1',
        name: email.split('@')[0].toUpperCase(),
        email,
        role,
      };
      setUser(mockUser);
      localStorage.setItem('transitops_user', JSON.stringify(mockUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  const switchRole = (newRole) => {
    if (user && ROLES[newRole]) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('transitops_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, ROLES, ROLE_LABELS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
