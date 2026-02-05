import { Injectable } from '@angular/core';
import { Assessment, Supplier } from '../models/assessment.model';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly STORAGE_KEY = 'crp_assessments';
  private assessments: Assessment[] = [];

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
        }));
      }
    } catch {
      this.assessments = [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.assessments));
  }

  private generateId(): string {
    return crypto.randomUUID();
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

  createAssessment(documentLabel: string, documentSource: 'link' | 'upload'): Assessment {
    const assessment: Assessment = {
      id: this.generateId(),
      supplierName: '',
      documentLabel,
      documentSource,
      status: 'processing',
      outcome: null,
      notes: '',
      createdDate: new Date(),
      completedDate: null,
    };
    this.assessments.push(assessment);
    this.saveToStorage();
    return assessment;
  }

  updateSupplierName(id: string, name: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (assessment) {
      assessment.supplierName = name;
      this.saveToStorage();
    }
  }

  markReady(id: string): void {
    const assessment = this.assessments.find(a => a.id === id);
    if (assessment) {
      assessment.status = 'ready';
      if (!assessment.supplierName) {
        assessment.supplierName = 'Acme Construction Ltd';
      }
      this.saveToStorage();
    }
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
