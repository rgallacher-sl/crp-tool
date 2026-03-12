import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, Batch } from '../../models/assessment.model';

interface AssessmentRow {
  assessment: Assessment;
  stepLabel: string;
  stepState: 'active' | 'done' | 'error';
}

@Component({
  selector: 'app-batch-processing',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './batch-processing.html',
  styleUrl: './batch-processing.scss',
})
export class BatchProcessingComponent implements OnInit, OnDestroy {
  batch: Batch | null = null;
  rows: AssessmentRow[] = [];
  notifyState: 'idle' | 'granted' | 'denied' | 'unsupported' = 'idle';
  private tickId: ReturnType<typeof setInterval> | null = null;
  private navigated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  get readyCount(): number {
    return this.rows.filter(r =>
      r.assessment.status === 'ready' ||
      r.assessment.status === 'completed' ||
      r.assessment.status === 'failed',
    ).length;
  }

  get totalCount(): number {
    return this.rows.length;
  }

  get allDone(): boolean {
    return this.totalCount > 0 && this.readyCount === this.totalCount;
  }

  ngOnInit(): void {
    if (!('Notification' in window)) {
      this.notifyState = 'unsupported';
    } else if (Notification.permission === 'granted') {
      this.notifyState = 'granted';
    } else if (Notification.permission === 'denied') {
      this.notifyState = 'denied';
    }

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
    const assessments = this.assessmentService.getAssessmentsForBatch(batchId);

    for (const a of assessments) {
      this.assessmentService.startPipelineSimulation(a.id);
    }

    this.refreshRows();
    this.tickId = setInterval(() => this.ngZone.run(() => {
      this.refreshRows();
      this.cdr.markForCheck();
      if (this.allDone && !this.navigated) {
        this.navigated = true;
        this.clearTicker();
        this.sendNotification();
        const id = batchId;
        setTimeout(() => this.ngZone.run(() => this.router.navigate(['/batches', id, 'review'])), 900);
      }
    }), 200);
  }

  ngOnDestroy(): void {
    this.clearTicker();
  }

  cancel(): void {
    this.clearTicker();
    this.router.navigate(['/suppliers']);
  }

  async requestNotification(): Promise<void> {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    this.ngZone.run(() => {
      this.notifyState = permission === 'granted' ? 'granted' : 'denied';
      this.cdr.markForCheck();
    });
  }

  private sendNotification(): void {
    if (this.notifyState !== 'granted') return;
    new Notification('Batch ready', {
      body: `${this.totalCount} documents have been checked. Review the results now.`,
      icon: '/favicon.ico',
    });
  }

  private refreshRows(): void {
    if (!this.batch) return;
    const assessments = this.assessmentService.getAssessmentsForBatch(this.batch.id);
    this.rows = assessments.map(a => ({
      assessment: a,
      stepLabel: this.getStepLabel(a),
      stepState: this.getStepState(a),
    }));
  }

  private getStepLabel(a: Assessment): string {
    switch (a.status) {
      case 'fetching': return 'Fetching document';
      case 'uploading': return 'Uploading document';
      case 'uploaded':
      case 'processing_extraction':
      case 'extraction_complete': return 'Reading document contents';
      case 'processing_semantic':
      case 'semantic_complete':
      case 'processing_validation':
      case 'processing_persistence': return 'Checking PPN 006 requirements';
      case 'ready':
      case 'completed': return 'Complete';
      case 'failed': return a.errorMessage ?? 'Failed';
      default: return 'Processing';
    }
  }

  private getStepState(a: Assessment): 'active' | 'done' | 'error' {
    if (a.status === 'failed') return 'error';
    if (a.status === 'ready' || a.status === 'completed') return 'done';
    return 'active';
  }

  private clearTicker(): void {
    if (this.tickId) clearInterval(this.tickId);
    this.tickId = null;
  }
}
