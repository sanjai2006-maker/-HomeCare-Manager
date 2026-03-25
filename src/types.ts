export type TaskCategory = 'structural' | 'electrical' | 'plumbing' | 'cleaning' | 'safety' | 'other';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
export type TaskStatus = 'pending' | 'completed' | 'urgent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface MaintenanceTask {
  id?: string;
  uid: string;
  title: string;
  description?: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  lastDone?: string;
  nextDue: string;
  status: TaskStatus;
  createdAt: string;
}

export interface MaintenanceHistory {
  id?: string;
  uid: string;
  taskId: string;
  taskTitle: string;
  completedAt: string;
  notes?: string;
  cost?: number;
}
