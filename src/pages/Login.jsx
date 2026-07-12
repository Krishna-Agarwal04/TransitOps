import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSimpleLogin = (role) => {
    login(`${role.toLowerCase()}@transitops.com`, 'Password123', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">TransitOps Login</h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          Phase 1 Quick-Access: Select a role to log in instantly. The full login form will be implemented in Phase 2.
        </p>
        <div className="flex flex-col gap-3">
          {Object.keys(ROLES).map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => handleSimpleLogin(roleKey)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
            >
              Log in as {roleKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
