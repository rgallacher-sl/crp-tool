import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-processing',
  standalone: true,
  templateUrl: './processing.html',
  styleUrl: './processing.scss',
})
export class ProcessingComponent implements OnInit, OnDestroy {
  private timerId: ReturnType<typeof setTimeout> | null = null;

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

    this.timerId = setTimeout(() => {
      this.assessmentService.markReady(id);
      this.router.navigate(['/assessments', id, 'confirm-supplier']);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
