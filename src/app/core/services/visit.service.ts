import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { VisitListItem, VisitDetails, UpdateVisitRequest } from '../models/patient.model';

export interface CreateVisitRequest {
  patientId: string;
  treatmentCaseId?: string;
  clinicId: string;
  doctorId: string;
  visitDate?: string;
  clinicalExamination?: string;
  proceduresPerformed?: string;
  prescription?: string;
  notes?: string;
  patientToothIds: string[];
}

@Injectable({ providedIn: 'root' })
export class VisitService {
  private api = inject(ApiService);

  getByPatient(patientId: string, page = 1, pageSize = 20): Observable<ApiResponse<PagedResult<VisitListItem>>> {
    return this.api.getPaged<VisitListItem>(API_ENDPOINTS.visits.base, {
      patientId, page, pageSize
    });
  }

  getById(id: string): Observable<ApiResponse<VisitDetails>> {
    return this.api.get<VisitDetails>(API_ENDPOINTS.visits.byId(id));
  }

  create(request: CreateVisitRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.visits.base, request);
  }

  update(id: string, request: UpdateVisitRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.visits.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.visits.byId(id));
  }

}