import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

export type FileUploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUploadComponent {
  @Input() state: FileUploadState = 'idle';
  @Input() fileName = '';
  @Input() hint = '';
  @Input() accept = '';
  @Output() fileSelected = new EventEmitter<File>();
  @Output() removed = new EventEmitter<void>();

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      this.fileSelected.emit(file);
    }
  }

  remove(): void {
    this.fileName = '';
    this.state = 'idle';
    this.removed.emit();
  }
}
