import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './processing.html',
  styleUrl: './processing.scss',
})
export class ProcessingComponent implements OnInit, OnDestroy {
  assessment: Assessment | null = null;
  statusLabel = 'Preparing your assessment...';
  statusDetail = '';
  isFailed = false;
  errorMessage = '';
  steps: Array<{ label: string; state: 'pending' | 'active' | 'done' | 'error' }> = [];
  private tickId: ReturnType<typeof setInterval> | null = null;
  private plan: Array<{ status: Assessment['status']; durationMs: number }> = [];
  private boundaries: number[] = [];
  private totalDurationMs = 0;
  private startedAt = 0;
  private lastStepIndex = -1;
  private failureAtMs: number | null = null;
  private failureScenario: { step: string; code: string; message: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
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

    this.assessment = assessment;
    if (assessment.status === 'completed') {
      this.router.navigate(['/assessments', id, 'complete']);
      return;
    }

    if (assessment.status === 'ready') {
      this.router.navigate(['/assessments', id]);
      return;
    }

    this.assessmentService.restartProcessing(id, false);
    this.updateViewState();
    this.startStepSequence();
  }

  ngOnDestroy(): void {
    this.clearTicker();
  }

  retry(): void {
    if (!this.assessment) return;
    this.isFailed = false;
    this.errorMessage = '';
    this.assessmentService.restartProcessing(this.assessment.id, false);
    this.updateViewState();
    this.startStepSequence();
  }

  private updateViewState(): void {
    if (!this.assessment) return;
    this.steps = this.buildSteps(this.assessment);
    if (this.assessment.status === 'failed') {
      this.isFailed = true;
      this.statusLabel = 'We could not process this document';
      this.statusDetail = 'Please try again or return to suppliers.';
      this.errorMessage = this.assessment.errorMessage ?? 'An unexpected error occurred.';
      return;
    }

    this.isFailed = false;
    switch (this.assessment.status) {
      case 'fetching':
        this.statusLabel = 'Fetching the PDF...';
        this.statusDetail = 'We are retrieving the document from the link provided (typically 1–2s).';
        break;
      case 'uploading':
        this.statusLabel = 'Uploading the PDF...';
        this.statusDetail = 'This may take a moment depending on file size (typically 1–2s).';
        break;
      case 'uploaded':
        this.statusLabel = 'Upload complete';
        this.statusDetail = 'Starting document checks.';
        break;
      case 'processing_extraction':
        this.statusLabel = 'Extracting text...';
        this.statusDetail = 'We are reading the document structure (typically 5–7s).';
        break;
      case 'extraction_complete':
        this.statusLabel = 'Text extracted';
        this.statusDetail = 'Preparing semantic checks.';
        break;
      case 'processing_semantic':
        this.statusLabel = 'Checking PPN 006 data...';
        this.statusDetail = 'Identifying commitments and emissions data (typically 3.5–5s).';
        break;
      case 'semantic_complete':
        this.statusLabel = 'Data extracted';
        this.statusDetail = 'Validating compliance rules.';
        break;
      case 'processing_validation':
        this.statusLabel = 'Validating compliance...';
        this.statusDetail = 'Applying CP1–CP10 checks (typically 2–3s).';
        break;
      case 'processing_persistence':
        this.statusLabel = 'Finalizing checks...';
        this.statusDetail = 'Wrapping up the assessment (typically 1–2s).';
        break;
      default:
        this.statusLabel = 'Processing your assessment...';
        this.statusDetail = 'You can leave this page and come back.';
    }
  }

  private startStepSequence(): void {
    if (!this.assessment) return;
    this.clearTicker();

    this.plan = this.buildPlan(this.assessment);
    this.boundaries = [];
    this.totalDurationMs = 0;
    for (const step of this.plan) {
      this.totalDurationMs += step.durationMs;
      this.boundaries.push(this.totalDurationMs);
    }

    this.startedAt = Date.now();
    this.lastStepIndex = -1;
    this.failureScenario = this.getFailureScenario(this.assessment);
    this.failureAtMs = this.getFailureMoment(this.plan, this.failureScenario);

    this.tick();
    this.tickId = setInterval(() => this.ngZone.run(() => {
      this.tick();
      this.cdr.markForCheck();
    }), 200);
  }

  private tick(): void {
    if (!this.assessment) return;
    const elapsed = Date.now() - this.startedAt;

    if (this.failureAtMs !== null && elapsed >= this.failureAtMs) {
      this.assessmentService.markFailed(
        this.assessment.id,
        this.failureScenario!.code,
        this.failureScenario!.message,
        this.failureScenario!.step,
      );
      this.refreshAssessment();
      this.updateViewState();
      this.clearTicker();
      return;
    }

    if (elapsed >= this.totalDurationMs) {
      this.assessmentService.markReady(this.assessment.id);
      this.refreshAssessment();
      this.updateViewState();
      this.clearTicker();
      this.router.navigate(['/assessments', this.assessment.id]);
      return;
    }

    const stepIndex = this.boundaries.findIndex(boundary => elapsed < boundary);
    if (stepIndex !== -1 && stepIndex !== this.lastStepIndex) {
      const status = this.plan[stepIndex].status;
      this.assessmentService.updateStatus(this.assessment.id, status);
      this.refreshAssessment();
      this.updateViewState();
      this.lastStepIndex = stepIndex;
    }
  }

  private buildPlan(assessment: Assessment): Array<{ status: Assessment['status']; durationMs: number }> {
    const durations = {
      fetchOrUpload: this.randomBetween(800, 1200),
      extraction: this.randomBetween(1200, 1800),
      semantic: this.randomBetween(1200, 1800),
      validation: this.randomBetween(800, 1200),
      finalize: this.randomBetween(400, 600),
    };

    const firstStep: Assessment['status'] = assessment.documentSource === 'link' ? 'fetching' : 'uploading';

    return [
      { status: firstStep, durationMs: durations.fetchOrUpload },
      { status: 'processing_extraction', durationMs: durations.extraction },
      { status: 'processing_semantic', durationMs: durations.semantic },
      { status: 'processing_validation', durationMs: durations.validation },
      { status: 'processing_persistence', durationMs: durations.finalize },
    ];
  }

  private getFailureScenario(assessment: Assessment): { step: string; code: string; message: string } | null {
    const token = `${assessment.documentLabel} ${assessment.documentReference ?? ''}`.toLowerCase();
    if (token.includes('fail-network'))  return { step: 'upload',      code: 'network_error',     message: 'Your connection dropped during upload. Check your internet and try again.' };
    if (token.includes('fail-upload'))   return { step: 'upload',      code: 'upload_failed',     message: 'We had trouble retrieving your document. Please try again.' };
    if (token.includes('fail-storage'))  return { step: 'persistence', code: 'storage_failed',    message: 'Something went wrong saving your document. Please try again.' };
    if (token.includes('fail-extract'))  return { step: 'extraction',  code: 'extraction_failed', message: "We weren't able to read this document. If it's a scanned PDF, try a text-based version. Otherwise try again." };
    if (token.includes('fail-semantic')) return { step: 'semantic',    code: 'semantic_failed',   message: "We weren't able to analyse the document content. Please try again." };
    return null;
  }

  private randomBetween(minMs: number, maxMs: number): number {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  private clearTicker(): void {
    if (this.tickId) clearInterval(this.tickId);
    this.tickId = null;
  }

  private refreshAssessment(): void {
    if (!this.assessment) return;
    this.assessment = this.assessmentService.getAssessmentById(this.assessment.id) ?? null;
  }

  private getFailureMoment(
    plan: Array<{ status: Assessment['status']; durationMs: number }>,
    failure: { step: string; code: string; message: string } | null,
  ): number | null {
    if (!failure) return null;
    const failureStatus = this.mapFailureStatus(failure.step);
    const index = plan.findIndex(step => step.status === failureStatus);
    if (index === -1) return null;
    const start = index === 0 ? 0 : this.boundaries[index - 1];
    return start + this.randomBetween(500, 1000);
  }

  private mapFailureStatus(step: string): Assessment['status'] {
    if (step === 'upload') return this.assessment?.documentSource === 'link' ? 'fetching' : 'uploading';
    if (step === 'extraction') return 'processing_extraction';
    if (step === 'semantic') return 'processing_semantic';
    if (step === 'validation') return 'processing_validation';
    return 'processing_persistence';
  }

  private buildSteps(assessment: Assessment): Array<{ label: string; state: 'pending' | 'active' | 'done' | 'error' }> {
    const order: Array<{ key: string; label: string }> = [
      {
        key: assessment.documentSource === 'link' ? 'fetching' : 'uploading',
        label: assessment.documentSource === 'link' ? 'Fetching PDF' : 'Uploading PDF',
      },
      { key: 'processing_extraction', label: 'Extracting text' },
      { key: 'processing_semantic', label: 'Checking PPN 006 data' },
      { key: 'processing_validation', label: 'Validating compliance' },
    ];

    return order.map(step => ({
      label: step.label,
      state: this.getStepState(assessment, step.key),
    }));
  }

  private getStepState(assessment: Assessment, key: string): 'pending' | 'active' | 'done' | 'error' {
    if (assessment.status === 'failed') {
      return assessment.failedStep === this.mapFailureStep(key) ? 'error' : 'pending';
    }

    const rank = this.getStatusRank(assessment.status);
    const stepRank = this.getStatusRank(key as Assessment['status']);

    if (rank > stepRank) return 'done';
    if (rank === stepRank) return 'active';
    return 'pending';
  }

  private mapFailureStep(key: string): string {
    if (key === 'fetching' || key === 'uploading') return 'upload';
    if (key === 'processing_extraction') return 'extraction';
    if (key === 'processing_semantic') return 'semantic';
    if (key === 'processing_validation') return 'validation';
    if (key === 'processing_persistence') return 'persistence';
    return key;
  }

  private getStatusRank(status: Assessment['status']): number {
    const order: Assessment['status'][] = [
      'fetching',
      'uploading',
      'uploaded',
      'processing_extraction',
      'extraction_complete',
      'processing_semantic',
      'semantic_complete',
      'processing_validation',
      'processing_persistence',
      'ready',
      'completed',
      'failed',
    ];
    const index = order.indexOf(status);
    return index === -1 ? 0 : index;
  }
}
