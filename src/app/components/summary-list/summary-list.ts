import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTagComponent, StatusTagVariant } from '../status-tag/status-tag';
import { IconComponent } from '../icon/icon';

export interface SummaryRow {
  key: string;
  value: string;
  /** If provided, renders a download link next to the value. */
  downloadHref?: string;
}

@Component({
  selector: 'app-summary-list',
  standalone: true,
  imports: [CommonModule, StatusTagComponent, IconComponent],
  templateUrl: './summary-list.html',
  styleUrl: './summary-list.scss',
})
export class SummaryListComponent {
  @Input() complianceStatus?: StatusTagVariant;
  @Input() rows: SummaryRow[] = [];
}
