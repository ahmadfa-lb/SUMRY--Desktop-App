import { useState, useEffect } from 'react';
import ShopOverview from './components/ShopOverview'
import CurrentRepairs from './components/CurrentRepairs'
import './App.css'
import Header from './components/header/Header'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import DataManagement from './pages/DataManagement';
import CustomerDebts from './pages/CustomerDebts';
import RepairDetails from './pages/RepairDetails';
import CustomerList from './pages/CustomerList';
import UsedStock from './pages/UsedStock';
import AuthWrapper from './components/AuthWrapper';
import { ShopProvider } from './contexts/ShopContext';
import SolarIntroPage from './pages/SolarIntroPage';
import { useAuthStore } from './store/authStore';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      (window as any).electronAPI.showContextMenu();
    };

    // Add event listener to the document or specific elements
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthWrapper showIntro={showIntro}>
        <ShopProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Only show Header after intro and when authenticated */}
            {!showIntro && isAuthenticated && <Header />}
            <Routes>
              <Route path="/" element={
                showIntro ? (
                  <SolarIntroPage />
                ) : isAuthenticated ? (
                  <main className="flex-grow container mx-auto px-4 py-8">
                    <ShopOverview />
                    <CurrentRepairs />
                  </main>
                ) : (
                  // Show a placeholder or loading screen while waiting for authentication
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-gray-500">Please log in to continue...</div>
                  </div>
                )
              } />
              {/* Protect other routes - only show when authenticated */}
              {isAuthenticated && (
                <>
                  <Route path="settings/data-management" element={<DataManagement />} />
                  <Route path="settings/customer-debts" element={<CustomerDebts />} />
                  <Route path="settings/customer-list" element={<CustomerList />} />
                  <Route path="/repairs/:repairId" element={<RepairDetails />} />
                  <Route path="/used-stock" element={<UsedStock />} />
                </>
              )}
            </Routes>
          </div>
        </ShopProvider>
      </AuthWrapper>
    </Router>
  );
}

export default App;
