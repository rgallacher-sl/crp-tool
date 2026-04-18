import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

export type AttachmentType = 'file' | 'link';

@Component({
  selector: 'app-attachment',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './attachment.html',
  styleUrl: './attachment.scss',
})
export class AttachmentComponent {
  @Input() type: AttachmentType = 'file';
  @Input() name = '';
  @Input() href?: string;
}
