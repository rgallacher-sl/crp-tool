export interface Assessment {
  id: string;
  supplierName: string;
  documentLabel: string;
  documentSource: 'link' | 'upload';
  status: 'processing' | 'ready' | 'completed';
  outcome: 'meets' | 'does_not_meet' | 'unclear' | null;
  notes: string;
  createdDate: Date;
  completedDate: Date | null;
}

export interface Supplier {
  id: string;
  name: string;
}

export type AssessmentOutcome = 'meets' | 'does_not_meet' | 'unclear';
