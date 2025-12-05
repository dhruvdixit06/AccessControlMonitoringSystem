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
        return <AppManagerDashboard onLogout={handleLogout} />;
      case 'APP_OWNER':
        return <ReportingManagerReview onLogout={handleLogout} />;
      case 'BUSINESS_OWNER':
        return <BusinessOwnerApprovals onLogout={handleLogout} />;
      case 'ADMIN':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {renderView()}
    </div>
  );
};

export default App;