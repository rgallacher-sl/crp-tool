import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-divider',
  standalone: true,
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
})
export class DividerComponent {
  @Input() label = 'or';
}
