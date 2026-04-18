import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
})
export class AccordionComponent {
  @Input() title = '';
  @Input() expanded = false;

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
