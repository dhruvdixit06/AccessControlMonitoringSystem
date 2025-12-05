import React, { useState } from 'react';
import { ViewState } from '../../types';

interface LoginProps {
  onLogin: (role: ViewState) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<ViewState | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        onLogin(selectedRole);
        setIsLoading(false);
    }, 800);
  };

  const roles: { id: ViewState; label: string; description: string; icon: string; color: string }[] = [
    { 
      id: 'APP_MANAGER', 
      label: 'App Manager', 
      description: 'Manage user access, configure applications, and oversee review cycles.', 
      icon: 'manage_accounts',
      color: 'bg-blue-600'
    },
    { 
      id: 'APP_OWNER', 
      label: 'App Owner', 
      description: 'Review access for your specific applications and ensuring compliance.', 
      icon: 'verified_user',
      color: 'bg-purple-600'
    },
    { 
      id: 'BUSINESS_OWNER', 
      label: 'Business Owner', 
      description: 'Final approval authority for access modification requests.', 
      icon: 'fact_check',
      color: 'bg-orange-600'
    },
    { 
      id: 'ADMIN', 
      label: 'System Admin', 
      description: 'System configuration, role management, and global settings.', 
      icon: 'admin_panel_settings',
      color: 'bg-gray-800'
    }
  ];

  if (!selectedRole) {
      return (
        <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
               <span className="material-symbols-outlined text-4xl">lock_person</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Access Control Portal</h2>
            <p className="mt-2 text-lg text-gray-500">Select your role to sign in to the platform.</p>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {roles.map((role) => (
                 <button
                   key={role.id}
                   onClick={() => setSelectedRole(role.id)}
                   className="flex flex-col text-left h-full bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-primary group"
                 >
                   <div className={`h-2 w-full ${role.color}`}></div>
                   <div className="p-6 flex-1 flex flex-col">
                      <div className={`w-12 h-12 rounded-lg ${role.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <span className={`material-symbols-outlined text-2xl ${role.color.replace('bg-', 'text-')}`}>{role.icon}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{role.label}</h3>
                      <p className="mt-2 text-sm text-gray-500">{role.description}</p>
                   </div>
                   <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-primary flex items-center gap-1">
                        Login as {role.label} 
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                   </div>
                 </button>
               ))}
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-400">
             &copy; 2024 Access Control System. All rights reserved.
          </div>
        </div>
      );
  }

  const activeRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button 
           onClick={() => setSelectedRole(null)}
           className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
           <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
           Back to Portal Selection
        </button>
        
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="flex flex-col items-center mb-6">
             <div className={`h-16 w-16 rounded-full ${activeRole?.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined text-3xl ${activeRole?.color.replace('bg-', 'text-')}`}>{activeRole?.icon}</span>
             </div>
             <h2 className="text-2xl font-bold text-gray-900">{activeRole?.label} Login</h2>
             <p className="text-sm text-gray-500 mt-1">Please enter your credentials</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${activeRole?.color || 'bg-primary'} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    </span>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;