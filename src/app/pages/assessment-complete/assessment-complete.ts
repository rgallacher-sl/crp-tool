import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-complete',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './assessment-complete.html',
  styleUrl: './assessment-complete.scss',
})
export class AssessmentCompleteComponent implements OnInit {
  assessment: Assessment | null = null;
  outcomeLabel = '';
  completedDate = '';

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
    if (!assessment || assessment.status !== 'completed') {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.assessment = assessment;
    this.outcomeLabel = this.assessmentService.getOutcomeLabel(assessment.outcome);
    this.completedDate = assessment.completedDate
      ? this.assessmentService.formatDate(assessment.completedDate)
      : '';
  }
}
