import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../../components/icon/icon';
import { StatusTagComponent } from '../../components/status-tag/status-tag';
import { DividerComponent } from '../../components/divider/divider';
import { AttachmentComponent } from '../../components/attachment/attachment';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb';
import { DrilldownMetadataComponent } from '../../components/drilldown-metadata/drilldown-metadata';
import { SupplierListHeaderComponent } from '../../components/supplier-list-header/supplier-list-header';
import { ExpandCollapseComponent } from '../../components/expand-collapse/expand-collapse';
import { RadioButtonComponent } from '../../components/radio-button/radio-button';
import { CheckboxComponent } from '../../components/checkbox/checkbox';
import { PaginationComponent } from '../../components/pagination/pagination';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { FreeTextBoxComponent } from '../../components/free-text-box/free-text-box';
import { FileUploadComponent } from '../../components/file-upload/file-upload';
import { PasswordFieldComponent } from '../../components/password-field/password-field';
import { EmailFieldComponent } from '../../components/email-field/email-field';
import { AssessmentRowComponent } from '../../components/assessment-row/assessment-row';
import { SupplierListItemComponent } from '../../components/supplier-list-item/supplier-list-item';
import { HistoricAssessmentComponent } from '../../components/historic-assessment/historic-assessment';
import { SummaryListComponent } from '../../components/summary-list/summary-list';
import { NotificationBannerComponent } from '../../components/notification-banner/notification-banner';

@Component({
  selector: 'app-dev-components',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    StatusTagComponent,
    DividerComponent,
    AttachmentComponent,
    BreadcrumbComponent,
    DrilldownMetadataComponent,
    SupplierListHeaderComponent,
    ExpandCollapseComponent,
    RadioButtonComponent,
    CheckboxComponent,
    PaginationComponent,
    DropdownComponent,
    FreeTextBoxComponent,
    FileUploadComponent,
    PasswordFieldComponent,
    EmailFieldComponent,
    AssessmentRowComponent,
    SupplierListItemComponent,
    HistoricAssessmentComponent,
    SummaryListComponent,
    NotificationBannerComponent,
  ],
  templateUrl: './dev-components.html',
  styleUrl: './dev-components.scss',
})
export class DevComponentsComponent {
  readonly iconNames: IconName[] = [
    'retry', 'back-arrow', 'fail', 'tick', 'error', 'check-circle',
    'chevron-down', 'chevron-right', 'upload', 'download', 'file',
    'link', 'open-in-new', 'close', 'wifi-off', 'progress',
  ];

  expanded = false;
  radioValue = 'option-a';
  checkboxChecked = true;
  currentPage = 1;
  dropdownValue = '';
  freeTextValue = '';
  passwordValue = '';
  emailValue = '';

  dropdownOptions = [
    { value: 'alpha', label: 'Alpha Corp' },
    { value: 'beta', label: 'Beta Ltd' },
    { value: 'gamma', label: 'Gamma PLC' },
  ];

  breadcrumbItems = [
    { label: 'Suppliers', href: '/suppliers' },
    { label: 'Acme Ltd', href: '/suppliers/1' },
    { label: 'Assessment' },
  ];

  drilldownLinks = [
    { label: 'View assessment', href: '/assessments/1' },
    { label: 'Company website', href: 'https://example.com', external: true },
  ];

  summaryRows = [
    { key: 'Company name', value: 'Acme Ltd' },
    { key: 'Companies House No.', value: '01234567' },
    { key: 'Assessment date', value: '12 April 2026', downloadHref: '/download/report.pdf' },
  ];

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}
