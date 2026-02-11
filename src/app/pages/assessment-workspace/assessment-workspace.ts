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
  showAllFindings = false;
  ppnFindings = [
    {
      code: 'CP1',
      rule: 'Net Zero year ≤ 2050',
      result: 'pass',
      label: 'Pass',
      evidence: 'Net Zero target stated as 2045 (Executive summary).',
    },
    {
      code: 'CP2',
      rule: 'Baseline year and emissions present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Baseline year 2019 with totals listed in emissions table.',
    },
    {
      code: 'CP3',
      rule: 'Scope 1 value present and > 0 or explicitly zero',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 1 shown as 210 tCO2e in 2019 baseline.',
    },
    {
      code: 'CP4',
      rule: 'Scope 2 value present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Scope 2 reported alongside Scope 1 in table.',
    },
    {
      code: 'CP5',
      rule: 'All five Scope 3 categories reported',
      result: 'check',
      label: 'Check',
      evidence: 'Scope 3 list includes 4 categories; one appears missing.',
    },
    {
      code: 'CP6',
      rule: 'Emissions in tCO2e format',
      result: 'pass',
      label: 'Pass',
      evidence: 'All emissions totals expressed in tCO2e units.',
    },
    {
      code: 'CP7',
      rule: 'At least one environmental measure documented',
      result: 'pass',
      label: 'Pass',
      evidence: 'Measures section lists fleet electrification and retrofit plan.',
    },
    {
      code: 'CP8',
      rule: 'CRP URL accessible and public',
      result: 'pass',
      label: 'Pass',
      evidence: 'Public PDF retrieved from supplied link.',
    },
    {
      code: 'CP9',
      rule: 'Director name, title, and date present',
      result: 'pass',
      label: 'Pass',
      evidence: 'Signed by Operations Director on 12 Jan 2025.',
    },
    {
      code: 'CP10',
      rule: 'Sign-off date within 6 months of financial year-end',
      result: 'check',
      label: 'Check',
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

  selectOutcome(outcome: AssessmentOutcome): void {
    this.selectedOutcome = outcome;
    this.error = '';
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

    this.assessmentService.updateSupplierName(this.assessment.id, trimmedName);

    this.assessmentService.completeAssessment(
      this.assessment.id,
      this.selectedOutcome,
      this.notes,
    );

    this.router.navigate(['/assessments', this.assessment.id, 'complete']);
  }

  toggleFindings(): void {
    this.showAllFindings = !this.showAllFindings;
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
