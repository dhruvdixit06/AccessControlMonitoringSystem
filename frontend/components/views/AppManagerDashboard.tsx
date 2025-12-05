import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { Application } from '../../types';

import { api, ApiUser, ApiApplication, ApiRole } from '../../api';

// Reuse ApiUser as our internal type, or extend it
type AppManagerUser = ApiUser & { businessUserId?: string };

const AppManagerDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'users'>('users'); // Default to users for testing
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppManagerUser | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AppManagerUser>>({
    name: '',
    email: '',
    businessUserId: '',
    application: 'Salesforce',
    role: 'Viewer',
    status: 'Active'
  });

  const userProfile = {
    name: 'Alex Doe',
    role: 'App Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi'
  };


  const [users, setUsers] = useState<AppManagerUser[]>([]);
  const [dbApplications, setDbApplications] = useState<ApiApplication[]>([]);
  const [dbRoles, setDbRoles] = useState<ApiRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // data fetching
  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      const [usersData, appsData, rolesData] = await Promise.all([
        api.getAppManagerUsers(),
        api.getApplications(),
        api.getRoles()
      ]);
      setUsers(usersData);
      setDbApplications(appsData);
      setDbRoles(rolesData);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    refreshUsers();
  }, []);

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">In Progress</span>;
      case 'Not Started':
        return <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Not Started</span>;
      default:
        return null;
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.application.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Handlers
  // Handlers
  const handleAddUser = () => {
    // Generate random ID, e.g., EXTA + 5 random digits or timestamp
    const randomId = `EXTA${Math.floor(10000 + Math.random() * 90000)}`;
    setFormData({ name: '', email: '', businessUserId: randomId, application: 'Salesforce', role: 'Viewer', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: AppManagerUser) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: AppManagerUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const submitAddUser = async () => {
    try {
      // Map frontend camelCase to backend snake_case if needed, or rely on loose matching.
      // Our API client sends JSON stringify of formData.
      // Backend expects: business_user_id. Frontend has: businessUserId.
      // We need to map it.
      const payload = {
        ...formData,
        business_user_id: formData.businessUserId
      };
      await api.createUser(payload);
      await refreshUsers();
      setIsAddModalOpen(false);
    } catch (e) {
      alert("Failed to create user. Ensure Application exists in DB (e.g. 'Salesforce')");
    }
  };

  const submitEditUser = () => {
    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } as AppManagerUser : u));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const submitDeleteUser = async () => {
    if (selectedUser) {
      try {
        await api.deleteUser(selectedUser.id);
        await refreshUsers();
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } catch (e) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-background-light">
      <Sidebar
        title="Access Control"
        user={userProfile}
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
          { icon: 'apps', label: 'Applications' },
          { icon: 'autorenew', label: 'Review Cycles' },
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
                      <p className="text-text-light-secondary text-sm">Pending Your Review</p>
                      <p className="text-yellow-500 text-2xl font-bold">12</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Pending to Reporting Manager</p>
                      <p className="text-text-light-primary text-2xl font-bold">25</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Pending to Business Owner</p>
                      <p className="text-text-light-primary text-2xl font-bold">8</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-text-light-secondary text-sm">Completed</p>
                      <p className="text-green-500 text-2xl font-bold">135</p>
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
                      {dbApplications.map((app) => (
                        <tr key={app.id} className="border-b border-border-light last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-light-primary whitespace-nowrap">{app.name}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.userCount}</td>
                          <td className="px-6 py-4">{getStatusBadge((app.status as any) || 'Not Started')}</td>
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
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {/* User Management View */}
              <div>
                <h1 className="text-text-light-primary text-2xl font-bold">User Access Management</h1>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                  <p className="text-text-light-secondary text-sm font-medium">Total Users</p>
                  <p className="text-text-light-primary text-3xl font-bold mt-2">1,250</p>
                  <p className="text-green-500 text-xs font-medium mt-1">+5.2% this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                  <p className="text-text-light-secondary text-sm font-medium">Active Applications</p>
                  <p className="text-text-light-primary text-3xl font-bold mt-2">42</p>
                  <p className="text-green-500 text-xs font-medium mt-1">+1.5% this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
                  <p className="text-text-light-secondary text-sm font-medium">Pending Reviews</p>
                  <p className="text-orange-500 text-3xl font-bold mt-2">18</p>
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
                              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                              <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.application}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.application}
                    onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                  >
                    <option value="Salesforce">Salesforce</option>
                    <option value="Jira">Jira</option>
                    <option value="Confluence">Confluence</option>
                    <option value="Zendesk">Zendesk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={formData.application}
                    onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                  >
                    <option value="" disabled>Select Application</option>
                    {dbApplications.map(app => (
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
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
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
              Are you sure you want to remove <strong>{selectedUser.name}</strong>? This action cannot be undone.
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