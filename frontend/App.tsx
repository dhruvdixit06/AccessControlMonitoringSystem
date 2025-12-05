import React, { useState } from 'react';
import { ViewState } from './types';
import AppManagerDashboard from './components/views/AppManagerDashboard';
import ReportingManagerReview from './components/views/ReportingManagerReview';
import BusinessOwnerApprovals from './components/views/BusinessOwnerApprovals';
import AdminDashboard from './components/views/AdminDashboard';
import Login from './components/views/Login';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');

  const handleLogin = (role: ViewState) => {
    setCurrentView(role);
  };

  const handleLogout = () => {
    setCurrentView('LOGIN');
  };

  const renderView = () => {
    switch (currentView) {
      case 'LOGIN':
        return <Login onLogin={handleLogin} />;
      case 'APP_MANAGER':
        return <AppManagerDashboard />;
      case 'REPORTING_MANAGER':
        return <ReportingManagerReview />;
      case 'BUSINESS_OWNER':
        return <BusinessOwnerApprovals />;
      case 'ADMIN':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Dev Navigation Switcher - Only visible when not in Login */}
      {currentView !== 'LOGIN' && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 p-2 bg-white border border-gray-200 rounded-full shadow-lg">
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-xs font-bold rounded-full transition-colors bg-red-100 text-red-600 hover:bg-red-200"
          >
            Logout
          </button>
          <button
            onClick={() => setCurrentView('APP_MANAGER')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'APP_MANAGER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            App Manager
          </button>
          <button
            onClick={() => setCurrentView('REPORTING_MANAGER')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'REPORTING_MANAGER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            App Owner
          </button>
          <button
            onClick={() => setCurrentView('BUSINESS_OWNER')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'BUSINESS_OWNER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            Business Owner
          </button>
          <button
            onClick={() => setCurrentView('ADMIN')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'ADMIN' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            Admin
          </button>
        </div>
      )}

      {renderView()}
    </div>
  );
};

export default App;