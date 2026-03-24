import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUpComponent {
  email = '';
  password = '';
  showPassword = false;
  submitting = false;

  emailError = '';
  passwordError = '';
  serverError = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.emailError = '';
    this.passwordError = '';
    this.serverError = '';

    if (!this.email) {
      this.emailError = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Enter a valid email address.';
    }
    if (!this.password) this.passwordError = 'Enter a password.';
    else if (this.password.length < 8) this.passwordError = 'Password must be at least 8 characters.';

    if (this.emailError || this.passwordError) return;

    this.submitting = true;
    try {
      const ok = this.auth.register(this.email, this.password);
      if (ok) {
        this.router.navigate(['/assessments/new/provide-crp']);
      } else {
        this.serverError = 'Unable to create your account. Please try again.';
      }
    } catch {
      this.serverError = 'Something went wrong. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
