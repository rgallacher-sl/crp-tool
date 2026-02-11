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
  notes = '';
  error = '';
  supplierName = '';
  showAllFindings = false;
  ppnFindings = [
    {
      code: 'CP1',
      rule: 'Net Zero year ≤ 2050',
      result: 'pass',
      label: 'Pass',
      evidence: 'Net Zero target stated as 2045 (Executive summary).',
      reason: 'Net Zero year is stated, but double-check the target year in the summary.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP2',
      rule: 'Baseline year and emissions present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Baseline year 2019 with totals listed in emissions table.',
      reason: 'Baseline year or emissions table may be missing or unclear.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP3',
      rule: 'Scope 1 value present and > 0 or explicitly zero',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 1 shown as 210 tCO2e in 2019 baseline.',
      reason: 'Scope 1 value is missing or not clearly stated.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP4',
      rule: 'Scope 2 value present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 2 reported alongside Scope 1 in table.',
      reason: 'Scope 2 value is missing or not clearly stated.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP5',
      rule: 'All five Scope 3 categories reported',
      result: 'check',
      label: 'Check',
      evidence: 'Scope 3 list includes 4 categories; one appears missing.',
      reason: 'One or more Scope 3 categories are missing from the plan.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP6',
      rule: 'Emissions in tCO2e format',
      result: 'pass',
      label: 'Pass',
      evidence: 'All emissions totals expressed in tCO2e units.',
      reason: 'Emissions are not reported in tCO2e units.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP7',
      rule: 'At least one environmental measure documented',
      result: 'pass',
      label: 'Pass',
      evidence: 'Measures section lists fleet electrification and retrofit plan.',
      reason: 'No clear environmental measures are described.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP8',
      rule: 'CRP URL accessible and public',
      result: 'pass',
      label: 'Pass',
      evidence: 'Public PDF retrieved from supplied link.',
      reason: 'CRP URL is inaccessible or not public.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP9',
      rule: 'Director name, title, and date present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Signed by Operations Director on 12 Jan 2025.',
      reason: 'Director name, title, or sign-off date is missing.',
      reviewer: 'agree',
      override: false,
    },
    {
      code: 'CP10',
      rule: 'Sign-off date within 6 months of financial year-end',
      result: 'check',
      label: 'Check',
      evidence: 'Financial year-end not explicitly stated.',
      reason: 'Sign-off date cannot be verified against the financial year-end.',
      reviewer: 'agree',
      override: false,
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
    this.showAllFindings = !this.areAllFindingsPass();
  }

  recordDecision(): void {
    if (!this.assessment) return;

    const trimmedName = this.supplierName.trim();
    if (!trimmedName) {
      this.error = 'Please confirm the supplier name before recording your decision.';
      return;
    }

    const trimmedNotes = this.notes.trim();
    if (this.requiresNotes && !trimmedNotes) {
      this.error = 'Please add a note explaining the criteria that require review.';
      return;
    }

    this.assessmentService.updateSupplierName(this.assessment.id, trimmedName);

    this.assessmentService.completeAssessment(
      this.assessment.id,
      this.computedOutcome,
      this.notes,
    );

    this.router.navigate(['/assessments', this.assessment.id, 'complete']);
  }

  toggleFindings(): void {
    this.showAllFindings = !this.showAllFindings;
  }

  onFeedbackChange(finding: { code: string; reviewer: string | null; reason?: string | null }): void {
    if (!finding.reviewer || !finding.reason) return;
    if (finding.reviewer === 'agree') return;
    const line = `${finding.code}: ${finding.reason}`;
    if (!this.notes.trim()) {
      this.notes = line;
      return;
    }
    const existing = this.notes.split('\n').map(entry => entry.trim());
    if (!existing.includes(line)) {
      this.notes = `${this.notes.trim()}\n${line}`;
    }
  }

  toggleOverride(finding: { code: string; reviewer: string | null; reason?: string | null; override?: boolean }): void {
    finding.override = !finding.override;
    if (!finding.override) {
      const wasReview = finding.reviewer === 'disagree' || finding.reviewer === 'check';
      finding.reviewer = 'agree';
      if (wasReview && finding.reason) {
        this.removeReasonLine(finding.code, finding.reason);
      }
    }
  }

  private removeReasonLine(code: string, reason: string): void {
    const line = `${code}: ${reason}`;
    const lines = this.notes.split('\n').map(entry => entry.trim()).filter(Boolean);
    const next = lines.filter(entry => entry !== line);
    this.notes = next.join('\n');
  }

  get requiresNotes(): boolean {
    return this.ppnFindings.some(finding => finding.reviewer === 'disagree' || finding.reviewer === 'check');
  }

  getReviewerLabel(reviewer: string | null): string {
    if (reviewer === 'disagree') return 'Disagree';
    if (reviewer === 'check') return 'Unsure';
    return 'Agree';
  }

  get computedOutcome(): AssessmentOutcome {
    let hasFail = false;
    let hasUnclear = false;

    for (const finding of this.ppnFindings) {
      const reviewer = finding.reviewer;
      if (!reviewer || reviewer === 'check') {
        hasUnclear = true;
        continue;
      }

      const effective =
        reviewer === 'agree'
          ? finding.result
          : finding.result === 'fail'
            ? 'pass'
            : 'fail';

      if (effective === 'fail') {
        hasFail = true;
      } else if (effective === 'check') {
        hasUnclear = true;
      }
    }

    if (hasFail) return 'does_not_meet';
    if (hasUnclear) return 'unclear';
    return 'meets';
  }

  get computedOutcomeLabel(): string {
    return this.assessmentService.getOutcomeLabel(this.computedOutcome);
  }

  get computedOutcomeNote(): string {
    const pending = this.ppnFindings.filter(finding => !finding.reviewer).length;
    const unsure = this.ppnFindings.filter(finding => finding.reviewer === 'check').length;
    if (this.computedOutcome === 'unclear') {
      if (pending && unsure) {
        return 'Some criteria are not reviewed and some are marked as unsure.';
      }
      if (pending) {
        return 'Some criteria are not yet reviewed.';
      }
      if (unsure) {
        return 'Some criteria are marked as unsure.';
      }
    }
    if (this.computedOutcome === 'meets') {
      return 'All criteria are agreed and passing.';
    }
    return 'At least one criterion is marked as not meeting the requirement.';
  }

  get aiRecommendation(): { label: string; status: 'pass' | 'fail' | 'check' } {
    const hasFail = this.ppnFindings.some(finding => finding.result === 'fail');
    const hasCheck = this.ppnFindings.some(finding => finding.result === 'check');
    if (hasFail) return { label: 'Does not meet requirements', status: 'fail' };
    if (hasCheck) return { label: 'Needs review', status: 'check' };
    return { label: 'Meets requirements', status: 'pass' };
  }

  private areAllFindingsPass(): boolean {
    return this.ppnFindings.every(finding => finding.result === 'pass');
  }
}
