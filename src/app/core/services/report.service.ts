import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { TreatmentPlanReport, FinancialFollowUpReport } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);

  getTreatmentPlan(treatmentCaseId: string): Observable<ApiResponse<TreatmentPlanReport>> {
    return this.api.get<TreatmentPlanReport>(`/api/v1/Reports/treatment-plan/${treatmentCaseId}`);
  }

  getPatientCases(patientId: string): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(`/api/v1/Reports/patient-cases/${patientId}`);
  }

  getFinancialFollowUp(patientId: string): Observable<ApiResponse<FinancialFollowUpReport>> {
    return this.api.get<FinancialFollowUpReport>(`/api/v1/Reports/financial-follow-up/${patientId}`);
  }

  getDiagnosisList(): Observable<ApiResponse<{ id: string; nameAr: string }[]>> {
    return this.api.get<{ id: string; nameAr: string }[]>('/api/v1/Reports/diagnosis-list');
  }
  
  getDiagnosisReport(diagnosisTypeId: string): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>('/api/v1/Reports/diagnosis-report', { diagnosisTypeId });
  }

  getDiagnosisStats(): Observable<ApiResponse<{ name: string; count: number }[]>> {
    return this.api.get<{ name: string; count: number }[]>('/api/v1/Reports/diagnosis-stats');
  }
}