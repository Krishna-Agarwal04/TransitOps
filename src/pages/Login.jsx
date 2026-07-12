import React, { useState } from 'react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Truck, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export default function Login() {
  const { login, ROLES } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.FLEET_MANAGER);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        login(email, password, role);
        setIsLoading(false);
        navigate('/dashboard');
      } catch (err) {
        setIsLoading(false);
        setError('Invalid credentials. Please try again.');
      }
    }, 800);
  };

  const handleQuickFill = (selectedRole) => {
    const emailMap = {
      [ROLES.FLEET_MANAGER]: 'manager@transitops.com',
      [ROLES.DRIVER]: 'driver@transitops.com',
      [ROLES.SAFETY_OFFICER]: 'safety@transitops.com',
      [ROLES.FINANCIAL_ANALYST]: 'finance@transitops.com',
    };
    setEmail(emailMap[selectedRole]);
    setPassword('Password123');
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">TransitOps</h2>
        </div>
        <p className="text-center text-xs text-slate-500 font-semibold tracking-wider uppercase mb-8">
          Smart Transport Operations Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 rounded-xl sm:px-10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Sign in to your account</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Authorized Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                {Object.keys(ROLES).map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_LABELS[roleKey]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prefill Section for Evaluators */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Demo Quick-Fill Credentials</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(ROLES).map((roleKey) => (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleQuickFill(roleKey)}
                  className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-md text-[10px] font-semibold text-slate-600 transition-colors text-left truncate"
                >
                  {ROLE_LABELS[roleKey]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
