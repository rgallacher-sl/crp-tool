import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-headline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-headline.html',
  styleUrl: './metric-headline.scss',
})
export class MetricHeadlineComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() unit: string = '';
  /** Signed percentage change, e.g. -8 shows "↘ 8%", +5 shows "↗ 5%" */
  @Input() trend?: number;
  /** Whether the trend badge is shown as success (green) or warning (red) */
  @Input() trendVariant: 'success' | 'warning' = 'success';

  get trendAbs(): number {
    return this.trend != null ? Math.abs(this.trend) : 0;
  }

  get trendArrow(): string {
    if (this.trend == null) return '';
    return this.trend < 0 ? '↘' : '↗';
  }
}
