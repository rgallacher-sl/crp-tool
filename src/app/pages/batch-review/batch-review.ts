import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, Batch } from '../../models/assessment.model';

@Component({
  selector: 'app-batch-review',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './batch-review.html',
  styleUrl: './batch-review.scss',
})
export class BatchReviewComponent implements OnInit {
  batch: Batch | null = null;
  failed: Assessment[] = [];
  bulkConfirmable: Assessment[] = [];
  exceptions: Assessment[] = [];
  completed: Assessment[] = [];

  supplierNames: Record<string, string> = {};
  supplierNameErrors: Record<string, boolean> = {};
  confirmError = '';
  recentlyConfirmedCount = 0;
  successBanner = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public assessmentService: AssessmentService,
  ) {}

  get batchId(): string {
    return this.batch?.id ?? '';
  }

  get allResolved(): boolean {
    return this.bulkConfirmable.length === 0 && this.exceptions.length === 0;
  }

  get confirmAllDisabled(): boolean {
    return this.bulkConfirmable.some(a => !this.supplierNames[a.id]?.trim());
  }

  get outcomeSummary(): { meets: number; does_not_meet: number; unclear: number; failed: number } {
    const all = this.assessmentService.getAssessmentsForBatch(this.batchId);
    return {
      meets: all.filter(a => a.outcome === 'meets').length,
      does_not_meet: all.filter(a => a.outcome === 'does_not_meet').length,
      unclear: all.filter(a => a.outcome === 'unclear').length,
      failed: this.failed.length,
    };
  }

  ngOnInit(): void {
    const batchId = this.route.snapshot.paramMap.get('batchId');
    if (!batchId) {
      this.router.navigate(['/suppliers']);
      return;
    }

    const batch = this.assessmentService.getBatchById(batchId);
    if (!batch) {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.batch = batch;

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { successBanner?: string } | undefined;
    if (state?.successBanner) {
      this.successBanner = `Decision recorded for ${state.successBanner}`;
    } else {
      const historyState = window.history.state as { successBanner?: string } | undefined;
      if (historyState?.successBanner) {
        this.successBanner = `Decision recorded for ${historyState.successBanner}`;
      }
    }

    this.loadAssessments();
  }

  confirmAll(): void {
    this.confirmError = '';
    const hasErrors = this.bulkConfirmable.some(a => {
      const name = this.supplierNames[a.id]?.trim();
      if (!name) {
        this.supplierNameErrors[a.id] = true;
        return true;
      }
      return false;
    });

    if (hasErrors) {
      this.confirmError = 'Enter a supplier name for each document before confirming.';
      return;
    }

    for (const a of this.bulkConfirmable) {
      this.assessmentService.updateSupplierName(a.id, this.supplierNames[a.id].trim());
    }

    const ids = this.bulkConfirmable.map(a => a.id);
    const count = ids.length;
    this.assessmentService.bulkCompleteAssessments(ids, 'meets', '');
    if (this.batch) this.assessmentService.updateBatchStatus(this.batch.id);
    this.recentlyConfirmedCount += count;
    this.successBanner = `${count} supplier${count === 1 ? '' : 's'} confirmed as compliant`;
    this.loadAssessments();
  }

  clearSupplierError(id: string): void {
    this.supplierNameErrors[id] = false;
    if (this.confirmError && !this.bulkConfirmable.some(a => this.supplierNameErrors[a.id])) {
      this.confirmError = '';
    }
  }

  reviewUrl(assessment: Assessment): string[] {
    return ['/assessments', assessment.id];
  }

  reviewQueryParams(assessment: Assessment): Record<string, string> {
    return { returnUrl: `/batches/${this.batchId}/review` };
  }

  private loadAssessments(): void {
    if (!this.batch) return;
    const all = this.assessmentService.getAssessmentsForBatch(this.batch.id);

    this.failed = all.filter(a => a.status === 'failed');
    this.completed = all.filter(a => a.status === 'completed');

    const ready = all.filter(a => a.status === 'ready');
    this.bulkConfirmable = ready.filter(a => {
      const aiOutcome = this.assessmentService.deriveAiOutcome(a);
      return a.aiConfidence >= 0.85 && aiOutcome === 'meets';
    });
    this.exceptions = ready.filter(a => {
      const aiOutcome = this.assessmentService.deriveAiOutcome(a);
      return a.aiConfidence < 0.85 || aiOutcome !== 'meets';
    });

    for (const a of [...this.bulkConfirmable, ...this.exceptions]) {
      if (!(a.id in this.supplierNames)) {
        this.supplierNames[a.id] = a.supplierName ?? '';
      }
    }
  }

  confidencePct(a: Assessment): string {
    return `${Math.round(a.aiConfidence * 100)}%`;
  }

  aiOutcomeLabel(a: Assessment): string {
    const outcome = this.assessmentService.deriveAiOutcome(a);
    return this.assessmentService.getOutcomeLabel(outcome);
  }
}
