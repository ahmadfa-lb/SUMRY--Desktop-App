import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';

type LoginFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (username: string) => void;
};

type FormValues = {
  username: string;
  password: string;
};

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm<FormValues>();
  const [loginError, setLoginError] = useState<string>('');

  const onSubmit = async (data: FormValues) => {
    // console.log('Submitting login form with:', data.username, data.password);
    setLoginError(''); // Clear any previous errors
    
    const success = await login(data.username, data.password);
    // console.log('Login success:', success);
    
    if (success) {
      reset();
      setLoginError('');
      if (onLoginSuccess) {
        onLoginSuccess(data.username);
      } else {
        onClose();
      }
    } else {
      setLoginError('❌ Login failed. Please check your credentials. ⚠️ (Remember username and Password are case-sensitive.)');
    }
  };

  const handleInputChange = () => {
    if (loginError) {
      setLoginError(''); // Clear error when user starts typing
    }
    clearErrors(); // Clear form validation errors
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div
        role="dialog"
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg sm:max-w-md"
        tabIndex={-1}
      >
        {/* <!-- Header --> */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-log-in text-[var(--light-green)]"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" x2="3" y1="12" y2="12"></line>
            </svg>
            Login Required
          </h2>
          <p className="text-sm text-[var(--light-green-2)]">
            Please enter your credentials to access SUMRY.
          </p>
        </div>

        {/* <!-- Login Error Display --> */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{loginError}</p>
          </div>
        )}

        {/* <!-- Form --> */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* <!-- Username --> */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="username"
            >
              Username *
            </label>
            <input
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-[var(--light-gray)] focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                errors.username || loginError ? 'border-red-500' : ''
              }`}
              placeholder="Enter your username"
              id="username"
              {...register('username', { 
                required: 'Username is required',
                onChange: handleInputChange
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* <!-- Password --> */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              Password *
            </label>
            <input
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-[var(--light-gray)] focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                errors.password || loginError ? 'border-red-500' : ''
              }`}
              placeholder="Enter your password"
              id="password"
              type="password"
              {...register('password', { 
                required: 'Password is required',
                onChange: handleInputChange
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* <!-- Submit Button --> */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              onClick={() => {
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full bg-[var(--light-green)] text-white hover:bg-[var(--light-green)]/90"
              type="submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-log-in mr-2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" x2="3" y1="12" y2="12"></line>
              </svg>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;