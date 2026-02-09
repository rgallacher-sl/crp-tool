import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-provide-crp',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './provide-crp.html',
  styleUrl: './provide-crp.scss',
})
export class ProvideCrpComponent {
  linkUrl = '';
  selectedFile: File | null = null;
  isDragging = false;
  error = '';

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        this.linkUrl = '';
        this.error = '';
      } else {
        this.error = 'Please upload a PDF file.';
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.linkUrl = '';
      this.error = '';
    }
  }

  onLinkChange(): void {
    if (this.linkUrl) {
      this.selectedFile = null;
    }
    this.error = '';
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  canContinue(): boolean {
    return !!(this.linkUrl.trim() || this.selectedFile);
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  onContinue(): void {
    if (!this.canContinue()) {
      this.error = 'Please provide a link or upload a PDF.';
      return;
    }

    if (this.linkUrl.trim() && !this.isValidUrl(this.linkUrl.trim())) {
      this.error = 'Please enter a valid URL.';
      return;
    }

    const documentLabel = this.selectedFile
      ? this.selectedFile.name
      : this.extractDomain(this.linkUrl);
    const documentSource = this.selectedFile ? 'upload' : 'link';
    const documentReference = this.selectedFile ? undefined : this.linkUrl.trim();

    const assessment = this.assessmentService.createAssessment(
      documentLabel,
      documentSource as 'link' | 'upload',
      documentReference,
    );
    this.router.navigate(['/assessments', assessment.id, 'processing']);
  }

  private extractDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return `Carbon Reduction Plan (${hostname})`;
    } catch {
      return 'Carbon Reduction Plan (link)';
    }
  }
}
