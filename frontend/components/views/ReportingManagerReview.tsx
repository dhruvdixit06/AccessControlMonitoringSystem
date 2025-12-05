import React, { useState, useMemo } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

// Extended User interface for this view
interface ReviewUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Pending' | 'Retained' | 'Revoked' | 'Modified' | 'Completed';
  avatarUrl: string;
  application: string;
  comment?: string;
  lastModified?: string; // Added for history
  lastAction?: string;   // Added for history
}

interface SubmissionModalState {
  open: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

const ReportingManagerReview: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'reviews' | 'history'>('dashboard');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('All Applications');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedUserForComment, setSelectedUserForComment] = useState<ReviewUser | null>(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Modal State for Save/Done actions
  const [submissionModal, setSubmissionModal] = useState<SubmissionModalState>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  const user = {
    name: 'John Doe',
    role: 'Reporting Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUZzUnyH2EJMpe2PkzwAygrxm9FPHxmPc5072r8l4BeQKywRO3TgTBZeqQBs_L2Ia6tn-FzP7bMEKCPBG9XxiE3TLo4gnLQmG2GfgEFvoxTKG7eQTVcnfdLcjYr3k_PpbxShZAZdSoRtXxqWqFHDDJDt8wSma49cGuzTZEaRl3YroEZIFj_YOroNgcDI5VUeL6-eiv12IIWpKFeXJpthNhe-51lJn2l0SqPiXGSnk_2x4HIMPBdZiqRzkFCM9KJUmVWyMKPYYv7ZKN'
  };

  const initialUsers: ReviewUser[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Admin', status: 'Pending', application: 'Salesforce', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUtzzSR17hSta0_wWzQ1Xn5S0Bsjd2GQXlAp_Edhtt6gFY3uH9bIt7EIGtTewHG0NrVHj2-0h4aEG839_XjICGQPpfXDvQry9rJfNq8wZByg9c2I5kRgfWNJrnG1IB0KbiIgwyhlKV-5ps4XMvDVt4MgDI8GXF9shFSzlGCDzlDwO1ar51JJm8wZUWsma2rJejqgFvvni0r7RX9qZXSzxm_u1FxD4Lp5kx0IcZ427C38Re1n8HFpGgsQU_Ht2EWXHT7_1Swq3W9tUO' },
    { id: '2', name: 'Bob Williams', email: 'bob.w@example.com', role: 'Editor', status: 'Retained', application: 'Jira', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgmPg04XThekyFfWSQLCZ3hrGs2juXjviNs5HQ1qN0K6DfArQRJUXhi9eajr-fJPBQxU-uHBy2BkOHu2ZZilKst-Z9mWgbgHDSpx4nnMak3tb31e_drAYTDh5Jefe9PINmlT09pwfp4V1g_q8WQuyxng_KlsCDOFqsMf2Cb1B1lk9PF3LxTt0llmAXcAXia2BmYxHsOutFsV4KQPWX45pRkYy6QdAITsph7eU_XH6EW2Ybsjk0X9aPtLPJVSYJCptOOv_yFL52dmgf' },
    { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'Viewer', status: 'Revoked', application: 'Salesforce', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAf2J2q5FNFfIAACwVt2FhD8s_MaRx53G5vGNnWALEApxnZRLMcApiqYF6EjwCiqFRwQmU2VGtpOk_qspiVyeKERFDRN3vSnIIkPzf1vsUmFe_Sr6OljwsKbnyvqJQiAOFhzdyD4JRlG7yplVqPL1FJYlWeg1DvVaVs6xPM8nTh0QlbyC5Oya59OzP8cgzFT_P8tDoLyhGHN0Enn4YYUs0AoEa4KHUVSJsM3u6rRQZwcVeb0DYq_w4rJdmgZn6TT9i1FZFwtRUSu-d' },
    { id: '4', name: 'Diana Prince', email: 'diana.p@example.com', role: 'Admin', status: 'Modified', application: 'GitHub', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqNknuB3X-ABZ9l_J8ylyq59nQegwV9h9ROwgYxoTXqIWmO1Rotw04uawPNa2qXWGYhFBkGRps-3wmkVwwcGLKVrP3BjBczPlBOiQAv6CjkPolDV8DjOPmUFe_b7oEgzyw1L4fAaUuYesPGu6gC25IaLEOp6NuArDR47aOmgUqrgj0AObD0MWUGTmrG4LlGxzEo5sT4xqWHlkbuK8QpJuBngOi5y0hZ5rBI3cTjrw7DyDh2aKziKnbghTmYeQM4eRjIyuKlDmD_kr' },
    { id: '5', name: 'Evan Wright', email: 'evan.w@example.com', role: 'Viewer', status: 'Pending', application: 'Jira', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi' },
    { id: '6', name: 'Fiona Gallagher', email: 'fiona.g@example.com', role: 'Editor', status: 'Pending', application: 'Slack', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3j4qcYNrSl_8rtn9FJ8NZHlJshHZbE_ZAF2HElYOUgo4BbYsqJDiHd8WbpS2F9yiwvY5ylQEZYCVGmKXgy0YwnnGsJwRQmyINkNEXVCsZV-kfbf2JHTaqGLxSe1BVzsI5PpqIoaJLfZZgHcSrMb7gRSN2Vq-jUA8W6RiUbexvQyD3Bvk-wORQrTXNJBzPBxRowMjEGE4FoVOS7GoIm4QDYtVkgf5ylqKINaEZolYqboQYuEkaLNKqywsXVsXYWAoprNhIlHGSuEJE' },
  ];

  // Dummy data for History view initialization
  const initialHistoryUsers: ReviewUser[] = [
    { id: 'h1', name: 'George Martin', email: 'george.m@example.com', role: 'Viewer', status: 'Completed', application: 'Jira', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi', lastAction: 'Revoked Access', lastModified: 'Oct 24, 2024' },
    { id: 'h2', name: 'Hannah Lee', email: 'hannah.l@example.com', role: 'Editor', status: 'Completed', application: 'Salesforce', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3j4qcYNrSl_8rtn9FJ8NZHlJshHZbE_ZAF2HElYOUgo4BbYsqJDiHd8WbpS2F9yiwvY5ylQEZYCVGmKXgy0YwnnGsJwRQmyINkNEXVCsZV-kfbf2JHTaqGLxSe1BVzsI5PpqIoaJLfZZgHcSrMb7gRSN2Vq-jUA8W6RiUbexvQyD3Bvk-wORQrTXNJBzPBxRowMjEGE4FoVOS7GoIm4QDYtVkgf5ylqKINaEZolYqboQYuEkaLNKqywsXVsXYWAoprNhIlHGSuEJE', lastAction: 'Retained Access', lastModified: 'Oct 22, 2024' },
    { id: 'h3', name: 'Ian Scott', email: 'ian.s@example.com', role: 'Admin', status: 'Modified', application: 'GitHub', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqNknuB3X-ABZ9l_J8ylyq59nQegwV9h9ROwgYxoTXqIWmO1Rotw04uawPNa2qXWGYhFBkGRps-3wmkVwwcGLKVrP3BjBczPlBOiQAv6CjkPolDV8DjOPmUFe_b7oEgzyw1L4fAaUuYesPGu6gC25IaLEOp6NuArDR47aOmgUqrgj0AObD0MWUGTmrG4LlGxzEo5sT4xqWHlkbuK8QpJuBngOi5y0hZ5rBI3cTjrw7DyDh2aKziKnbghTmYeQM4eRjIyuKlDmD_kr', lastAction: 'Modified Role to Reader', lastModified: 'Oct 20, 2024' },
  ];

  const [users, setUsers] = useState<ReviewUser[]>(initialUsers);
  const [history, setHistory] = useState<ReviewUser[]>(initialHistoryUsers);

  // Derived state for Dashboard
  const applications = useMemo(() => {
    const apps = Array.from(new Set(users.map(u => u.application)));
    return apps.map(appName => {
      const appUsers = users.filter(u => u.application === appName);
      const pendingCount = appUsers.filter(u => u.status === 'Pending').length;
      const totalCount = appUsers.length;
      return {
        name: appName,
        userCount: totalCount,
        pendingCount,
        status: pendingCount === 0 ? 'Completed' : 'In Progress'
      };
    });
  }, [users]);

  const totalUsersToReview = users.length;
  const totalReviewed = users.filter(u => u.status !== 'Pending').length;
  const reviewProgress = Math.round((totalReviewed / totalUsersToReview) * 100);

  // Filtered users for Review View and History View
  const filteredUsers = useMemo(() => {
    // Determine which dataset to use based on view
    let dataToFilter = currentView === 'history' ? history : users;

    // Apply Application Filter
    if (selectedAppFilter !== 'All Applications') {
      dataToFilter = dataToFilter.filter(u => u.application === selectedAppFilter);
    }

    // Apply Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      dataToFilter = dataToFilter.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.application.toLowerCase().includes(q)
      );
    }
    return dataToFilter;
  }, [users, history, selectedAppFilter, searchQuery, currentView]);

  const getStatusBadge = (status: ReviewUser['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Pending</span>;
      case 'Retained':
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Retained</span>;
      case 'Revoked':
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Revoked</span>;
      case 'Modified':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Modified</span>;
      case 'Completed':
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Completed</span>;
      default:
        return null;
    }
  };

  const updateHistory = (user: ReviewUser, actionText: string) => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const historyItem: ReviewUser = {
      ...user,
      lastAction: actionText,
      lastModified: date
    };
    
    setHistory(prev => {
      // Remove previous entry for this user if exists to show only latest action, or keep it. 
      // For this implementation, let's keep latest action at the top.
      const filtered = prev.filter(h => h.id !== user.id);
      return [historyItem, ...filtered];
    });
  };

  const handleAction = (id: string, action: 'Retain' | 'Revoke') => {
    const updatedUsers: ReviewUser[] = users.map(u => {
      if (u.id === id) {
        return { 
          ...u, 
          status: action === 'Retain' ? 'Retained' : 'Revoked'
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    
    // Update history
    const user = updatedUsers.find(u => u.id === id);
    if (user) {
      updateHistory(user, action === 'Retain' ? 'Retained Access' : 'Revoked Access');
    }
  };

  const openCommentModal = (user: ReviewUser) => {
    setSelectedUserForComment(user);
    setCommentText(user.comment || '');
    setCommentModalOpen(true);
  };

  const saveComment = () => {
    if (selectedUserForComment) {
      const updatedUsers: ReviewUser[] = users.map(u => {
        if (u.id === selectedUserForComment.id) {
          return {
            ...u,
            status: 'Modified',
            comment: commentText
          };
        }
        return u;
      });
      setUsers(updatedUsers);

      const user = updatedUsers.find(u => u.id === selectedUserForComment.id);
      if (user) {
        updateHistory(user, `Modified Access: ${commentText}`);
      }

      setCommentModalOpen(false);
      setSelectedUserForComment(null);
      setCommentText('');
    }
  };

  const navigateToReview = (appName?: string) => {
    if (appName) setSelectedAppFilter(appName);
    setSearchQuery(''); // Reset search when entering review from dashboard
    setCurrentView('reviews');
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0) {
      // Deselect all
      setSelectedUserIds(new Set());
    } else {
      // Select all visible
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
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

  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length;

  // New Button Actions
  const handleSaveDraft = () => {
    setSubmissionModal({
      open: true,
      title: 'Draft Saved',
      message: 'Your review progress has been successfully saved as a draft.',
      type: 'success',
      confirmText: 'Okay',
      showCancel: false,
      onConfirm: () => setSubmissionModal({ ...submissionModal, open: false })
    });
  };

  const handleDone = () => {
    const pendingCount = filteredUsers.filter(u => u.status === 'Pending').length;

    if (pendingCount === 0) {
      setSubmissionModal({
        open: true,
        title: 'Review Complete',
        message: 'All users have been reviewed.',
        type: 'success',
        confirmText: 'Okay',
        showCancel: false,
        onConfirm: () => {
          setSubmissionModal(prev => ({ ...prev, open: false }));
          // Logic to complete review
          setCurrentView('dashboard');
        }
      });
    } else {
      setSubmissionModal({
        open: true,
        title: 'Incomplete Review',
        message: `${pendingCount} users left to update. Do you want to continue updating or mark as done?`,
        type: 'warning',
        confirmText: 'Mark as Done',
        cancelText: 'Continue Updating',
        showCancel: true,
        onConfirm: () => {
          setSubmissionModal(prev => ({ ...prev, open: false }));
          // Logic to force complete
          setCurrentView('dashboard');
        }
      });
    }
  };

  return (
    <div className="flex h-full w-full bg-background-light">
      <Sidebar
        title="Access Control"
        user={user}
        menuItems={[
          { 
            icon: 'dashboard', 
            label: 'Dashboard', 
            active: currentView === 'dashboard',
            filled: currentView === 'dashboard',
            onClick: () => setCurrentView('dashboard')
          },
          { 
            icon: 'grade', 
            label: 'Reviews', 
            active: currentView === 'reviews',
            filled: currentView === 'reviews',
            onClick: () => {
              setSearchQuery(''); 
              setSelectedUserIds(new Set());
              setCurrentView('reviews');
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
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header avatarUrl={user.avatar} />
        
        {/* Navigation override for small screens */}
        <div className="md:hidden flex gap-2 p-2 bg-white border-b">
           <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 rounded ${currentView === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Dashboard</button>
           <button onClick={() => setCurrentView('reviews')} className={`px-3 py-1 rounded ${currentView === 'reviews' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Reviews</button>
           <button onClick={() => setCurrentView('history')} className={`px-3 py-1 rounded ${currentView === 'history' ? 'bg-primary text-white' : 'bg-gray-100'}`}>History</button>
        </div>

        <main className="flex-1 overflow-y-auto pb-24">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-8">
              <div>
                <h1 className="text-text-light-primary text-3xl font-black">Welcome, {user.name.split(' ')[0]}!</h1>
                <p className="text-text-light-secondary text-base mt-2">Here is the summary of your pending reviews.</p>
              </div>

              {/* Summary Card */}
              <div className="bg-surface-light p-6 rounded-xl border border-border-light flex flex-col shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h2 className="text-text-light-primary text-[22px] font-bold leading-tight">Current Quarterly Review (Q3 2024)</h2>
                    <p className="text-text-light-secondary text-sm mt-1">Review progress across all applications.</p>
                  </div>
                  <button onClick={() => navigateToReview()} className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                    <span>Go to Reviews</span>
                  </button>
                </div>
                
                <div className="w-full bg-background-light rounded-full h-2.5 mt-4 overflow-hidden">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${reviewProgress}%` }}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                   <div className="flex flex-col gap-1 p-4 bg-background-light rounded-lg">
                    <p className="text-text-light-secondary text-sm">Application Count</p>
                    <p className="text-text-light-primary text-2xl font-bold">{applications.length}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-4 bg-background-light rounded-lg">
                    <p className="text-text-light-secondary text-sm">Total Users to Review</p>
                    <p className="text-text-light-primary text-2xl font-bold">{totalUsersToReview}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-4 bg-background-light rounded-lg">
                    <p className="text-text-light-secondary text-sm">Total Reviewed</p>
                    <p className="text-green-500 text-2xl font-bold">{totalReviewed}</p>
                  </div>
                </div>
              </div>

              {/* Applications Table */}
              <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden shadow-sm">
                <div className="p-6">
                  <h2 className="text-text-light-primary text-[22px] font-bold leading-tight">Pending Reviews by Application</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-border-light bg-background-light">
                      <tr>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Application Name</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Total Users</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Pending Reviews</th>
                         <th className="px-6 py-3 text-sm font-medium text-text-light-secondary">Status</th>
                        <th className="px-6 py-3 text-sm font-medium text-text-light-secondary"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.name} className="border-b border-border-light last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-light-primary">{app.name}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.userCount}</td>
                          <td className="px-6 py-4 text-text-light-secondary">{app.pendingCount}</td>
                          <td className="px-6 py-4">
                             {app.pendingCount === 0 ? (
                               <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>
                             ) : (
                               <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">In Progress</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => navigateToReview(app.name)}
                              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors ml-auto"
                            >
                              Review
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
            <div className="mx-auto max-w-7xl p-6 lg:p-8">
              
              {/* Header Area */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium">
                      <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
                      Back to Dashboard
                    </button>
                  </div>
                  <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight mt-2">
                    {currentView === 'history' ? 'Access History' : 'Access Review'}
                  </h1>
                  <p className="text-gray-500 text-base font-normal leading-normal">
                    {currentView === 'history' ? 'View past access review activities and changes.' : 'Validate user access rights for your applications.'}
                  </p>
                </div>
              </div>

              {/* Toolbar & Filter */}
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-xl border border-b-0 border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    {/* Application Filter */}
                    <div className="relative">
                       <select 
                        value={selectedAppFilter}
                        onChange={(e) => setSelectedAppFilter(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-primary focus:ring-primary focus:outline-none"
                      >
                        <option value="All Applications">All Applications</option>
                        {Array.from(new Set([...initialUsers, ...history].map(u => u.application))).map(appName => (
                          <option key={appName} value={appName}>{appName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative w-full max-w-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-gray-500 text-xl">search</span>
                      </div>
                      <input 
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 pl-10 py-2 text-sm text-gray-900 focus:border-primary focus:ring-primary focus:outline-none" 
                        placeholder="Search user..." 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">{filteredUsers.length} users found</span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-gray-200 rounded-b-xl mb-12">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-12">
                            <input 
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                              type="checkbox" 
                              checked={isAllSelected}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Application</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Current Role</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">
                            {currentView === 'history' ? 'Last Changes Made' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <input 
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                                type="checkbox" 
                                checked={selectedUserIds.has(u.id)}
                                onChange={() => toggleSelectUser(u.id)}
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="flex items-center gap-3">
                                <img className="h-10 w-10 rounded-full" src={u.avatarUrl} alt="" />
                                <div>
                                  <div className="font-medium text-gray-900">{u.name}</div>
                                  <div className="text-gray-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.application}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.role}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {getStatusBadge(u.status)}
                              {u.comment && <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={u.comment}>{u.comment}</div>}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {currentView === 'history' ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-gray-900 font-medium">{u.lastAction}</span>
                                  <span className="text-gray-500 text-xs">{u.lastModified}</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleAction(u.id, 'Retain')}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${u.status === 'Retained' ? 'border-green-500 bg-green-500/10 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    Retain
                                  </button>
                                  <button 
                                    onClick={() => handleAction(u.id, 'Revoke')}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${u.status === 'Revoked' ? 'border-red-500 bg-red-500/10 text-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    Revoke
                                  </button>
                                  <button 
                                    onClick={() => openCommentModal(u)}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${u.status === 'Modified' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    More
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                              No users found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Action Bar for Review View */}
        {currentView === 'reviews' && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
               <div className="text-sm text-gray-500 hidden sm:block">
                 {/* Optional status text */}
                 Changes are auto-saved locally.
               </div>
               <div className="flex gap-3 w-full sm:w-auto justify-end">
                 <button 
                   onClick={handleSaveDraft}
                   className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                 >
                   Save as Draft
                 </button>
                 <button 
                   onClick={handleDone}
                   className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                 >
                   Done
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {commentModalOpen && selectedUserForComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add Comment / Modify Access</h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter details for {selectedUserForComment.name} ({selectedUserForComment.application})
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments or Instructions</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary min-h-[120px]"
                placeholder="e.g. Change role to Viewer, or Revoke access by end of month..."
              ></textarea>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setCommentModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={saveComment}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
              >
                Save Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Alert Modal */}
      {submissionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in">
             <div className="p-6 flex flex-col items-center text-center">
               <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                 submissionModal.type === 'success' ? 'bg-green-100 text-green-600' :
                 submissionModal.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
               }`}>
                 <span className="material-symbols-outlined text-2xl">
                   {submissionModal.type === 'success' ? 'check' : 
                    submissionModal.type === 'warning' ? 'priority_high' : 'info'}
                 </span>
               </div>
               <h3 className="text-lg font-bold text-gray-900">{submissionModal.title}</h3>
               <p className="text-sm text-gray-500 mt-2">{submissionModal.message}</p>
             </div>
             <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
               {submissionModal.showCancel && (
                 <button
                   onClick={() => setSubmissionModal({ ...submissionModal, open: false })}
                   className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
                 >
                   {submissionModal.cancelText || 'Cancel'}
                 </button>
               )}
               <button
                 onClick={() => {
                   if (submissionModal.onConfirm) submissionModal.onConfirm();
                   else setSubmissionModal({ ...submissionModal, open: false });
                 }}
                 className={`w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                    submissionModal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 'bg-primary hover:bg-primary/90 focus:ring-primary'
                 }`}
               >
                 {submissionModal.confirmText || 'Okay'}
               </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ReportingManagerReview;