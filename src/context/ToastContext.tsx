"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`
                flex items-center gap-4 min-w-[320px] p-4 rounded-2xl glass border border-white/5 shadow-2xl
                ${toast.type === 'success' ? 'bg-green-400/10 border-green-400/20' : 
                  toast.type === 'error' ? 'bg-red-400/10 border-red-400/20' : 
                  'bg-gold/10 border-gold/20'}
              `}
            >
              <div className={`
                p-2 rounded-xl
                ${toast.type === 'success' ? 'text-green-400 bg-green-400/10' : 
                  toast.type === 'error' ? 'text-red-400 bg-red-400/10' : 
                  'text-gold bg-gold/10'}
              `}>
                {toast.type === 'success' && <CheckCircle2 size={20} />}
                {toast.type === 'error' && <AlertCircle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
              </div>
              <p className="flex-1 text-sm font-bold tracking-tight text-white/80">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
