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
import { BadgeComponent } from '../../components/badge/badge';
import { TabBarComponent, Tab } from '../../components/tab-bar/tab-bar';
import { AccordionComponent } from '../../components/accordion/accordion';
import { NumberInputComponent } from '../../components/number-input/number-input';
import { SliderComponent } from '../../components/slider/slider';
import { SegmentedControlComponent, SegmentedOption } from '../../components/segmented-control/segmented-control';
import { SplitSliderComponent } from '../../components/split-slider/split-slider';
import { ExpandableTableComponent, TableColumn, TableRow, BarSegment } from '../../components/expandable-table/expandable-table';
import { MetricHeadlineComponent } from '../../components/metric-headline/metric-headline';

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
    BadgeComponent,
    TabBarComponent,
    AccordionComponent,
    NumberInputComponent,
    SliderComponent,
    SegmentedControlComponent,
    ExpandableTableComponent,
    MetricHeadlineComponent,
    SplitSliderComponent,
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

  activeTab = 'overview';
  tabs: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'history', label: 'History' },
  ];

  numberInputValue: number | null = 42;
  sliderValue = 60;
  splitSliderValue = 50;

  saasServices = [
    { label: 'Microsoft 365', checked: true, users: 100 as number | null },
    { label: 'Salesforce', checked: false, users: null as number | null },
    { label: 'Google', checked: true, users: 100 as number | null },
  ];

  segmentedValue = 'annual';
  segmentedOptions: SegmentedOption[] = [
    { label: 'Annual', value: 'annual' },
    { label: 'Monthly', value: 'monthly' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'category', label: 'Emissions Category' },
    { key: 'value', label: 'Estimated (tCO₂e)', align: 'right', numeric: true },
    { key: 'pct', label: '% of Total Estimate', align: 'right', numeric: true },
    { key: 'pct', label: '', type: 'bar' },
  ];

  tableRows: TableRow[] = [
    {
      id: 'cloud',
      cells: { category: 'Cloud infrastructure', value: '1,240.00', pct: 57 },
      barColor: 'var(--color-brand-primary)',
      children: [
        { id: 'cloud-compute', cells: { category: 'Compute', value: '820.00', pct: 37 }, barColor: 'var(--color-brand-primary)' },
        { id: 'cloud-storage', cells: { category: 'Storage', value: '420.00', pct: 19 }, barColor: 'var(--color-brand-primary)' },
      ],
    },
    {
      id: 'onprem',
      cells: { category: 'On-premise servers', value: '640.00', pct: 29 },
      barColor: 'var(--color-aa-pink)',
      children: [
        { id: 'onprem-servers', cells: { category: 'Servers', value: '480.00', pct: 22 }, barColor: 'var(--color-aa-pink)' },
        { id: 'onprem-cooling', cells: { category: 'Cooling', value: '160.00', pct: 7 }, barColor: 'var(--color-aa-pink)' },
      ],
    },
    {
      id: 'end-user',
      cells: { category: 'End-user devices', value: '310.00', pct: 14 },
      barColor: 'var(--color-success-green)',
    },
    {
      id: 'total',
      cells: { category: 'Total', value: '2,190.00', pct: 100 },
      isTotal: true,
      barSegments: [
        { color: 'var(--color-brand-primary)', pct: 57 },
        { color: 'var(--color-aa-pink)', pct: 29 },
        { color: 'var(--color-success-green)', pct: 14 },
      ],
    },
  ];
}
