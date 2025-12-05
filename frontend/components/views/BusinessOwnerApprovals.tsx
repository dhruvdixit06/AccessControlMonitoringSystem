import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

interface BusinessOwnerUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  application: string;
  currentAccess: string;
  recommendation: 'Retain' | 'Revoke' | 'Modify';
  manager: string;
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  lastAction?: string;
  lastModified?: string;
}

const BusinessOwnerApprovals: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'approvals' | 'history'>('dashboard');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('All Applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const userProfile = {
    name: 'Sarah Jenkins',
    role: 'Business Owner',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvIu33i4kuKMrKDEtDZrk_UqFvheBtGrxlTAoCl-pHYHkyO3DQd5QdVbB6uxOAdHrsvLTHKxATF86ei6nDpac5AfiBJ5RU8Rf990e__IQmgbnqiJ5x1sq8DFYRBeNrzaQlKfcWPWgCu12yPp8YChlYbDBWZ7s54Gw-fvMAngONkRubSJEq33xnHF7gIEspIj6LDrfDxfwTBZD4j0RpU-O5537ijLN_kRyedl1hrZnfLeSD-oW5kunTPMicAoMwyAVmGDzRHOvPtGYJ'
  };

  const initialUsers: BusinessOwnerUser[] = [
    {
      id: '1', name: 'John Smith', email: 'john.smith@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvl4_DI6mBC4fL0oC7767yj2okOnjVqvDbDl6oemo0hfAHJizUeJE0u-QJ09UqNFwDMf4H3me6dkjlWlUnaglonjEiGOJqYFXeJ0D_FFHM8oGNMCdJW9hAtqH8fmnLISv0D_NIanTtBVxqfnCgnKNl8233kLfEj3QlnnzpA62kvfNpwfn3BKRx6W38Brqg_jXNgHFGKtT4KfRj_l3FhZxIdQMaIqGWjRXRY8o53XyQVu0o3yVnPsOTdziHSKAq_PLT-a0EJuLmv-GP',
      application: 'Salesforce', currentAccess: 'Admin', recommendation: 'Retain', manager: 'Mike Ross', dateSubmitted: '2023-10-26', status: 'Pending'
    },
    {
      id: '2', name: 'Maria Garcia', email: 'maria.garcia@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQUf64SR95clQCKekMgbrHDgWeeZ-tj2CLxWlSEg4nZow2gn369L4KWLXorrv2KoNVpGl1UGP-dpAG21eCDpXTwhVvjHGAfRrmQsEryclvdXUH1qPq9m6EQPqorXm-fe6ZNwq14zZUZE3E0k9diC4Zur9ZX_RdZybbGEt37aTO16SDifG4Mb8aSl4ZzQ033-YeB4tL9IGh2Gc_QQcKtZ6jfAkpR0fNIWAar2nhlF5-aR2nIbq7gRd2zwSriIsF8PGXK4VRV1AAlzth',
      application: 'Jira', currentAccess: 'Developer', recommendation: 'Revoke', manager: 'David Chen', dateSubmitted: '2023-10-25', status: 'Pending'
    },
    {
      id: '3', name: 'Chen Wei', email: 'chen.wei@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiTnHvIb3IjbeO45-mDoOrfVzA2HjtpVpzVGNwqVi6NSljUwnAOPwihA3PdnTfRUkcQGFOP92ZaOzrYnCgbGV7YUgYeLEulROa0fHpkVHrtbCjMBqE6HROGsH97ch5NF6jCUIqKNVaCCzLK5IpNGEi5Sa_HDrDR3nG5n21l350Q_EWSSMXuhGCz32541eV4AT4Ft8f2-nUvqwDZYDmiMbErMaEXpZ_4NjoBGFPXw5iVRSEjXhM0SlrNanEKTjPnuSVarrONPE4ERcc',
      application: 'GitHub', currentAccess: 'Read-Only', recommendation: 'Retain', manager: 'Mike Ross', dateSubmitted: '2023-10-24', status: 'Pending'
    },
    {
      id: '4', name: 'Sarah Connor', email: 'sarah.c@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqNknuB3X-ABZ9l_J8ylyq59nQegwV9h9ROwgYxoTXqIWmO1Rotw04uawPNa2qXWGYhFBkGRps-3wmkVwwcGLKVrP3BjBczPlBOiQAv6CjkPolDV8DjOPmUFe_b7oEgzyw1L4fAaUuYesPGu6gC25IaLEOp6NuArDR47aOmgUqrgj0AObD0MWUGTmrG4LlGxzEo5sT4xqWHlkbuK8QpJuBngOi5y0hZ5rBI3cTjrw7DyDh2aKziKnbghTmYeQM4eRjIyuKlDmD_kr',
      application: 'Salesforce', currentAccess: 'Viewer', recommendation: 'Modify', manager: 'David Chen', dateSubmitted: '2023-10-23', status: 'Pending'
    },
  ];

  const initialHistory: BusinessOwnerUser[] = [
    {
      id: 'h1', name: 'Alex Murphy', email: 'alex.m@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi',
      application: 'Jira', currentAccess: 'Admin', recommendation: 'Revoke', manager: 'David Chen', dateSubmitted: '2023-10-20', status: 'Approved', lastAction: 'Approved Revocation', lastModified: 'Oct 22, 2024'
    },
    {
      id: 'h2', name: 'Lisa Ann', email: 'lisa.a@example.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3j4qcYNrSl_8rtn9FJ8NZHlJshHZbE_ZAF2HElYOUgo4BbYsqJDiHd8WbpS2F9yiwvY5ylQEZYCVGmKXgy0YwnnGsJwRQmyINkNEXVCsZV-kfbf2JHTaqGLxSe1BVzsI5PpqIoaJLfZZgHcSrMb7gRSN2Vq-jUA8W6RiUbexvQyD3Bvk-wORQrTXNJBzPBxRowMjEGE4FoVOS7GoIm4QDYtVkgf5ylqKINaEZolYqboQYuEkaLNKqywsXVsXYWAoprNhIlHGSuEJE',
      application: 'Salesforce', currentAccess: 'Viewer', recommendation: 'Retain', manager: 'Mike Ross', dateSubmitted: '2023-10-18', status: 'Approved', lastAction: 'Approved Retention', lastModified: 'Oct 21, 2024'
    }
  ];

  const [users, setUsers] = useState<BusinessOwnerUser[]>(initialUsers);
  const [history, setHistory] = useState<BusinessOwnerUser[]>(initialHistory);

  // Derived Statistics for Dashboard
  const applications = useMemo(() => {
    const apps = Array.from(new Set(users.map(u => u.application)));
    return apps.map(appName => {
      const appUsers = users.filter(u => u.application === appName);
      return {
        name: appName,
        count: appUsers.length,
        status: appUsers.length > 0 ? 'Pending' : 'Completed'
      };
    });
  }, [users]);

  const totalToReview = users.length;
  const totalReviewed = history.length;

  // Filter Logic
  const filteredData = useMemo(() => {
    let data = currentView === 'history' ? history : users;

    if (selectedAppFilter !== 'All Applications') {
      data = data.filter(u => u.application === selectedAppFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.application.toLowerCase().includes(q)
      );
    }
    return data;
  }, [currentView, history, users, selectedAppFilter, searchQuery]);

  // Actions
  const updateHistory = (item: BusinessOwnerUser, action: string) => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const historyItem: BusinessOwnerUser = {
      ...item,
      status: action === 'Approve' ? 'Approved' : 'Rejected',
      lastAction: `${action}d ${item.recommendation}`,
      lastModified: date
    };
    setHistory(prev => [historyItem, ...prev]);
  };

  const handleAction = (id: string, action: 'Approve' | 'Reject') => {
    const user = users.find(u => u.id === id);
    if (user) {
      updateHistory(user, action);
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Update selection if exists
      if (selectedUserIds.has(id)) {
        const newSet = new Set(selectedUserIds);
        newSet.delete(id);
        setSelectedUserIds(newSet);
      }
    }
  };

  const handleBulkAction = (action: 'Approve' | 'Reject') => {
    const selectedUsers = users.filter(u => selectedUserIds.has(u.id));
    selectedUsers.forEach(u => updateHistory(u, action));
    setUsers(prev => prev.filter(u => !selectedUserIds.has(u.id)));
    setSelectedUserIds(new Set());
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredData.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUserIds(newSelected);
  };

  const navigateToApprovals = (appName?: string) => {
    if (appName) setSelectedAppFilter(appName);
    setSearchQuery(''); 
    setCurrentView('approvals');
  };

  const isAllSelected = filteredData.length > 0 && selectedUserIds.size === filteredData.length;

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
            icon: 'fact_check', 
            label: 'Approvals', 
            active: currentView === 'approvals', 
            filled: currentView === 'approvals',
            onClick: () => {
               setSearchQuery('');
               setSelectedUserIds(new Set());
               setCurrentView('approvals');
            }
          },
          { 
            icon: 'history', 
            label: 'History', 
            active: currentView === 'history', 
            filled: currentView === 'history',
            onClick: () => {
               setSearchQuery('');
               setSelectedUserIds(new Set());
               setCurrentView('history');
            }
          },
        ]}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header avatarUrl={userProfile.avatar} />

        {/* Navigation override for small screens */}
        <div className="md:hidden flex gap-2 p-2 bg-white border-b">
           <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 rounded ${currentView === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Dashboard</button>
           <button onClick={() => setCurrentView('approvals')} className={`px-3 py-1 rounded ${currentView === 'approvals' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Approvals</button>
           <button onClick={() => setCurrentView('history')} className={`px-3 py-1 rounded ${currentView === 'history' ? 'bg-primary text-white' : 'bg-gray-100'}`}>History</button>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              <div>
                <h1 className="text-text-light-primary text-3xl md:text-4xl font-black">Welcome, {userProfile.name.split(' ')[0]}!</h1>
                <p className="text-text-light-secondary text-base font-normal mt-2">Overview of access modification requests pending your approval.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-surface-light p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-2">
                    <p className="text-text-light-secondary text-sm font-medium">Application Count</p>
                    <p className="text-text-light-primary text-3xl font-bold">{applications.length}</p>
                 </div>
                 <div className="bg-surface-light p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-2">
                    <p className="text-text-light-secondary text-sm font-medium">Total Users to Review</p>
                    <p className="text-primary text-3xl font-bold">{totalToReview}</p>
                 </div>
                 <div className="bg-surface-light p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-2">
                    <p className="text-text-light-secondary text-sm font-medium">Total Reviewed</p>
                    <p className="text-green-500 text-3xl font-bold">{totalReviewed}</p>
                 </div>
              </div>

              {/* Applications Overview Table */}
              <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-light">
                  <h2 className="text-text-light-primary text-xl font-bold">Pending Approvals by Application</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Application Name</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Pending Requests</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Status</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((app) => (
                        <tr key={app.name} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-light-primary">{app.name}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.count}</td>
                          <td className="px-6 py-4">
                            {app.count > 0 ? (
                              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pending Action</span>
                            ) : (
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Up to Date</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => navigateToApprovals(app.name)}
                              className="text-primary hover:text-primary-dark font-medium text-sm"
                            >
                              View Requests
                            </button>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No applications pending review.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div>
                <h1 className="text-text-light-primary text-2xl md:text-3xl font-bold">
                  {currentView === 'history' ? 'Approval History' : 'Pending Approvals'}
                </h1>
                <p className="text-text-light-secondary text-base mt-1">
                  {currentView === 'history' 
                    ? 'Log of all processed access requests.' 
                    : 'Review and approve access recommendations from Reporting Managers.'}
                </p>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                   {/* Application Filter */}
                   <select 
                      value={selectedAppFilter}
                      onChange={(e) => setSelectedAppFilter(e.target.value)}
                      className="block w-full sm:w-48 rounded-lg border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="All Applications">All Applications</option>
                      {Array.from(new Set([...initialUsers, ...history].map(u => u.application))).map(appName => (
                        <option key={appName} value={appName}>{appName}</option>
                      ))}
                    </select>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                      </div>
                      <input 
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 pl-10 py-2 text-sm text-gray-900 focus:border-primary focus:ring-primary" 
                        placeholder="Search users..." 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                </div>

                {currentView === 'approvals' && selectedUserIds.size > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkAction('Reject')}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                    >
                      Reject Selected ({selectedUserIds.size})
                    </button>
                    <button 
                      onClick={() => handleBulkAction('Approve')}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                    >
                      Approve Selected ({selectedUserIds.size})
                    </button>
                  </div>
                )}
              </div>

              {/* Main List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {currentView === 'approvals' && (
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 w-10">
                            <input 
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              checked={isAllSelected}
                              onChange={toggleSelectAll}
                            />
                          </th>
                        )}
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Application</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Current Role</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Recommendation</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Submitted By</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                           {currentView === 'history' ? 'Last Changes' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredData.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          {currentView === 'approvals' && (
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                checked={selectedUserIds.has(u.id)}
                                onChange={() => toggleSelectUser(u.id)}
                              />
                            </td>
                          )}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img className="h-9 w-9 rounded-full mr-3" src={u.avatarUrl} alt="" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">{u.application}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{u.currentAccess}</td>
                          <td className="px-3 py-4 text-sm">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                              u.recommendation === 'Retain' ? 'bg-green-50 text-green-700 border-green-200' :
                              u.recommendation === 'Revoke' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {u.recommendation}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                             <div>{u.manager}</div>
                             <div className="text-xs text-gray-400">{u.dateSubmitted}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {currentView === 'history' ? (
                              <div className="flex flex-col">
                                <span className="text-gray-900 font-medium">{u.lastAction}</span>
                                <span className="text-xs text-gray-400">{u.lastModified}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleAction(u.id, 'Approve')}
                                  className="text-green-600 hover:text-green-800 font-medium text-xs border border-green-200 bg-green-50 px-3 py-1 rounded hover:bg-green-100"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleAction(u.id, 'Reject')}
                                  className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-100"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan={currentView === 'approvals' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                            No records found.
                          </td>
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
    </div>
  );
};

export default BusinessOwnerApprovals;