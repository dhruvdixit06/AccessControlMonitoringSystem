import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'App Manager' | 'App Owner' | 'Business Owner' | 'Admin';
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface Application {
  id: string;
  name: string;
  owner: string;
  users: number; // Derived count in a real app, but kept simple here
  status: 'Active' | 'Maintenance' | 'Inactive';
  lastUpdated: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  progress: number;
}

// Represents a user's access to an application (The core entity moving through the workflow)
export interface AccessRecord {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  application: string;
  role: string; // e.g. Admin, Viewer
  manager: string; // Reporting Manager / App Owner
  status: 'Active' | 'Inactive'; // System status
  lastLogin: string;
  
  // Review specific fields
  reviewStatus: 'Pending' | 'Retained' | 'Revoked' | 'Modified' | 'Approved' | 'Rejected'; 
  reviewComment?: string;
  history: Array<{ action: string; date: string; actor: string }>;
  dateSubmitted?: string; // For business owner view
  recommendation?: 'Retain' | 'Revoke' | 'Modify'; // What the App Owner decided
}

interface DataContextType {
  systemUsers: SystemUser[];
  applications: Application[];
  reviewCycles: ReviewCycle[];
  accessRecords: AccessRecord[];
  
  // Actions
  addSystemUser: (user: SystemUser) => void;
  updateSystemUser: (user: SystemUser) => void;
  deleteSystemUser: (id: string) => void;
  
  addApplication: (app: Application) => void;
  
  addAccessRecord: (record: AccessRecord) => void;
  updateAccessRecord: (record: AccessRecord) => void;
  deleteAccessRecord: (id: string) => void;
  
  // Workflow Actions
  performReviewAction: (id: string, action: 'Retain' | 'Revoke' | 'Modify' | 'Approve' | 'Reject', comment?: string, actor?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Initial Data ---

const initialSystemUsers: SystemUser[] = [
  { id: '1', name: 'System Admin', email: 'admin@xyz.com', avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=111827&color=fff', role: 'Admin', department: 'IT', status: 'Active', lastLogin: 'Just now' },
  { id: '2', name: 'Alex Doe', email: 'alex@xyz.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBDAyfgKSYML3GGf-DqwNxqlgUcv24wZ0VmT-zF5ZYqJe09TCP6VE0HW5TpqfOFZy2gqK8LVOHz9wLRPWbHkJmmC2UIPj_goKpNcqYSAdaZO9li0GBmGLnpWzJZWmZ_KmxLrQE6JGZT5QvLMlBdyETSOljFK8WnX_uphNjZ4-FbiE5ClEB-BE11JCVImMPxWcl4ffzMwxpvTlldbf5yw_BISbycWZzJt10lwn8BgeLe9x3j_s1WESZSiDStxYjZGU3HzHq9MjnzAi', role: 'App Manager', department: 'IT Security', status: 'Active', lastLogin: '2 hours ago' },
  { id: '3', name: 'John Doe', email: 'john@xyz.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUZzUnyH2EJMpe2PkzwAygrxm9FPHxmPc5072r8l4BeQKywRO3TgTBZeqQBs_L2Ia6tn-FzP7bMEKCPBG9XxiE3TLo4gnLQmG2GfgEFvoxTKG7eQTVcnfdLcjYr3k_PpbxShZAZdSoRtXxqWqFHDDJDt8wSma49cGuzTZEaRl3YroEZIFj_YOroNgcDI5VUeL6-eiv12IIWpKFeXJpthNhe-51lJn2l0SqPiXGSnk_2x4HIMPBdZiqRzkFCM9KJUmVWyMKPYYv7ZKN', role: 'App Owner', department: 'Sales', status: 'Active', lastLogin: '1 day ago' },
  { id: '4', name: 'Sarah Jenkins', email: 'sarah@xyz.com', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvIu33i4kuKMrKDEtDZrk_UqFvheBtGrxlTAoCl-pHYHkyO3DQd5QdVbB6uxOAdHrsvLTHKxATF86ei6nDpac5AfiBJ5RU8Rf990e__IQmgbnqiJ5x1sq8DFYRBeNrzaQlKfcWPWgCu12yPp8YChlYbDBWZ7s54Gw-fvMAngONkRubSJEq33xnHF7gIEspIj6LDrfDxfwTBZD4j0RpU-O5537ijLN_kRyedl1hrZnfLeSD-oW5kunTPMicAoMwyAVmGDzRHOvPtGYJ', role: 'Business Owner', department: 'Operations', status: 'Active', lastLogin: '5 mins ago' },
];

const initialApps: Application[] = [
  { id: '1', name: 'Salesforce', owner: 'John Doe', users: 85, status: 'Active', lastUpdated: '2 days ago' },
  { id: '2', name: 'Jira', owner: 'John Doe', users: 42, status: 'Active', lastUpdated: '5 hours ago' },
  { id: '3', name: 'GitHub', owner: 'Mike Ross', users: 15, status: 'Active', lastUpdated: '1 week ago' },
  { id: '4', name: 'Slack', owner: 'Mike Ross', users: 120, status: 'Active', lastUpdated: '3 days ago' },
];

const initialCycles: ReviewCycle[] = [
  { id: '1', name: 'Q3 2024 Security Review', startDate: '2024-07-01', endDate: '2024-09-30', status: 'Active', progress: 75 },
  { id: '2', name: 'Q2 2024 User Audit', startDate: '2024-04-01', endDate: '2024-06-30', status: 'Completed', progress: 100 },
];

const initialAccessRecords: AccessRecord[] = [
  { 
    id: '1', userName: 'Olivia Martin', userEmail: 'olivia.martin@example.com', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUtzzSR17hSta0_wWzQ1Xn5S0Bsjd2GQXlAp_Edhtt6gFY3uH9bIt7EIGtTewHG0NrVHj2-0h4aEG839_XjICGQPpfXDvQry9rJfNq8wZByg9c2I5kRgfWNJrnG1IB0KbiIgwyhlKV-5ps4XMvDVt4MgDI8GXF9shFSzlGCDzlDwO1ar51JJm8wZUWsma2rJejqgFvvni0r7RX9qZXSzxm_u1FxD4Lp5kx0IcZ427C38Re1n8HFpGgsQU_Ht2EWXHT7_1Swq3W9tUO', 
    application: 'Salesforce', role: 'Admin', manager: 'John Doe', status: 'Active', lastLogin: '2023-07-15', reviewStatus: 'Pending', history: [] 
  },
  { 
    id: '2', userName: 'Jackson Lee', userEmail: 'jackson.lee@example.com', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgmPg04XThekyFfWSQLCZ3hrGs2juXjviNs5HQ1qN0K6DfArQRJUXhi9eajr-fJPBQxU-uHBy2BkOHu2ZZilKst-Z9mWgbgHDSpx4nnMak3tb31e_drAYTDh5Jefe9PINmlT09pwfp4V1g_q8WQuyxng_KlsCDOFqsMf2Cb1B1lk9PF3LxTt0llmAXcAXia2BmYxHsOutFsV4KQPWX45pRkYy6QdAITsph7eU_XH6EW2Ybsjk0X9aPtLPJVSYJCptOOv_yFL52dmgf', 
    application: 'Jira', role: 'Developer', manager: 'John Doe', status: 'Active', lastLogin: '2023-07-14', reviewStatus: 'Pending', history: [] 
  },
  { 
    id: '3', userName: 'Isabella Nguyen', userEmail: 'isabella.nguyen@example.com', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAf2J2q5FNFfIAACwVt2FhD8s_MaRx53G5vGNnWALEApxnZRLMcApiqYF6EjwCiqFRwQmU2VGtpOk_qspiVyeKERFDRN3vSnIIkPzf1vsUmFe_Sr6OljwsKbnyvqJQiAOFhzdyD4JRlG7yplVqPL1FJYlWeg1DvVaVs6xPM8nTh0QlbyC5Oya59OzP8cgzFT_P8tDoLyhGHN0Enn4YYUs0AoEa4KHUVSJsM3u6rRQZwcVeb0DYq_w4rJdmgZn6TT9i1FZFwtRUSu-d', 
    application: 'Slack', role: 'Auditor', manager: 'Mike Ross', status: 'Inactive', lastLogin: '2023-07-12', reviewStatus: 'Retained', history: [{ action: 'Retained Access', date: 'Oct 22, 2024', actor: 'Mike Ross' }] 
  },
  { 
    id: '4', userName: 'William Kim', userEmail: 'will.kim@example.com', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqNknuB3X-ABZ9l_J8ylyq59nQegwV9h9ROwgYxoTXqIWmO1Rotw04uawPNa2qXWGYhFBkGRps-3wmkVwwcGLKVrP3BjBczPlBOiQAv6CjkPolDV8DjOPmUFe_b7oEgzyw1L4fAaUuYesPGu6gC25IaLEOp6NuArDR47aOmgUqrgj0AObD0MWUGTmrG4LlGxzEo5sT4xqWHlkbuK8QpJuBngOi5y0hZ5rBI3cTjrw7DyDh2aKziKnbghTmYeQM4eRjIyuKlDmD_kr', 
    application: 'Salesforce', role: 'Support Agent', manager: 'John Doe', status: 'Active', lastLogin: '2023-07-10', reviewStatus: 'Pending', history: [] 
  },
  // Item pending Business Owner Approval
  {
    id: '5', userName: 'Chen Wei', userEmail: 'chen.wei@example.com', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiTnHvIb3IjbeO45-mDoOrfVzA2HjtpVpzVGNwqVi6NSljUwnAOPwihA3PdnTfRUkcQGFOP92ZaOzrYnCgbGV7YUgYeLEulROa0fHpkVHrtbCjMBqE6HROGsH97ch5NF6jCUIqKNVaCCzLK5IpNGEi5Sa_HDrDR3nG5n21l350Q_EWSSMXuhGCz32541eV4AT4Ft8f2-nUvqwDZYDmiMbErMaEXpZ_4NjoBGFPXw5iVRSEjXhM0SlrNanEKTjPnuSVarrONPE4ERcc',
    application: 'GitHub', role: 'Read-Only', manager: 'Mike Ross', status: 'Active', lastLogin: '2023-10-24', 
    reviewStatus: 'Pending', // In BO view, this means waiting for BO, but in our logic, BO sees items that are 'Retained'/'Revoked' by Manager but need final signoff, OR we simply say Manager sets it to 'Pending BO'.
    // To simplify: Let's assume standard flow: Pending -> (Manager Acts) -> Retained/Revoked/Modified. 
    // The BO View shows items where recommendation is set.
    recommendation: 'Retain',
    dateSubmitted: '2024-10-25',
    history: [{ action: 'Recommended Retain', date: 'Oct 25, 2024', actor: 'Mike Ross' }]
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [applications, setApplications] = useState<Application[]>(initialApps);
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>(initialCycles);
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>(initialAccessRecords);

  const addSystemUser = (user: SystemUser) => setSystemUsers(prev => [user, ...prev]);
  
  const updateSystemUser = (updatedUser: SystemUser) => {
    setSystemUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const deleteSystemUser = (id: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
  };

  const addApplication = (app: Application) => setApplications(prev => [app, ...prev]);

  const addAccessRecord = (record: AccessRecord) => setAccessRecords(prev => [record, ...prev]);
  
  const updateAccessRecord = (record: AccessRecord) => {
    setAccessRecords(prev => prev.map(r => r.id === record.id ? record : r));
  };
  
  const deleteAccessRecord = (id: string) => {
    setAccessRecords(prev => prev.filter(r => r.id !== id));
  };

  const performReviewAction = (id: string, action: 'Retain' | 'Revoke' | 'Modify' | 'Approve' | 'Reject', comment?: string, actor: string = 'User') => {
    setAccessRecords(prev => prev.map(record => {
      if (record.id === id) {
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newHistoryItem = { 
          action: `${action}${comment ? ': ' + comment : ''}`, 
          date, 
          actor 
        };
        
        // If it's an App Owner action
        if (['Retain', 'Revoke', 'Modify'].includes(action)) {
           return {
             ...record,
             reviewStatus: action === 'Modify' ? 'Modified' : (action === 'Retain' ? 'Retained' : 'Revoked'),
             recommendation: action as 'Retain' | 'Revoke' | 'Modify',
             reviewComment: comment,
             dateSubmitted: date, // Ready for BO
             history: [newHistoryItem, ...record.history]
           };
        }
        
        // If it's a Business Owner action
        if (['Approve', 'Reject'].includes(action)) {
           return {
             ...record,
             reviewStatus: action === 'Approve' ? 'Approved' : 'Rejected',
             history: [newHistoryItem, ...record.history]
           };
        }
      }
      return record;
    }));
  };

  return (
    <DataContext.Provider value={{
      systemUsers,
      applications,
      reviewCycles,
      accessRecords,
      addSystemUser,
      updateSystemUser,
      deleteSystemUser,
      addApplication,
      addAccessRecord,
      updateAccessRecord,
      deleteAccessRecord,
      performReviewAction
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
