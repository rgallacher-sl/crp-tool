import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
  type?: 'bar';
}

export interface BarSegment {
  color: string;
  pct: number;
}

export interface TableRow {
  id: string;
  cells: Record<string, string | number>;
  children?: TableRow[];
  isTotal?: boolean;
  barColor?: string;
  barSegments?: BarSegment[];
}

@Component({
  selector: 'app-expandable-table',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './expandable-table.html',
  styleUrl: './expandable-table.scss',
})
export class ExpandableTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];

  expandedRows = new Set<string>();

  isExpanded(id: string): boolean {
    return this.expandedRows.has(id);
  }

  toggle(id: string): void {
    if (this.expandedRows.has(id)) {
      this.expandedRows.delete(id);
    } else {
      this.expandedRows.add(id);
    }
  }

  toNumber(value: string | number): number {
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  }

  get cardLabelCol(): TableColumn | undefined {
    return this.columns.find(c => c.type !== 'bar');
  }

  get cardValueCol(): TableColumn | undefined {
    const nonBar = this.columns.filter(c => c.type !== 'bar');
    return nonBar[1];
  }

  get cardBarCols(): TableColumn[] {
    return this.columns.filter(c => c.type === 'bar');
  }

  toggleCard(row: TableRow): void {
    if (row.children?.length) this.toggle(row.id);
  }
}
