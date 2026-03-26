import { MaintenanceTask, MaintenanceHistory, UserProfile } from './types';

const API_BASE = '/api';

async function customFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.error || 'Something went wrong');
    } else {
      const text = await response.text();
      throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
    }
  }
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  auth: {
    login: (email: string, password: string): Promise<UserProfile> =>
      customFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(handleResponse),

    register: (email: string, password: string, displayName: string, role: 'admin' | 'worker'): Promise<{ message: string }> =>
      customFetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, role }),
      }).then(handleResponse),

    logout: (): Promise<{ message: string }> =>
      customFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      }).then(handleResponse),

    me: (): Promise<UserProfile> =>
      customFetch(`${API_BASE}/auth/me`).then(handleResponse),
  },

  tasks: {
    list: (): Promise<MaintenanceTask[]> =>
      customFetch(`${API_BASE}/tasks`).then(handleResponse),

    create: (task: Omit<MaintenanceTask, 'id' | 'uid' | 'createdAt'>): Promise<{ id: string }> =>
      customFetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }).then(handleResponse),

    update: (id: string, task: Partial<MaintenanceTask>): Promise<{ message: string }> =>
      customFetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }).then(handleResponse),

    delete: (id: string): Promise<{ message: string }> =>
      customFetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  history: {
    list: (): Promise<MaintenanceHistory[]> =>
      customFetch(`${API_BASE}/history`).then(handleResponse),

    create: (item: Omit<MaintenanceHistory, 'id' | 'uid'>): Promise<{ id: string }> =>
      customFetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).then(handleResponse),
  },
};
