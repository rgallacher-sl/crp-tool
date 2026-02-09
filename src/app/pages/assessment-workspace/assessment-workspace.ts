import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, AssessmentOutcome } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-workspace',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assessment-workspace.html',
  styleUrl: './assessment-workspace.scss',
})
export class AssessmentWorkspaceComponent implements OnInit {
  assessment: Assessment | null = null;
  selectedOutcome: AssessmentOutcome | null = null;
  notes = '';
  error = '';

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
  }

  selectOutcome(outcome: AssessmentOutcome): void {
    this.selectedOutcome = outcome;
    this.error = '';
  }

  recordDecision(): void {
    if (!this.assessment) return;

    if (!this.selectedOutcome) {
      this.error = 'Please select an outcome before recording your decision.';
      return;
    }

    this.assessmentService.completeAssessment(
      this.assessment.id,
      this.selectedOutcome,
      this.notes,
    );

    this.router.navigate(['/assessments', this.assessment.id, 'complete']);
  }
}
