import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers';
import { ProvideCrpComponent } from './pages/provide-crp/provide-crp';
import { ProcessingComponent } from './pages/processing/processing';
import { ConfirmSupplierComponent } from './pages/confirm-supplier/confirm-supplier';
import { AssessmentWorkspaceComponent } from './pages/assessment-workspace/assessment-workspace';
import { AssessmentCompleteComponent } from './pages/assessment-complete/assessment-complete';
import { SupplierDetailComponent } from './pages/supplier-detail/supplier-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'suppliers', pathMatch: 'full' },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'suppliers/:id', component: SupplierDetailComponent },
  { path: 'assessments/new/provide-crp', component: ProvideCrpComponent },
  { path: 'assessments/:id/processing', component: ProcessingComponent },
  { path: 'assessments/:id/confirm-supplier', component: ConfirmSupplierComponent },
  { path: 'assessments/:id/complete', component: AssessmentCompleteComponent },
  { path: 'assessments/:id', component: AssessmentWorkspaceComponent },
  { path: '**', redirectTo: 'suppliers' },
];
