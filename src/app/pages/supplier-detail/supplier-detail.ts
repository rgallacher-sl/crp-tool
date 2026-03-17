import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, AssessmentOutcome, Supplier } from '../../models/assessment.model';

type EnrichedAssessment = Assessment & {
  outcomeLabel: string;
  aiOutcomeLabel: string;
  formattedDate: string;
  wasOverridden: boolean;
};

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './supplier-detail.html',
  styleUrl: './supplier-detail.scss',
})
export class SupplierDetailComponent implements OnInit {
  supplier: Supplier | null = null;
  assessments: EnrichedAssessment[] = [];

  activeOverrideId: string | null = null;
  overrideDraftOutcome: AssessmentOutcome | null = null;
  overrideDraftReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    readonly assessmentService: AssessmentService,
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
    this.loadAssessments();
  }

  openOverride(id: string, currentOutcome: AssessmentOutcome | null): void {
    this.activeOverrideId = id;
    this.overrideDraftOutcome = currentOutcome;
    this.overrideDraftReason = '';
  }

  cancelOverride(): void {
    this.activeOverrideId = null;
    this.overrideDraftOutcome = null;
    this.overrideDraftReason = '';
  }

  saveOverride(id: string): void {
    if (!this.overrideDraftOutcome || !this.overrideDraftReason.trim()) return;
    this.assessmentService.manualOverride(id, this.overrideDraftOutcome, this.overrideDraftReason.trim());
    this.cancelOverride();
    this.loadAssessments();
  }

  private loadAssessments(): void {
    if (!this.supplier) return;
    this.assessments = this.assessmentService
      .getAssessmentsForSupplier(this.supplier.name)
      .map(a => ({
        ...a,
        outcomeLabel: this.assessmentService.getOutcomeLabel(a.outcome),
        aiOutcomeLabel: this.assessmentService.getOutcomeLabel(a.aiOutcome),
        formattedDate: this.assessmentService.formatDate(a.createdDate),
        wasOverridden: a.aiOutcome !== null && a.aiOutcome !== a.outcome,
      }));
  }
}
