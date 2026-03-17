export interface Batch {
  id: string;
  assessmentIds: string[];
  status: 'processing' | 'ready' | 'completed';
  createdDate: Date;
}

export interface Assessment {
  id: string;
  batchId?: string;
  supplierName: string;
  documentLabel: string;
  documentSource: 'link' | 'upload';
  documentReference?: string;
  aiConfidence: number;
  reviewRequired: boolean;
  reviewCompleted: boolean;
  status:
    | 'fetching'
    | 'uploading'
    | 'uploaded'
    | 'processing_extraction'
    | 'extraction_complete'
    | 'processing_semantic'
    | 'semantic_complete'
    | 'processing_validation'
    | 'processing_persistence'
    | 'ready'
    | 'completed'
    | 'failed';
  errorCode?: string | null;
  errorMessage?: string | null;
  failedStep?: string | null;
  aiOutcome: AssessmentOutcome | null;
  outcome: 'meets' | 'does_not_meet' | 'unclear' | null;
  notes: string;
  actionedBy?: string;
  confirmationType: 'bulk' | 'individual' | null;
  overriddenBy?: string;
  overriddenAt?: Date | null;
  overrideReason?: string;
  previousOutcome?: AssessmentOutcome | null;
  createdDate: Date;
  completedDate: Date | null;
}

export interface Supplier {
  id: string;
  name: string;
}

export type AssessmentOutcome = 'meets' | 'does_not_meet' | 'unclear';
