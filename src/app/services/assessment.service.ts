import { Injectable } from '@angular/core';
import { Assessment, AssessmentOutcome, Batch, Supplier } from '../models/assessment.model';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly STORAGE_KEY = 'crp_assessments';
  private readonly BATCH_STORAGE_KEY = 'crp_batches';
  private assessments: Assessment[] = [];
  private batches: Batch[] = [];
  private readonly pipelineTimers = new Map<string, ReturnType<typeof setTimeout>[]>();
  private readonly statusOrder: Assessment['status'][] = [
    'fetching',
    'uploading',
    'uploaded',
    'processing_extraction',
    'extraction_complete',
    'processing_semantic',
    'semantic_complete',
    'processing_validation',
    'processing_persistence',
    'ready',
    'completed',
    'failed',
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.assessments = parsed.map((a: any) => ({
          ...a,
          createdDate: new Date(a.createdDate),
          completedDate: a.completedDate ? new Date(a.completedDate) : null,
          status: this.normalizeStatus(a.status),
          errorCode: a.errorCode ?? null,
          errorMessage: a.errorMessage ?? null,
          failedStep: a.failedStep ?? null,
          aiConfidence: typeof a.aiConfidence === 'number' ? a.aiConfidence : 0.9,
          reviewRequired: typeof a.reviewRequired === 'boolean' ? a.reviewRequired : false,
          reviewCompleted: typeof a.reviewCompleted === 'boolean' ? a.reviewCompleted : false,
        }));
      }
    } catch {
      this.assessments = [];
    }
    try {
      const storedBatches = localStorage.getItem(this.BATCH_STORAGE_KEY);
      if (storedBatches) {
        const parsed = JSON.parse(storedBatches);
        this.batches = parsed.map((b: any) => ({
          ...b,
          createdDate: new Date(b.createdDate),
        }));
      }
    } catch {
      this.batches = [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.assessments));
  }

  private saveBatchesToStorage(): void {
    localStorage.setItem(this.BATCH_STORAGE_KEY, JSON.stringify(this.batches));
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private normalizeStatus(status: string): Assessment['status'] {
    if (status === 'processing') return 'processing_extraction';
    if (status === 'ready' || status === 'completed' || status === 'failed') return status;
    return status as Assessment['status'];
  }

  getAssessments(): Assessment[] {
    return [...this.assessments];
  }

  getAssessmentById(id: string): Assessment | undefined {
    return this.assessments.find(a => a.id === id);
  }

  getCompletedAssessments(): Assessment[] {
    return this.assessments.filter(a => a.status === 'completed');
  }

  getSuppliers(): Supplier[] {
    const supplierMap = new Map<string, Supplier>();
    for (const a of this.getCompletedAssessments()) {
      const key = a.supplierName.toLowerCase();
      if (!supplierMap.has(key)) {
        supplierMap.set(key, {
          id: key.replace(/\s+/g, '-'),
          name: a.supplierName,
        });
      }
    }
    return Array.from(supplierMap.values());
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.getSuppliers().find(s => s.id === id);
  }

  getAssessmentsForSupplier(supplierName: string): Assessment[] {
    return this.getCompletedAssessments()
      .filter(a => a.supplierName.toLowerCase() === supplierName.toLowerCase())
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  getLatestAssessmentForSupplier(supplierName: string): Assessment | undefined {
    const assessments = this.getAssessmentsForSupplier(supplierName);
    return assessments.length > 0 ? assessments[0] : undefined;
  }

  createAssessment(
    documentLabel: string,
    documentSource: 'link' | 'upload',
    documentReference?: string,
    batchId?: string,
  ): Assessment {
    const initialStatus = documentSource === 'link' ? 'fetching' : 'uploading';
    const aiConfidence = this.generateConfidence(documentLabel, documentReference);
    const reviewRequired = aiConfidence < 0.85;
    const assessment: Assessment = {
      id: this.generateId(),
      batchId,
      supplierName: '',
      documentLabel,
      documentSource,
      documentReference,
      aiConfidence,
      reviewRequired,
      reviewCompleted: false,
      status: initialStatus,
      errorCode: null,
      errorMessage: null,
      failedStep: null,
      outcome: null,
      notes: '',
      createdDate: new Date(),
      completedDate: null,
    };
    this.assessments.push(assessment);
    this.saveToStorage();
    return assessment;
  }

  createBatch(
    inputs: Array<{ documentLabel: string; documentSource: 'link' | 'upload'; documentReference?: string }>,
  ): Batch {
    const batchId = this.generateId();
    const assessmentIds: string[] = [];
    for (const input of inputs) {
      const a = this.createAssessment(input.documentLabel, input.documentSource, input.documentReference, batchId);
      assessmentIds.push(a.id);
    }
    const batch: Batch = {
      id: batchId,
      assessmentIds,
      status: 'processing',
      createdDate: new Date(),
    };
    this.batches.push(batch);
    this.saveBatchesToStorage();
    return batch;
  }

  getBatchById(id: string): Batch | undefined {
    return this.batches.find(b => b.id === id);
  }

  getAssessmentsForBatch(batchId: string): Assessment[] {
    return this.assessments.filter(a => a.batchId === batchId);
  }

  isBatchReady(batchId: string): boolean {
    const assessments = this.getAssessmentsForBatch(batchId);
    if (assessments.length === 0) return false;
    return assessments.every(a => a.status === 'ready' || a.status === 'completed' || a.status === 'failed');
  }

  updateBatchStatus(batchId: string): void {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) return;
    const assessments = this.getAssessmentsForBatch(batchId);
    const allTerminal = assessments.every(a => a.status === 'completed' || a.status === 'failed');
    const anyReady = assessments.some(a => a.status === 'ready');
    if (allTerminal) {
      batch.status = 'completed';
    } else if (anyReady || this.isBatchReady(batchId)) {
      batch.status = 'ready';
    }
    this.saveBatchesToStorage();
  }

  bulkCompleteAssessments(ids: string[], outcome: AssessmentOutcome, notes: string): void {
    for (const id of ids) {
      const a = this.assessments.find(x => x.id === id);
      if (a && a.status === 'ready') {
        this.completeAssessment(id, outcome, notes);
        if (a.batchId) this.updateBatchStatus(a.batchId);
      }
    }
  }

  deriveAiOutcome(assessment: Assessment): AssessmentOutcome {
    // Placeholder: when real findings are on the assessment this will use them.
    // For now, mirror the workspace logic: high confidence = meets.
    if (assessment.aiConfidence >= 0.85) return 'meets';
    if (assessment.aiConfidence >= 0.7) return 'unclear';
    return 'does_not_meet';
  }

  updateSupplierName(id: string, name: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (assessment) {
      assessment.supplierName = name;
      this.saveToStorage();
    }
  }

  markReviewed(id: string, reviewed: boolean): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return;
    assessment.reviewCompleted = reviewed;
    this.saveToStorage();
  }

  markReady(id: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (assessment) {
      assessment.status = 'ready';
      assessment.errorCode = null;
      assessment.errorMessage = null;
      assessment.failedStep = null;
      if (!assessment.supplierName) {
        assessment.supplierName = 'Acme Construction Ltd';
      }
      this.saveToStorage();
    }
  }

  markFailed(id: string, code: string, message: string, step: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return;
    assessment.status = 'failed';
    assessment.errorCode = code;
    assessment.errorMessage = message;
    assessment.failedStep = step;
    this.saveToStorage();
  }

  updateStatus(id: string, status: Assessment['status']): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return;
    if (assessment.status === 'failed' || assessment.status === 'completed') return;
    if (this.getStatusRank(status) < this.getStatusRank(assessment.status)) return;
    assessment.status = status;
    this.saveToStorage();
  }

  restartProcessing(id: string, startSimulation = true): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return;
    this.clearPipelineTimers(id);
    assessment.status = assessment.documentSource === 'link' ? 'fetching' : 'uploading';
    assessment.errorCode = null;
    assessment.errorMessage = null;
    assessment.failedStep = null;
    this.saveToStorage();
    if (startSimulation) {
      this.startPipelineSimulation(id, true);
    }
  }

  startPipelineSimulation(id: string, force = false): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return;
    if (!force && this.pipelineTimers.has(id)) return;
    this.clearPipelineTimers(id);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (delayMs: number, fn: () => void) => {
      const timer = setTimeout(fn, delayMs);
      timers.push(timer);
    };

    this.pipelineTimers.set(id, timers);

    const shouldFail = this.shouldSimulateFailure(assessment);
    const failAt = shouldFail?.step ?? null;

    const fetchOrUploadMs = this.randomBetween(1000, 2000);
    const extractionMs = this.randomBetween(5000, 7000);
    const semanticMs = this.randomBetween(3500, 5000);
    const validationMs = this.randomBetween(2000, 3000);
    const persistenceMs = this.randomBetween(1000, 2000);

    if (assessment.status === 'fetching' || assessment.status === 'uploading') {
      schedule(fetchOrUploadMs, () => {
        if (failAt === 'upload') {
          this.markFailed(id, shouldFail!.code, shouldFail!.message, 'upload');
          return;
        }
        this.updateStatus(id, 'uploaded');
      });
    }

    schedule(fetchOrUploadMs + 1000, () => this.updateStatus(id, 'processing_extraction'));
    schedule(fetchOrUploadMs + extractionMs, () => {
      if (failAt === 'extraction') {
        this.markFailed(id, shouldFail!.code, shouldFail!.message, 'extraction');
        return;
      }
      this.updateStatus(id, 'extraction_complete');
    });

    schedule(fetchOrUploadMs + extractionMs + 1000, () => this.updateStatus(id, 'processing_semantic'));
    schedule(fetchOrUploadMs + extractionMs + semanticMs, () => {
      if (failAt === 'semantic') {
        this.markFailed(id, shouldFail!.code, shouldFail!.message, 'semantic');
        return;
      }
      this.updateStatus(id, 'semantic_complete');
    });

    schedule(fetchOrUploadMs + extractionMs + semanticMs + 1000, () => this.updateStatus(id, 'processing_validation'));
    schedule(fetchOrUploadMs + extractionMs + semanticMs + validationMs, () => {
      if (failAt === 'validation') {
        this.markFailed(id, shouldFail!.code, shouldFail!.message, 'validation');
        return;
      }
      this.updateStatus(id, 'processing_persistence');
    });

    schedule(fetchOrUploadMs + extractionMs + semanticMs + validationMs + persistenceMs, () => {
      if (failAt === 'persistence') {
        this.markFailed(id, shouldFail!.code, shouldFail!.message, 'persistence');
        return;
      }
      this.markReady(id);
      this.clearPipelineTimers(id);
    });
  }

  private generateConfidence(label: string, reference?: string): number {
    const token = `${label} ${reference ?? ''}`.toLowerCase();
    if (token.includes('low') || token.includes('unclear') || token.includes('partial')) {
      return 0.72;
    }
    if (token.includes('medium')) {
      return 0.84;
    }
    return Math.round((0.86 + Math.random() * 0.12) * 100) / 100;
  }

  private clearPipelineTimers(id: string): void {
    const timers = this.pipelineTimers.get(id);
    if (!timers) return;
    for (const timer of timers) clearTimeout(timer);
    this.pipelineTimers.delete(id);
  }

  private shouldSimulateFailure(assessment: Assessment): { step: string; code: string; message: string } | null {
    const token = `${assessment.documentLabel} ${assessment.documentReference ?? ''}`.toLowerCase();
    if (token.includes('fail-network'))  return { step: 'upload',      code: 'network_error',     message: 'Your connection dropped during upload. Check your internet and try again.' };
    if (token.includes('fail-upload'))   return { step: 'upload',      code: 'upload_failed',     message: 'We had trouble retrieving your document. Please try again.' };
    if (token.includes('fail-storage'))  return { step: 'persistence', code: 'storage_failed',    message: 'Something went wrong saving your document. Please try again.' };
    if (token.includes('fail-extract'))  return { step: 'extraction',  code: 'extraction_failed', message: "We weren't able to read this document. If it's a scanned PDF, try a text-based version. Otherwise try again." };
    if (token.includes('fail-semantic')) return { step: 'semantic',    code: 'semantic_failed',   message: "We weren't able to analyse the document content. Please try again." };
    return null;
  }

  private randomBetween(minMs: number, maxMs: number): number {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  private getStatusRank(status: Assessment['status']): number {
    const index = this.statusOrder.indexOf(status);
    return index === -1 ? 0 : index;
  }

  completeAssessment(id: string, outcome: 'meets' | 'does_not_meet' | 'unclear', notes: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (assessment) {
      assessment.status = 'completed';
      assessment.outcome = outcome;
      assessment.notes = notes;
      assessment.completedDate = new Date();
      this.saveToStorage();
    }
  }

  getOutcomeLabel(outcome: string | null): string {
    switch (outcome) {
      case 'meets': return 'Meets requirements';
      case 'does_not_meet': return 'Does not meet';
      case 'unclear': return 'Unclear';
      default: return 'Pending';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
}
