import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'gold') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 text-sm border max-w-xs animate-[fadeUp_0.3s_ease] ${
            t.type === 'success' ? 'bg-dark-3 border-green-500/40 text-green-300' :
            t.type === 'error'   ? 'bg-dark-3 border-red-500/40 text-red-300' :
                                   'bg-dark-3 border-gold/30 text-gold'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export default function Toast() { return null; }
