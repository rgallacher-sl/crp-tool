import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, Supplier } from '../../models/assessment.model';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './supplier-detail.html',
  styleUrl: './supplier-detail.scss',
})
export class SupplierDetailComponent implements OnInit {
  supplier: Supplier | null = null;
  assessments: Array<Assessment & { outcomeLabel: string; formattedDate: string }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/suppliers']);
      return;
    }

    const supplier = this.assessmentService.getSupplierById(id);
    if (!supplier) {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.supplier = supplier;
    this.assessments = this.assessmentService
      .getAssessmentsForSupplier(supplier.name)
      .map(a => ({
        ...a,
        outcomeLabel: this.assessmentService.getOutcomeLabel(a.outcome),
        formattedDate: this.assessmentService.formatDate(a.createdDate),
      }));
  }
}
