import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  }, []);

  return { toast, showToast };
};

const Toast = ({ message, type = 'success' }) => {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
      type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
    }`}>
      <span>{type === 'error' ? '✕' : '✓'}</span>
      {message}
    </div>
  );
};

export default Toast;
