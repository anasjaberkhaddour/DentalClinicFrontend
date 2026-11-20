import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  PrescriptionListItem,
  PrescriptionDetails,
  PrescriptionFilter,
  SavePrescriptionRequest
} from '../models/prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private api = inject(ApiService);

  getAll(filter: PrescriptionFilter): Observable<ApiResponse<PagedResult<PrescriptionListItem>>> {
    return this.api.getPaged<PrescriptionListItem>(API_ENDPOINTS.prescriptions.base, filter);
  }

  getById(id: string): Observable<ApiResponse<PrescriptionDetails>> {
    return this.api.get<PrescriptionDetails>(API_ENDPOINTS.prescriptions.byId(id));
  }

  getByVisitId(visitId: string): Observable<ApiResponse<PrescriptionDetails>> {
    return this.api.get<PrescriptionDetails>(API_ENDPOINTS.prescriptions.byVisit(visitId));
  }

  save(request: SavePrescriptionRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.prescriptions.save, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.prescriptions.byId(id));
  }
}