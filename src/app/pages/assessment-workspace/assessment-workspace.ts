import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, AssessmentOutcome } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-workspace.html',
  styleUrl: './assessment-workspace.scss',
})
export class AssessmentWorkspaceComponent implements OnInit {
  assessment: Assessment | null = null;
  selectedOutcome: AssessmentOutcome | null = null;
  notes = '';
  error = '';
  supplierName = '';
  reviewConfirmed = false;

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

    const assessment = this.assessmentService.getAssessmentById(id);
    if (!assessment) {
      this.router.navigate(['/suppliers']);
      return;
    }

    if (assessment.status === 'completed') {
      this.router.navigate(['/assessments', id, 'complete']);
      return;
    }

    if (assessment.status !== 'ready') {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.assessment = assessment;
    this.supplierName = assessment.supplierName;
    this.reviewConfirmed = assessment.reviewCompleted;
  }

  selectOutcome(outcome: AssessmentOutcome): void {
    this.selectedOutcome = outcome;
    this.error = '';
  }

  toggleReview(checked: boolean): void {
    this.reviewConfirmed = checked;
    if (this.assessment) {
      this.assessmentService.markReviewed(this.assessment.id, checked);
    }
  }

  recordDecision(): void {
    if (!this.assessment) return;

    const trimmedName = this.supplierName.trim();
    if (!trimmedName) {
      this.error = 'Please confirm the supplier name before recording your decision.';
      return;
    }

    if (this.assessment.reviewRequired && !this.reviewConfirmed) {
      this.error = 'Please review the original document before recording your decision.';
      return;
    }

    if (!this.selectedOutcome) {
      this.error = 'Please select an outcome before recording your decision.';
      return;
    }

    this.assessmentService.updateSupplierName(this.assessment.id, trimmedName);

    this.assessmentService.completeAssessment(
      this.assessment.id,
      this.selectedOutcome,
      this.notes,
    );

    this.router.navigate(['/assessments', this.assessment.id, 'complete']);
  }
}
