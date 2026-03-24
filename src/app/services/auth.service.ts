import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_FLAG = 'crp_signed_in';

  // Demo fallback — used when no matching account exists in localStorage
  private readonly DEMO_EMAIL = 'user@crptool.com';
  private readonly DEMO_PASSWORD = 'password123';

  constructor(private userService: UserService) {}

  isSignedIn(): boolean {
    return sessionStorage.getItem(this.SESSION_FLAG) === 'true';
  }

  signIn(email: string, password: string): boolean {
    const users = this.userService.getUsers();
    const match = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (match) {
      sessionStorage.setItem(this.SESSION_FLAG, 'true');
      this.userService.setCurrentUserId(match.id);
      return true;
    }

    // Fallback to demo credentials
    if (email === this.DEMO_EMAIL && password === this.DEMO_PASSWORD) {
      sessionStorage.setItem(this.SESSION_FLAG, 'true');
      return true;
    }

    return false;
  }

  register(name: string, email: string, password: string): boolean {
    if (this.userService.emailExists(email)) return false;

    const profile = this.userService.createProfile(name, email, password);
    this.userService.addUser(profile);
    sessionStorage.setItem(this.SESSION_FLAG, 'true');
    this.userService.setCurrentUserId(profile.id);
    return true;
  }

  signOut(): void {
    sessionStorage.removeItem(this.SESSION_FLAG);
    this.userService.clearCurrentUser();
  }
}
