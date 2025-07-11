import { useState } from 'react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (toast) => {
    const id = Date.now();
    const newToast = { ...toast, id, isVisible: true };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return { toasts, showToast, hideToast, clearAllToasts };
};

export default useToast;