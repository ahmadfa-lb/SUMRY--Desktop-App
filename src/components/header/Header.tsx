import React, { useState } from 'react';
import { Settings, LogOut, CircleUser, Users, Contact, Archive } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SettingsModal from './SettingsModal';


const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setShowLoginForm(true);
  };
  
  const handleOpenCustomerDebts = () => {
    // console.log('Opening Customer Debts Page');
    navigate('/settings/customer-debts');
  };

  const handleOpenCustomerList = () => {
    navigate('/settings/customer-list');
  }

  const handleOpenUsedStock = () => {
    navigate('/used-stock');
  }

  return (
    <>
      <header className="bg-[var(--dark-green)] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo and Title */}
          <div className="flex items-center gap-3 focus:outline-none">
            <img alt="SUMRY" width="140" height="35" decoding="async" data-nimg="1" src={logo}/>
            <span className="text-2xl font-semibold hidden sm:inline">
               Service Center
            </span>
          </div>

          {/* Admin Info and Buttons */}
          <div className="flex items-center gap-3">

            {/* Admin Badge */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-1 text-sm">
                <CircleUser className="w-5 h-5" />
                <span>{user.username}</span>
              </div>
            )}

            {/* Used Stock */}
            <button
              onClick={handleOpenUsedStock}
              title="Used Stock List"
              className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-md text-sm font-medium text-primary-foreground hover:bg-white/20 hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Archive className="w-5 h-5"/>
              <span className="sr-only">used stock</span>
            </button>

            {/* customer list */}
            <button
              onClick={handleOpenCustomerList}
              title="Customer List"
              className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-md text-sm font-medium text-primary-foreground hover:bg-white/20 hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Contact className="w-5 h-5"/>
              <span className="sr-only">customer list</span>
            </button>

            {/* Debt Button */}
            <button
              onClick={handleOpenCustomerDebts}
              title="Customer Debts"
              className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-md text-sm font-medium text-primary-foreground hover:bg-white/20 hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Users className="w-5 h-5" />
              <span className="sr-only">debt</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-md text-sm font-medium text-primary-foreground hover:bg-white/20 hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </button>

            {/* Logout Button */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-md text-sm font-medium text-primary-foreground hover:bg-white/20 hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="sr-only">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Header;