export type UserRole = 'procurement_officer' | 'senior_officer' | 'admin';

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  password: string; // plain text — demo only, no real backend
  role: UserRole;
  orgId?: string; // reserved for future multi-tenancy
  createdAt: string; // ISO string
}
