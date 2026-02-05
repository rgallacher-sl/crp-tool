import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-confirm-supplier',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './confirm-supplier.html',
  styleUrl: './confirm-supplier.scss',
})
export class ConfirmSupplierComponent implements OnInit {
  assessment: Assessment | null = null;
  supplierName = '';
  isEditing = false;

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

    this.assessment = assessment;
    this.supplierName = assessment.supplierName || 'Acme Construction Ltd';
  }

  startEditing(): void {
    this.isEditing = true;
  }

  confirmSupplier(): void {
    if (!this.assessment || !this.supplierName.trim()) return;

    this.assessmentService.updateSupplierName(this.assessment.id, this.supplierName.trim());
    this.router.navigate(['/assessments', this.assessment.id]);
  }
}
