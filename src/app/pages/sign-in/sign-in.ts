import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignInComponent {
  email = '';
  password = '';
  showPassword = false;
  authError = '';
  emailError = '';
  passwordError = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.authError = '';
    this.emailError = '';
    this.passwordError = '';

    if (!this.email) this.emailError = 'Enter your email address.';
    if (!this.password) this.passwordError = 'Enter your password.';
    if (this.emailError || this.passwordError) return;

    const ok = this.auth.signIn(this.email, this.password);
    if (ok) {
      this.router.navigate(['/suppliers']);
    } else {
      this.authError = 'Incorrect email or password. Please try again.';
    }
  }
}
