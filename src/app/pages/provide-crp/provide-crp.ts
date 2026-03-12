import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';

interface FileEntry {
  file: File;
  state: 'uploading' | 'uploaded';
  timer: ReturnType<typeof setTimeout> | null;
}

@Component({
  selector: 'app-provide-crp',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './provide-crp.html',
  styleUrl: './provide-crp.scss',
})
export class ProvideCrpComponent implements OnDestroy {
  urlInputs: string[] = [''];
  fileEntries: FileEntry[] = [];
  isDragging = false;
  error = '';
  announcement = '';
  readonly sourceHelpId = 'source-help';
  readonly sourceErrorId = 'source-error';
  readonly sourceStatusId = 'source-status';

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  get totalInputCount(): number {
    return this.validUrls().length + this.uploadedFiles().length;
  }

  get continueLabel(): string {
    return this.totalInputCount > 1 ? 'Run assessments' : 'Run assessment';
  }

  canContinue(): boolean {
    return this.totalInputCount > 0 && this.fileEntries.every(e => e.state === 'uploaded');
  }

  addLinkInput(): void {
    this.urlInputs.push('');
  }

  removeLinkInput(index: number): void {
    this.urlInputs.splice(index, 1);
    this.error = '';
  }

  trackByIndex(index: number): number {
    return index;
  }

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
    if (!files) return;
    let anyRejected = false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.isPdfFile(file)) {
        this.addFileEntry(file);
      } else {
        anyRejected = true;
      }
    }
    if (anyRejected) {
      this.error = 'Some files were skipped — only PDF files are accepted.';
      this.announcement = this.error;
    } else {
      this.error = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    let anyRejected = false;
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (this.isPdfFile(file)) {
        this.addFileEntry(file);
      } else {
        anyRejected = true;
      }
    }
    if (anyRejected) {
      this.error = 'Some files were skipped — only PDF files are accepted.';
      this.announcement = this.error;
    } else {
      this.error = '';
    }
    input.value = '';
  }

  openFilePicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onUploadPanelKeydown(event: KeyboardEvent, fileInput: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFilePicker(fileInput);
    }
  }

  removeFile(index: number): void {
    const entry = this.fileEntries[index];
    if (entry.timer) clearTimeout(entry.timer);
    this.fileEntries.splice(index, 1);
    this.error = '';
    this.announcement = 'File removed.';
  }

  onContinue(): void {
    if (!this.canContinue()) {
      this.error = 'Please provide at least one link or PDF.';
      this.announcement = this.error;
      return;
    }

    const urls = this.validUrls();
    const invalidUrl = urls.find(u => !this.isValidUrl(u));
    if (invalidUrl) {
      this.error = 'One or more links are not valid URLs.';
      this.announcement = this.error;
      return;
    }

    const files = this.uploadedFiles();
    const total = urls.length + files.length;

    if (total === 1) {
      // Single-document flow
      if (files.length === 1) {
        const assessment = this.assessmentService.createAssessment(files[0].name, 'upload');
        this.router.navigate(['/assessments', assessment.id, 'processing']);
      } else {
        const url = urls[0];
        const label = this.extractDomain(url);
        const assessment = this.assessmentService.createAssessment(label, 'link', url);
        this.router.navigate(['/assessments', assessment.id, 'processing']);
      }
    } else {
      // Batch flow
      const inputs: Array<{ documentLabel: string; documentSource: 'link' | 'upload'; documentReference?: string }> = [];
      for (const url of urls) {
        inputs.push({ documentLabel: this.extractDomain(url), documentSource: 'link', documentReference: url });
      }
      for (const file of files) {
        inputs.push({ documentLabel: file.name, documentSource: 'upload' });
      }
      const batch = this.assessmentService.createBatch(inputs);
      this.router.navigate(['/batches', batch.id, 'processing']);
    }
  }

  private validUrls(): string[] {
    return this.urlInputs.map(u => u.trim()).filter(u => u.length > 0);
  }

  private uploadedFiles(): File[] {
    return this.fileEntries.filter(e => e.state === 'uploaded').map(e => e.file);
  }

  private addFileEntry(file: File): void {
    const entry: FileEntry = { file, state: 'uploading', timer: null };
    this.fileEntries.push(entry);
    this.announcement = `Uploading ${file.name}.`;
    entry.timer = setTimeout(() => {
      this.ngZone.run(() => {
        entry.state = 'uploaded';
        entry.timer = null;
        this.announcement = `Upload complete: ${file.name}.`;
        this.cdr.markForCheck();
      });
    }, 1200);
  }

  private isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private extractDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return `Carbon Reduction Plan (${hostname})`;
    } catch {
      return 'Carbon Reduction Plan (link)';
    }
  }

  ngOnDestroy(): void {
    for (const entry of this.fileEntries) {
      if (entry.timer) clearTimeout(entry.timer);
    }
  }
}
