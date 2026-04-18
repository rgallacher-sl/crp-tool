import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-expand-collapse',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './expand-collapse.html',
  styleUrl: './expand-collapse.scss',
})
export class ExpandCollapseComponent {
  @Input() expanded = true;
  @Output() toggle = new EventEmitter<boolean>();

  onToggle(): void {
    this.expanded = !this.expanded;
    this.toggle.emit(this.expanded);
  }
}
