import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { SignInComponent } from './pages/sign-in/sign-in';
import { DevProcessingComponent } from './pages/dev-processing/dev-processing';
import { SuppliersComponent } from './pages/suppliers/suppliers';
import { ProvideCrpComponent } from './pages/provide-crp/provide-crp';
import { ProcessingComponent } from './pages/processing/processing';
import { ConfirmSupplierComponent } from './pages/confirm-supplier/confirm-supplier';
import { AssessmentWorkspaceComponent } from './pages/assessment-workspace/assessment-workspace';
import { AssessmentCompleteComponent } from './pages/assessment-complete/assessment-complete';
import { SupplierDetailComponent } from './pages/supplier-detail/supplier-detail';
import { BatchProcessingComponent } from './pages/batch-processing/batch-processing';
import { BatchReviewComponent } from './pages/batch-review/batch-review';

export const routes: Routes = [
  { path: 'sign-in', component: SignInComponent },
  { path: 'dev/processing', component: DevProcessingComponent },
  { path: '', redirectTo: 'suppliers', pathMatch: 'full' },
  { path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard] },
  { path: 'suppliers/:id', component: SupplierDetailComponent, canActivate: [authGuard] },
  { path: 'assessments/new/provide-crp', component: ProvideCrpComponent, canActivate: [authGuard] },
  { path: 'assessments/:id/processing', component: ProcessingComponent, canActivate: [authGuard] },
  { path: 'assessments/:id/confirm-supplier', component: ConfirmSupplierComponent, canActivate: [authGuard] },
  { path: 'assessments/:id/complete', component: AssessmentCompleteComponent, canActivate: [authGuard] },
  { path: 'assessments/:id', component: AssessmentWorkspaceComponent, canActivate: [authGuard] },
  { path: 'batches/:batchId/processing', component: BatchProcessingComponent, canActivate: [authGuard] },
  { path: 'batches/:batchId/review', component: BatchReviewComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'suppliers' },
];
