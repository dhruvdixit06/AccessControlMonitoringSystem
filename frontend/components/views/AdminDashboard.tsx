import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { useData, SystemUser, Application } from '../context/DataContext';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const { systemUsers, applications, reviewCycles, addSystemUser, updateSystemUser, deleteSystemUser, addApplication } = useData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'applications' | 'cycles'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  
  // Application Modal State
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

  // Form State for Users
  const [formData, setFormData] = useState<Partial<SystemUser>>({
    name: '',
    email: '',
    role: 'App Manager',
    department: '',
    status: 'Active'
  });

  // Form State for Applications
  const [appFormData, setAppFormData] = useState<Partial<Application>>({
    name: '',
    owner: '',
    status: 'Active',
    users: 0
  });

  const userProfile = {
    name: 'System Admin',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=111827&color=fff'
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: systemUsers.length,
      appManagers: systemUsers.filter(u => u.role === 'App Manager').length,
      appOwners: systemUsers.filter(u => u.role === 'App Owner').length,
      businessOwners: systemUsers.filter(u => u.role === 'Business Owner').length,
    };
  }, [systemUsers]);

  // Filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return systemUsers;
    const q = searchQuery.toLowerCase();
    return systemUsers.filter(user => 
      user.name.toLowerCase().includes(q) || 
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  }, [systemUsers, searchQuery]);

  // Handlers for Users
  const handleAddUser = () => {
    setFormData({ name: '', email: '', role: 'App Manager', department: '', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const submitAddUser = () => {
    const newUser: SystemUser = {
      id: Date.now().toString(),
      name: formData.name || 'New User',
      email: formData.email || '',
      avatarUrl: 'https://ui-avatars.com/api/?background=random&name=' + (formData.name || 'User'),
      role: formData.role as SystemUser['role'],
      department: formData.department || 'General',
      status: formData.status as 'Active' | 'Inactive',
      lastLogin: 'Never'
    };
    addSystemUser(newUser);
    setIsAddModalOpen(false);
  };

  const submitEditUser = () => {
    if (selectedUser) {
      updateSystemUser({ ...selectedUser, ...formData } as SystemUser);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const submitDeleteUser = () => {
    if (selectedUser) {
      deleteSystemUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Handlers for Applications
  const handleAddApplication = () => {
    setAppFormData({ name: '', owner: '', status: 'Active', users: 0 });
    setIsAddAppModalOpen(true);
  };

  const submitAddApplication = () => {
    const newApp: Application = {
      id: Date.now().toString(),
      name: appFormData.name || 'New Application',
      owner: appFormData.owner || 'Unassigned',
      users: Number(appFormData.users) || 0,
      status: (appFormData.status as any) || 'Active',
      lastUpdated: 'Just now'
    };
    addApplication(newApp);
    setIsAddAppModalOpen(false);
  };

  return (
    <div className="flex h-full w-full bg-background-light">
      <Sidebar
        title="Access Admin"
        user={userProfile}
        onLogout={onLogout}
        menuItems={[
          { 
            icon: 'dashboard', 
            label: 'Dashboard', 
            active: currentView === 'dashboard', 
            filled: currentView === 'dashboard',
            onClick: () => setCurrentView('dashboard') 
          },
          { 
            icon: 'manage_accounts', 
            label: 'Role Management', 
            active: currentView === 'users', 
            filled: currentView === 'users',
            onClick: () => setCurrentView('users') 
          },
          { 
            icon: 'apps', 
            label: 'Applications', 
            active: currentView === 'applications', 
            filled: currentView === 'applications',
            onClick: () => setCurrentView('applications') 
          },
          { 
            icon: 'autorenew', 
            label: 'Review Cycles', 
            active: currentView === 'cycles', 
            filled: currentView === 'cycles',
            onClick: () => setCurrentView('cycles') 
          },
        ]}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header avatarUrl={userProfile.avatar} />
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 p-2 bg-white border-b overflow-x-auto">
           <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Dashboard</button>
           <button onClick={() => setCurrentView('users')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'users' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Roles</button>
           <button onClick={() => setCurrentView('applications')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'applications' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Applications</button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              <div>
                <h1 className="text-text-light-primary text-3xl md:text-4xl font-black">Admin Overview</h1>
                <p className="text-text-light-secondary text-base font-normal mt-2">Manage access and roles for the Access Control application.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                   <p className="text-text-light-secondary text-sm font-medium">Total Managers</p>
                   <p className="text-text-light-primary text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm border-l-4 border-l-blue-500">
                   <p className="text-text-light-secondary text-sm font-medium">App Managers</p>
                   <p className="text-blue-600 text-3xl font-bold mt-2">{stats.appManagers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm border-l-4 border-l-purple-500">
                   <p className="text-text-light-secondary text-sm font-medium">App Owners</p>
                   <p className="text-purple-600 text-3xl font-bold mt-2">{stats.appOwners}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm border-l-4 border-l-orange-500">
                   <p className="text-text-light-secondary text-sm font-medium">Business Owners</p>
                   <p className="text-orange-600 text-3xl font-bold mt-2">{stats.businessOwners}</p>
                </div>
              </div>

              {/* Recent Activity Table (Mock) */}
              <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">System Health & Activity</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <span>System is operational. All services running.</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-blue-500">schedule</span>
                    <span>Last backup completed 3 hours ago.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'users' ? (
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div>
                <h1 className="text-text-light-primary text-2xl font-bold">Role Management</h1>
                <p className="text-gray-500 mt-1">Create and manage accounts for App Managers, App Owners, and Business Owners.</p>
              </div>

              {/* Toolbar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-2 top-2.5 text-gray-400">search</span>
                  <input 
                    type="text" 
                    placeholder="Search roles..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAddUser}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add New Role
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Last Login</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'App Manager' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'App Owner' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'Business Owner' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="p-1 text-gray-400 hover:text-primary"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentView === 'applications' ? (
             <div className="max-w-7xl mx-auto flex flex-col gap-6">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">System Applications</h1>
                  <p className="text-gray-500 mt-1">Global registry of all applications managed in the system.</p>
               </div>
               
               {/* Applications Toolbar */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-2 top-2.5 text-gray-400">search</span>
                    <input 
                      type="text" 
                      placeholder="Search applications..." 
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full"
                    />
                  </div>
                  <button 
                    onClick={handleAddApplication}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">add_box</span>
                    Add Application
                  </button>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Application</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">App Owner</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Active Users</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-medium">{app.name}</td>
                          <td className="px-6 py-4 text-gray-500">{app.owner}</td>
                          <td className="px-6 py-4 text-gray-500">{app.users}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
             </div>
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">Review Cycle Config</h1>
                  <p className="text-gray-500 mt-1">Configure and monitor system-wide review cycles.</p>
               </div>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Cycle Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviewCycles.map((cycle, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-medium">{cycle.name}</td>
                          <td className="px-6 py-4 text-gray-500">{cycle.startDate} - {cycle.endDate}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cycle.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {cycle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${cycle.progress}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-500">{cycle.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          )}
        </main>
      </div>

      {/* User Role Modals */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">{isAddModalOpen ? 'Add New Role' : 'Edit Role'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Type</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as SystemUser['role']})}
                >
                  <option value="App Manager">App Manager</option>
                  <option value="App Owner">App Owner</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={isAddModalOpen ? submitAddUser : submitEditUser}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
              >
                {isAddModalOpen ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Add New Application</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={appFormData.name}
                  onChange={(e) => setAppFormData({...appFormData, name: e.target.value})}
                  placeholder="e.g. Salesforce, Jira"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">App Owner</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={appFormData.owner}
                  onChange={(e) => setAppFormData({...appFormData, owner: e.target.value})}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Users</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={appFormData.users}
                  onChange={(e) => setAppFormData({...appFormData, users: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={appFormData.status}
                  onChange={(e) => setAppFormData({...appFormData, status: e.target.value as any})}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddAppModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={submitAddApplication}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fade-in text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <span className="material-symbols-outlined text-red-600">warning</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Role?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <strong>{selectedUser.name}</strong> ({selectedUser.role})? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={submitDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
