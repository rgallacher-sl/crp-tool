import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisible = 5;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const half = Math.floor(this.maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisible - 1);
    if (end - start < this.maxVisible - 1) {
      start = Math.max(1, end - this.maxVisible + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages - 1) pages.push('...');
    if (end < this.totalPages) pages.push(this.totalPages);

    return pages;
  }

  goTo(page: number | '...'): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  prev(): void {
    if (this.currentPage > 1) this.goTo(this.currentPage - 1);
  }

  next(): void {
    if (this.currentPage < this.totalPages) this.goTo(this.currentPage + 1);
  }
}
