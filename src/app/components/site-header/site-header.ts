import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavTab {
  label: string;
  href: string;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeaderComponent {
  @Input() appName = 'CETL';
  @Input() navTabs: NavTab[] = [];
  @Input() showSignOut = true;
  @Output() signOut = new EventEmitter<void>();
}
