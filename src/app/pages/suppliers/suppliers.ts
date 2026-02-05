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
  suppliers: Array<Supplier & { outcomeLabel: string; lastChecked: string }> = [];
  hasAssessments = false;

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const suppliers = this.assessmentService.getSuppliers();
    this.hasAssessments = suppliers.length > 0;

    this.suppliers = suppliers.map(s => {
      const latest = this.assessmentService.getLatestAssessmentForSupplier(s.name);
      return {
        ...s,
        outcomeLabel: latest ? this.assessmentService.getOutcomeLabel(latest.outcome) : '',
        lastChecked: latest ? this.assessmentService.formatDate(latest.createdDate) : '',
      };
    });
  }

  startFirstAssessment(): void {
    this.router.navigate(['/assessments/new/provide-crp']);
  }
}
