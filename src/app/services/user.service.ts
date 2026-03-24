import { Injectable } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly STORAGE_KEY = 'crp_users';
  private readonly SESSION_KEY = 'crp_user_id';

  getUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getUserById(id: string): UserProfile | null {
    return this.getUsers().find(u => u.id === id) ?? null;
  }

  getCurrentUser(): UserProfile | null {
    const id = sessionStorage.getItem(this.SESSION_KEY);
    return id ? this.getUserById(id) : null;
  }

  setCurrentUserId(id: string): void {
    sessionStorage.setItem(this.SESSION_KEY, id);
  }

  clearCurrentUser(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  addUser(profile: UserProfile): void {
    const users = this.getUsers();
    users.push(profile);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  emailExists(email: string): boolean {
    return this.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createProfile(email: string, password: string): UserProfile {
    return {
      id: crypto.randomUUID(),
      email,
      password,
      role: 'procurement_officer' as UserRole,
      createdAt: new Date().toISOString(),
    };
  }
}
