import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Batch } from '../../models/assessment.model';

interface BatchRow {
  batch: Batch;
  formattedDate: string;
  total: number;
  meets: number;
  does_not_meet: number;
  unclear: number;
  failed: number;
  pending: number;
}

@Component({
  selector: 'app-batch-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './batch-history.html',
  styleUrl: './batch-history.scss',
})
export class BatchHistoryComponent implements OnInit {
  rows: BatchRow[] = [];

  constructor(private assessmentService: AssessmentService) {}

  ngOnInit(): void {
    this.rows = this.assessmentService.getBatches().map(batch => {
      const assessments = this.assessmentService.getAssessmentsForBatch(batch.id);
      return {
        batch,
        formattedDate: this.assessmentService.formatDate(batch.createdDate),
        total: assessments.length,
        meets: assessments.filter(a => a.outcome === 'meets').length,
        does_not_meet: assessments.filter(a => a.outcome === 'does_not_meet').length,
        unclear: assessments.filter(a => a.outcome === 'unclear').length,
        failed: assessments.filter(a => a.status === 'failed').length,
        pending: assessments.filter(a => a.status !== 'completed' && a.status !== 'failed').length,
      };
    });
  }
}
