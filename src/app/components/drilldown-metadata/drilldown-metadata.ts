import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

export interface DrilldownLink {
  label: string;
  href: string;
  external?: boolean;
}

@Component({
  selector: 'app-drilldown-metadata',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './drilldown-metadata.html',
  styleUrl: './drilldown-metadata.scss',
})
export class DrilldownMetadataComponent {
  /** Static metadata text shown at the start (e.g. department name). */
  @Input() meta?: string;
  /** Links shown in the row, separated by a vertical divider. */
  @Input() links: DrilldownLink[] = [];
}
