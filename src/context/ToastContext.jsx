import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast floating overlay container */}
      <div className="fixed bottom-5 right-5 space-y-3 z-[9999] max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-md bg-white animate-slide-in transition-all ${
              toast.type === 'success' ? 'border-emerald-200 text-emerald-900 bg-emerald-50/50' :
              toast.type === 'error' ? 'border-rose-200 text-rose-900 bg-rose-50/50' :
              'border-blue-200 text-blue-900 bg-blue-50/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold">{toast.message}</div>
            
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-0.5 hover:bg-slate-200/50 rounded text-slate-400 hover:text-slate-650 transition-colors flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
