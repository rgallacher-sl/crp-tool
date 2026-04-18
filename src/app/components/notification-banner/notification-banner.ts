import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon/icon';

export type NotificationVariant = 'success' | 'error' | 'info' | 'warning' | 'inline-error' | 'loading' | 'offline';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './notification-banner.html',
  styleUrl: './notification-banner.scss',
})
export class NotificationBannerComponent {
  @Input() variant: NotificationVariant = 'success';
  @Input() title = '';
  @Input() message = '';
  @Input() dismissible = false;
  @Input() actionLabel?: string;
  @Input() actionHref?: string;
  @Output() dismissed = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<void>();

  get icon(): IconName {
    const map: Record<NotificationVariant, IconName> = {
      success: 'check-circle',
      error: 'error',
      info: 'check-circle',
      warning: 'error',
      'inline-error': 'error',
      loading: 'progress',
      offline: 'wifi-off',
    };
    return map[this.variant];
  }
}
