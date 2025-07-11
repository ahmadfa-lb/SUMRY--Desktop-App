import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts, onHideToast }) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastContainer;