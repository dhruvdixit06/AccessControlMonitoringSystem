import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { useData, AccessRecord } from '../context/DataContext';

interface Props {
  onLogout: () => void;
}

const BusinessOwnerApprovals: React.FC<Props> = ({ onLogout }) => {
  const { accessRecords, performReviewAction, reviewCycles } = useData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'approvals' | 'history' | 'applications' | 'cycles'>('dashboard');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('All Applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const userProfile = {
    name: 'Sarah Jenkins',
    role: 'Business Owner',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvIu33i4kuKMrKDEtDZrk_UqFvheBtGrxlTAoCl-pHYHkyO3DQd5QdVbB6uxOAdHrsvLTHKxATF86ei6nDpac5AfiBJ5RU8Rf990e__IQmgbnqiJ5x1sq8DFYRBeNrzaQlKfcWPWgCu12yPp8YChlYbDBWZ7s54Gw-fvMAngONkRubSJEq33xnHF7gIEspIj6LDrfDxfwTBZD4j0RpU-O5537ijLN_kRyedl1hrZnfLeSD-oW5kunTPMicAoMwyAVmGDzRHOvPtGYJ'
  };

  // Filter for records relevant to Business Owner
  // Logic: BO sees items where App Owner has made a decision (Retained/Revoked/Modified) and they are waiting final approval.
  // OR simply items assigned to this BO flow. For prototype, we filter where 'recommendation' is present but status is NOT Approved/Rejected yet.
  const boRecords = useMemo(() => {
    return accessRecords.filter(r => ['Retained', 'Revoked', 'Modified'].includes(r.reviewStatus));
  }, [accessRecords]);

  const historyRecords = useMemo(() => {
    return accessRecords.filter(r => ['Approved', 'Rejected'].includes(r.reviewStatus));
  }, [accessRecords]);

  // Derived Statistics for Dashboard
  const applications = useMemo(() => {
    const apps = Array.from(new Set(accessRecords.map(u => u.application)));
    return apps.map(appName => {
      const appUsers = boRecords.filter(u => u.application === appName);
      return {
        name: appName,
        count: appUsers.length,
        status: appUsers.length > 0 ? 'Pending' : 'Completed'
      };
    });
  }, [accessRecords, boRecords]);

  const totalToReview = boRecords.length;
  const totalReviewed = historyRecords.length;

  // Filter Logic
  const filteredData = useMemo(() => {
    let data = currentView === 'history' ? historyRecords : boRecords;

    if (selectedAppFilter !== 'All Applications') {
      data = data.filter(u => u.application === selectedAppFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(u => 
        u.userName.toLowerCase().includes(q) || 
        u.userEmail.toLowerCase().includes(q) ||
        u.application.toLowerCase().includes(q)
      );
    }
    return data;
  }, [currentView, historyRecords, boRecords, selectedAppFilter, searchQuery]);

  const handleAction = (id: string, action: 'Approve' | 'Reject') => {
    performReviewAction(id, action, undefined, userProfile.name);
    // Remove from selection if present
    if (selectedUserIds.has(id)) {
        const newSet = new Set(selectedUserIds);
        newSet.delete(id);
        setSelectedUserIds(newSet);
    }
  };

  const handleBulkAction = (action: 'Approve' | 'Reject') => {
    const selectedUsers = boRecords.filter(u => selectedUserIds.has(u.id));
    selectedUsers.forEach(u => handleAction(u.id, action));
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

        {/* Navigation override for small screens */}
        <div className="md:hidden flex gap-2 p-2 bg-white border-b overflow-x-auto">
           <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Dashboard</button>
           <button onClick={() => setCurrentView('approvals')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'approvals' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Approvals</button>
           <button onClick={() => setCurrentView('history')} className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'history' ? 'bg-primary text-white' : 'bg-gray-100'}`}>History</button>
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
          ) : currentView === 'applications' ? (
             <div className="max-w-7xl mx-auto flex flex-col gap-8">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">My Applications</h1>
                  <p className="text-gray-500 mt-1">Applications where you are the Business Owner.</p>
               </div>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Application</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pending Requests</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app) => (
                        <tr key={app.name}>
                          <td className="px-6 py-4 font-medium">{app.name}</td>
                          <td className="px-6 py-4 text-gray-500">{app.count}</td>
                          <td className="px-6 py-4">
                            {app.count > 0 ? (
                              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pending Action</span>
                            ) : (
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Up to Date</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          ) : currentView === 'cycles' ? (
             <div className="max-w-7xl mx-auto flex flex-col gap-8">
               <div>
                  <h1 className="text-text-light-primary text-2xl font-bold">Review Cycles</h1>
                  <p className="text-gray-500 mt-1">Status of current and past review periods.</p>
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
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div>
                <h1 className="text-text-light-primary text-2xl md:text-3xl font-bold">
                  {currentView === 'history' ? 'Approval History' : 'Pending Approvals'}
                </h1>
                <p className="text-text-light-secondary text-base mt-1">
                  {currentView === 'history' 
                    ? 'Log of all processed access requests.' 
                    : 'Review and approve access recommendations from App Owners.'}
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
                      {Array.from(new Set([...boRecords, ...historyRecords].map(u => u.application))).map(appName => (
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
                              <img className="h-9 w-9 rounded-full mr-3" src={u.userAvatar} alt="" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{u.userName}</div>
                                <div className="text-xs text-gray-500">{u.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">{u.application}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{u.role}</td>
                          <td className="px-3 py-4 text-sm">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                              u.recommendation === 'Retain' ? 'bg-green-50 text-green-700 border-green-200' :
                              u.recommendation === 'Revoke' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {u.recommendation || u.reviewStatus}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                             <div>{u.manager}</div>
                             <div className="text-xs text-gray-400">{u.dateSubmitted}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {currentView === 'history' ? (
                              <div className="flex flex-col">
                                <span className="text-gray-900 font-medium">{u.history[0]?.action}</span>
                                <span className="text-xs text-gray-400">{u.history[0]?.date}</span>
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
