import { Component, Input } from '@angular/core';
import { StatusTagComponent, StatusTagVariant } from '../status-tag/status-tag';

@Component({
  selector: 'app-supplier-list-item',
  standalone: true,
  imports: [StatusTagComponent],
  templateUrl: './supplier-list-item.html',
  styleUrl: './supplier-list-item.scss',
})
export class SupplierListItemComponent {
  @Input() supplierName = '';
  @Input() status: StatusTagVariant = 'compliant';
  @Input() lastAssessmentDate = '';
  @Input() lastActionedBy = '';
  @Input() last = false;
}
