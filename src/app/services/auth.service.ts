import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'crp_signed_in';

  isSignedIn(): boolean {
    return sessionStorage.getItem(this.KEY) === 'true';
  }

  private readonly DEMO_EMAIL = 'user@crptool.com';
  private readonly DEMO_PASSWORD = 'password123';

  signIn(email: string, password: string): boolean {
    if (email === this.DEMO_EMAIL && password === this.DEMO_PASSWORD) {
      sessionStorage.setItem(this.KEY, 'true');
      return true;
    }
    return false;
  }

  signOut(): void {
    sessionStorage.removeItem(this.KEY);
  }
}
