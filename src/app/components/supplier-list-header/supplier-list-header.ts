import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-supplier-list-header',
  standalone: true,
  templateUrl: './supplier-list-header.html',
  styleUrl: './supplier-list-header.scss',
})
export class SupplierListHeaderComponent {
  @Input() columns: string[] = ['Supplier', 'Compliance status', 'Date of last assessment', 'Last actioned by'];
}
