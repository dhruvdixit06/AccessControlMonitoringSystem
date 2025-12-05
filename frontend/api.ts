const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ApiUser {
    id: string;
    name: string;
    email: string;
    application: string;
    role: string;
    lastLogin: string;
    status: 'Active' | 'Inactive';
    avatarUrl: string;
}

export interface ApiApplication {
    id: number;
    name: string;
    description: string;
    userCount?: number;
    status?: string;
    lastUpdated?: string;
}

export interface ApiRole {
    id: number;
    name: string;
}

export const api = {
    getAppManagerUsers: async (): Promise<ApiUser[]> => {
        const response = await fetch(`${API_BASE_URL}/dashboard/app-manager/users`);
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const data = await response.json();
        // Ensure avatarUrl is set if missing
        return data.map((u: any) => ({
            ...u,
            avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(u.name)}`
        }));
    },

    getApplications: async (): Promise<ApiApplication[]> => {
        const response = await fetch(`${API_BASE_URL}/applications/`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        return response.json();
    },

    getRoles: async (): Promise<ApiRole[]> => {
        const response = await fetch(`${API_BASE_URL}/roles/`);
        if (!response.ok) throw new Error('Failed to fetch roles');
        return response.json();
    },

    createUser: async (userData: any) => {
        // This calls the Dashboard Onboarding endpoint which handles User+Access+Role
        const response = await fetch(`${API_BASE_URL}/dashboard/app-manager/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create user: ${errorText}`);
        }
        return response.json();
    },

    deleteUser: async (userId: string) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    }
};
