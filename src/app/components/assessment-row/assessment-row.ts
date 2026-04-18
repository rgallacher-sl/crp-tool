import { Component, Input } from '@angular/core';
import { StatusTagComponent, StatusTagVariant } from '../status-tag/status-tag';

@Component({
  selector: 'app-assessment-row',
  standalone: true,
  imports: [StatusTagComponent],
  templateUrl: './assessment-row.html',
  styleUrl: './assessment-row.scss',
})
export class AssessmentRowComponent {
  @Input() criteriaNumber: number | string = '';
  @Input() criteriaText = '';
  @Input() status: StatusTagVariant = 'pass';
  /** Whether this is the last row (closes the bottom border). */
  @Input() last = false;
}
