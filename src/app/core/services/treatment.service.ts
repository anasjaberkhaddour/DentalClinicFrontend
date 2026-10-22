import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  TreatmentListItem,
  TreatmentDetails,
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  TreatmentFilter
} from '../models/treatment.model';

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private api = inject(ApiService);

  getAll(filter: TreatmentFilter): Observable<ApiResponse<PagedResult<TreatmentListItem>>> {
    return this.api.getPaged<TreatmentListItem>(API_ENDPOINTS.treatments.base, filter);
  }

  getById(id: string): Observable<ApiResponse<TreatmentDetails>> {
    return this.api.get<TreatmentDetails>(API_ENDPOINTS.treatments.byId(id));
  }

  create(request: CreateTreatmentRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.treatments.base, request);
  }

  update(id: string, request: UpdateTreatmentRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.treatments.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.treatments.byId(id));
  }
}