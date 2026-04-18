import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTagComponent, StatusTagVariant } from '../status-tag/status-tag';

@Component({
  selector: 'app-historic-assessment',
  standalone: true,
  imports: [CommonModule, StatusTagComponent],
  templateUrl: './historic-assessment.html',
  styleUrl: './historic-assessment.scss',
})
export class HistoricAssessmentComponent {
  @Input() date = '';
  @Input() status: StatusTagVariant = 'compliant';
  @Input() evidence = '';
  @Input() actionedBy = '';
  @Input() rationale = '';
  @Input() detailsHref?: string;
}
