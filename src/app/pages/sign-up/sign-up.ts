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
  name = '';
  email = '';
  password = '';
  showPassword = false;

  nameError = '';
  emailError = '';
  passwordError = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';

    if (!this.name.trim()) this.nameError = 'Enter your full name.';
    if (!this.email) {
      this.emailError = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Enter a valid email address.';
    }
    if (!this.password) this.passwordError = 'Enter a password.';
    else if (this.password.length < 8) this.passwordError = 'Password must be at least 8 characters.';

    if (this.nameError || this.emailError || this.passwordError) return;

    const ok = this.auth.register(this.name.trim(), this.email, this.password);
    if (ok) {
      this.router.navigate(['/assessments/new/provide-crp']);
    } else {
      this.emailError = 'An account with this email address already exists.';
    }
  }
}
