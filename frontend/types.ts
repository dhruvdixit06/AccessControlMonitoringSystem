export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  status: 'Pending' | 'Retained' | 'Revoked' | 'Modified' | 'Completed' | 'In Progress' | 'Not Started';
}

export interface Application {
  id: string;
  name: string;
  userCount: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  lastUpdated: string;
}

export interface ReviewItem {
  id: string;
  user: User;
  application: string;
  currentAccess: string;
  recommendation: 'Retain' | 'Revoke' | 'Modify';
  manager: string;
  dateSubmitted: string;
  selected?: boolean;
}

export type ViewState = 'APP_MANAGER' | 'APP_OWNER' | 'BUSINESS_OWNER' | 'ADMIN' | 'LOGIN';