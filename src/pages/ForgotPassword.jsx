import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Forgot Password</h2>
        <p className="text-slate-500 text-sm mb-6">
          Password recovery form will be implemented in Phase 2.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
