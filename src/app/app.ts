import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  get isSignInPage(): boolean {
    return this.router.url === '/sign-in';
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/sign-in']);
  }
}
