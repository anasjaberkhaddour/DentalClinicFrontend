import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  TreatmentCaseListItem,
  TreatmentCaseDetails,
  CreateTreatmentCaseRequest,
  UpdateTreatmentCaseRequest,
  DiagnosisType
} from '../models/treatment-case.model';
@Injectable({ providedIn: 'root' })
export class TreatmentCaseService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<ApiResponse<PagedResult<TreatmentCaseListItem>>> {
    return this.api.getPaged<TreatmentCaseListItem>(API_ENDPOINTS.treatmentCases.base, params);
  }

  getById(id: string): Observable<ApiResponse<TreatmentCaseDetails>> {
    return this.api.get<TreatmentCaseDetails>(API_ENDPOINTS.treatmentCases.byId(id));
  }

  create(request: CreateTreatmentCaseRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.treatmentCases.base, request);
  }

  update(id: string, request: UpdateTreatmentCaseRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.treatmentCases.byId(id), request);
  }

  updateStatus(id: string, status: number, cancellationReason?: string): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.treatmentCases.status(id), { status, cancellationReason });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.treatmentCases.byId(id));
  }

  getDiagnosisTypes(): Observable<ApiResponse<DiagnosisType[]>> {
    return this.api.get<DiagnosisType[]>(API_ENDPOINTS.diagnosisTypes.base);
  }

  getPatientTeeth(patientId: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.toothChart.chart(patientId));
  }
}