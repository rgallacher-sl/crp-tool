import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

export type StatusTagVariant = 'pass' | 'fail' | 'compliant' | 'not-compliant';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './status-tag.html',
  styleUrl: './status-tag.scss',
})
export class StatusTagComponent {
  @Input() variant: StatusTagVariant = 'compliant';
  @Input() label?: string;

  get displayLabel(): string {
    if (this.label) return this.label;
    const labels: Record<StatusTagVariant, string> = {
      'pass': 'Pass',
      'fail': 'Fail',
      'compliant': 'Compliant',
      'not-compliant': 'Not compliant',
    };
    return labels[this.variant];
  }

  get isPositive(): boolean {
    return this.variant === 'pass' || this.variant === 'compliant';
  }

  get iconName(): 'check-circle' | 'fail' {
    return this.isPositive ? 'check-circle' : 'fail';
  }

  get iconSize(): 16 | 20 {
    return this.variant === 'pass' || this.variant === 'fail' ? 16 : 20;
  }
}
