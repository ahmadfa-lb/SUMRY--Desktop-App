import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import LoginForm from './LoginForm';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

type AuthWrapperProps = {
  children: React.ReactNode;
  showIntro: boolean;
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, showIntro }) => {
  const { isAuthenticated } = useAuthStore();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { toasts, showToast, hideToast } = useToast();

  useEffect(() => {
    setShowLoginForm(!showIntro && !isAuthenticated);
  }, [showIntro, isAuthenticated]);

  const handleLoginSuccess = (username: string) => {
    setShowLoginForm(false);
    showToast({
      type: 'success',
      title: 'Login Successful',
      description: `Welcome back! ${username}`,
    });
  };

  return (
    <>
      {showLoginForm && (
        <LoginForm 
          isOpen={showLoginForm} 
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      <div className={showLoginForm ? 'pointer-events-none blur-sm' : ''}>
        {children}
      </div>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
};

export default AuthWrapper;