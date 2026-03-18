import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Supplier } from '../../models/assessment.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class SuppliersComponent implements OnInit {
  suppliers: Array<Supplier & { outcome: string | null; outcomeLabel: string; lastChecked: string; lastActionedBy: string }> = [];
  hasAssessments = false;
  successBanner = '';

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.successBanner = history.state?.successBanner ?? '';
    const suppliers = this.assessmentService.getSuppliers();
    this.hasAssessments = suppliers.length > 0;

    this.suppliers = suppliers.map(s => {
      const latest = this.assessmentService.getLatestAssessmentForSupplier(s.name);
      return {
        ...s,
        outcome: latest?.outcome ?? null,
        outcomeLabel: this.getComplianceLabel(latest?.outcome ?? null),
        lastChecked: latest ? this.assessmentService.formatDate(latest.createdDate) : '',
        lastActionedBy: latest?.actionedBy ?? '',
      };
    });
  }

  startFirstAssessment(): void {
    this.router.navigate(['/assessments/new/provide-crp']);
  }

  getComplianceLabel(outcome: string | null): string {
    switch (outcome) {
      case 'meets': return 'Compliant';
      case 'does_not_meet': return 'Not compliant';
      case 'unclear': return 'Unclear';
      default: return '—';
    }
  }
}
