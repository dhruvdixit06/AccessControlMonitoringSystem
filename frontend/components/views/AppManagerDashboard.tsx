import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { useData, AccessRecord, Application } from '../context/DataContext';

interface Props {
  onLogout: () => void;
}

const AppManagerDashboard: React.FC<Props> = ({ onLogout }) => {
  const { accessRecords, applications, reviewCycles, addAccessRecord, updateAccessRecord, deleteAccessRecord } = useData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'applications' | 'cycles'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccessRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AccessRecord>>({
    userName: '',
    userEmail: '',
    application: 'Salesforce',
    role: 'Viewer',
    status: 'Active'
  });

  const userProfile = {
    name: 'Alex Doe',
    role: 'App Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi'
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>;
      case 'Maintenance':
        return <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Maintenance</span>;
      case 'Inactive':
        return <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Inactive</span>;
      default:
        return null;
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return accessRecords;
    const q = searchQuery.toLowerCase();
    return accessRecords.filter(user => 
      user.userName.toLowerCase().includes(q) || 
      user.userEmail.toLowerCase().includes(q) ||
      user.application.toLowerCase().includes(q)
    );
  }, [accessRecords, searchQuery]);

  // Handlers
  const handleAddUser = () => {
    setFormData({ userName: '', userEmail: '', application: 'Salesforce', role: 'Viewer', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: AccessRecord) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: AccessRecord) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const submitAddUser = () => {
    const newUser: AccessRecord = {
      id: Date.now().toString(),
      userName: formData.userName || 'New User',
      userEmail: formData.userEmail || '',
      userAvatar: 'https://ui-avatars.com/api/?background=random&name=' + (formData.userName || 'User'),
      application: formData.application as string,
      role: formData.role as string,
      manager: 'John Doe', // Default for prototype
      lastLogin: new Date().toISOString().split('T')[0],
      status: formData.status as 'Active' | 'Inactive',
      reviewStatus: 'Pending',
      history: []
    };
    addAccessRecord(newUser);
    setIsAddModalOpen(false);
  };

  const submitEditUser = () => {
    if (selectedUser) {
      updateAccessRecord({ ...selectedUser, ...formData } as AccessRecord);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const submitDeleteUser = () => {
    if (selectedUser) {
      deleteAccessRecord(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex h-full w-full bg-background-light">
      <Sidebar
        title="Access Control"
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
            icon: 'group', 
            label: 'User Management', 
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
        <Header 
          avatarUrl={userProfile.avatar} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {/* Page Heading */}
              <div>
                <h1 className="text-text-light-primary text-3xl md:text-4xl font-black">Welcome, Alex!</h1>
                <p className="text-text-light-secondary text-base font-normal mt-2">Here’s a summary of your pending tasks and review progress.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Status Card */}
                <div className="bg-surface-light p-6 rounded-xl border border-border-light flex flex-col shadow-sm">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h2 className="text-text-light-primary text-[22px] font-bold leading-tight">Current Quarterly Review (Q3 2024)</h2>
                      <p className="text-text-light-secondary text-sm mt-1">75% of reviews are complete.</p>
                    </div>
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                      <span>View Details</span>
                    </button>
                  </div>
                  
                  <div className="w-full bg-background-light rounded-full h-2.5 mt-4 overflow-hidden">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Total Access Records</p>
                      <p className="text-text-light-primary text-2xl font-bold">{accessRecords.length}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Pending to App Owner</p>
                      <p className="text-text-light-primary text-2xl font-bold">
                        {accessRecords.filter(r => r.reviewStatus === 'Pending').length}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Pending to Business Owner</p>
                      <p className="text-text-light-primary text-2xl font-bold">
                        {accessRecords.filter(r => ['Retained', 'Revoked', 'Modified'].includes(r.reviewStatus)).length}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Completed</p>
                      <p className="text-green-500 text-2xl font-bold">
                        {accessRecords.filter(r => ['Approved', 'Rejected'].includes(r.reviewStatus)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Managed Applications Table */}
              <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden shadow-sm">
                <div className="p-6">
                  <h2 className="text-text-light-primary text-[22px] font-bold leading-tight">My Managed Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-border-light bg-background-light">
                      <tr>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Application Name</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">User Count</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Review Status</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Last Updated</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-border-light last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-light-primary whitespace-nowrap">{app.name}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.users}</td>
                          <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.lastUpdated}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentView === 'users' ? (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
               {/* User Management View */}
               <div>
                <h1 className="text-text-light-primary text-2xl font-bold">User Access Management</h1>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                   <p className="text-text-light-secondary text-sm font-medium">Total Users</p>
                   <p className="text-text-light-primary text-3xl font-bold mt-2">{accessRecords.length}</p>
                   <p className="text-green-500 text-xs font-medium mt-1">+5.2% this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                   <p className="text-text-light-secondary text-sm font-medium">Active Applications</p>
                   <p className="text-text-light-primary text-3xl font-bold mt-2">{applications.length}</p>
                   <p className="text-green-500 text-xs font-medium mt-1">+1.5% this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                   <p className="text-text-light-secondary text-sm font-medium">Pending Reviews</p>
                   <p className="text-orange-500 text-3xl font-bold mt-2">{accessRecords.filter(r => r.reviewStatus === 'Pending').length}</p>
                   <p className="text-text-light-secondary text-xs font-medium mt-1">+12% this week</p>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined text-xl">filter_list</span>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined text-xl">download</span>
                      </button>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-2 text-gray-400 text-lg">search</span>
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                   </div>
                   <button 
                    onClick={handleAddUser}
                    className="flex items-center gap-1 bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors w-full sm:w-auto justify-center"
                   >
                     <span className="material-symbols-outlined text-lg">add</span>
                     Add User
                   </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Application Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={user.userAvatar} alt="" className="w-8 h-8 rounded-full" />
                              <span className="text-sm font-medium text-gray-900">{user.userName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userEmail}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.application}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="p-1 text-gray-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentView === 'applications' ? (
             <div className="max-w-7xl mx-auto flex flex-col gap-8">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">Applications</h1>
                  <p className="text-gray-500 mt-1">Manage and overview all applications under your purview.</p>
               </div>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Application</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Users</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Last Updated</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 font-medium">{app.name}</td>
                          <td className="px-6 py-4 text-gray-500">{app.users}</td>
                          <td className="px-6 py-4 text-gray-500">{app.lastUpdated}</td>
                          <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">Review Cycles</h1>
                  <p className="text-gray-500 mt-1">History and status of access review campaigns.</p>
               </div>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Cycle Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Progress</th>
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700">Application</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.application}
                    onChange={(e) => setFormData({...formData, application: e.target.value})}
                  >
                    {applications.map(app => (
                        <option key={app.id} value={app.name}>{app.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={submitAddUser}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700">Application</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.application}
                    onChange={(e) => setFormData({...formData, application: e.target.value})}
                  >
                    {applications.map(app => (
                        <option key={app.id} value={app.name}>{app.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={submitEditUser}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fade-in text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <span className="material-symbols-outlined text-red-600">warning</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <strong>{selectedUser.userName}</strong>? This action cannot be undone.
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

export default AppManagerDashboard;
