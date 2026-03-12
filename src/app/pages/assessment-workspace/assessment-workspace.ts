import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, AssessmentOutcome } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './assessment-workspace.html',
  styleUrl: './assessment-workspace.scss',
})
export class AssessmentWorkspaceComponent implements OnInit {
  @ViewChild('cancelBtn') cancelBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('leaveBtn') leaveBtnRef!: ElementRef<HTMLButtonElement>;
  assessment: Assessment | null = null;
  selectedOutcome: AssessmentOutcome | null = null;
  notes = '';
  error = '';
  supplierName = '';
  pendingOverrideConfirmation = false;
  overrideConfirmed = false;
  showCancelConfirm = false;
  ppnFindings = [
    {
      code: '1',
      rule: 'Net Zero year ≤ 2050',
      result: 'pass',
      label: 'Pass',
      evidence: 'Net Zero target stated as 2045 (Executive summary).',
    },
    {
      code: '2',
      rule: 'Baseline year and emissions present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Baseline year 2019 with totals listed in emissions table.',
    },
    {
      code: '3',
      rule: 'Scope 1 value present and > 0 or explicitly zero',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 1 shown as 210 tCO2e in 2019 baseline.',
    },
    {
      code: '4',
      rule: 'Scope 2 value present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 2 reported alongside Scope 1 in table.',
    },
    {
      code: '5',
      rule: 'All five Scope 3 categories reported',
      result: 'check',
      label: 'Review',
      evidence: 'Scope 3 list includes 4 categories; one appears missing.',
    },
    {
      code: '6',
      rule: 'Emissions in tCO2e format',
      result: 'pass',
      label: 'Pass',
      evidence: 'All emissions totals expressed in tCO2e units.',
    },
    {
      code: '7',
      rule: 'At least one environmental measure documented',
      result: 'pass',
      label: 'Pass',
      evidence: 'Measures section lists fleet electrification and retrofit plan.',
    },
    {
      code: '8',
      rule: 'CRP URL accessible and public',
      result: 'pass',
      label: 'Pass',
      evidence: 'Public PDF retrieved from supplied link.',
    },
    {
      code: '9',
      rule: 'Director name, title, and date present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Signed by Operations Director on 12 Jan 2025.',
    },
    {
      code: '10',
      rule: 'Sign-off date within 6 months of financial year-end',
      result: 'fail',
      label: 'Fail',
      evidence: 'Financial year-end not explicitly stated.',
    },
  ];

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

    if (assessment.status !== 'ready' && assessment.status !== 'completed') {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.assessment = assessment;
    this.supplierName = assessment.supplierName;
  }

  selectOutcome(outcome: AssessmentOutcome): void {
    this.selectedOutcome = outcome;
    this.error = '';
    this.pendingOverrideConfirmation = false;
    this.overrideConfirmed = false;
  }

  recordDecision(): void {
    if (!this.assessment) return;

    const trimmedName = this.supplierName.trim();
    if (!trimmedName) {
      this.error = 'Please confirm the supplier name before recording your decision.';
      return;
    }

    if (!this.selectedOutcome) {
      this.error = 'Please select an outcome before recording your decision.';
      return;
    }

    if (this.isOutcomeDisagreement()) {
      if (!this.pendingOverrideConfirmation) {
        this.pendingOverrideConfirmation = true;
        this.overrideConfirmed = false;
        this.error = '';
        return;
      }

      if (!this.overrideConfirmed) {
        this.error = 'Please confirm that you want to override the AI result.';
        return;
      }

      if (this.notes.trim().length < 20) {
        this.error = 'Please add at least 20 characters of notes to explain the override.';
        return;
      }
    }

    this.assessmentService.updateSupplierName(this.assessment.id, trimmedName);

    this.assessmentService.completeAssessment(
      this.assessment.id,
      this.selectedOutcome,
      this.notes,
    );

    this.router.navigate(['/suppliers'], { state: { successBanner: trimmedName } });
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.showCancelConfirm) {
      this.dismissCancel();
    }
  }

  cancel(): void {
    this.showCancelConfirm = true;
    setTimeout(() => this.leaveBtnRef?.nativeElement.focus(), 0);
  }

  confirmCancel(): void {
    this.router.navigate(['/suppliers']);
  }

  dismissCancel(): void {
    this.showCancelConfirm = false;
    setTimeout(() => this.cancelBtnRef?.nativeElement.focus(), 0);
  }

  get aiOutcome(): AssessmentOutcome {
    const hasFail = this.ppnFindings.some(finding => finding.result === 'fail');
    if (hasFail) return 'does_not_meet';
    const hasReview = this.ppnFindings.some(finding => finding.result === 'check');
    if (hasReview) return 'unclear';
    return 'meets';
  }

  get showOverridePanel(): boolean {
    return this.pendingOverrideConfirmation && this.isOutcomeDisagreement();
  }

  get aiOutcomeLabel(): string {
    if (this.aiOutcome === 'meets') return 'Meets requirements';
    if (this.aiOutcome === 'does_not_meet') return 'Does not meet requirements';
    return 'Unclear';
  }

  get selectedOutcomeLabel(): string {
    if (this.selectedOutcome === 'meets') return 'Meets requirements';
    if (this.selectedOutcome === 'does_not_meet') return 'Does not meet requirements';
    if (this.selectedOutcome === 'unclear') return 'Unclear';
    return '';
  }

  get disagreementFindings(): typeof this.ppnFindings {
    if (this.aiOutcome === 'does_not_meet') {
      return this.ppnFindings.filter(finding => finding.result === 'fail');
    }
    if (this.aiOutcome === 'unclear') {
      return this.ppnFindings.filter(finding => finding.result === 'check');
    }
    return [];
  }

  private isOutcomeDisagreement(): boolean {
    return this.selectedOutcome !== null && this.selectedOutcome !== this.aiOutcome;
  }

  get isReadOnly(): boolean {
    return this.assessment?.status === 'completed';
  }

  get supplierId(): string {
    return this.assessment?.supplierName.toLowerCase().replace(/\s+/g, '-') ?? '';
  }

  get recordedOutcomeLabel(): string {
    return this.assessmentService.getOutcomeLabel(this.assessment?.outcome ?? null);
  }
}
