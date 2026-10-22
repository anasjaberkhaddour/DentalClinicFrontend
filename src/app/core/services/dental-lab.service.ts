import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DentalLabService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<ApiResponse<PagedResult<any>>> {
    return this.api.getPaged<any>(API_ENDPOINTS.dentalLabs.base, params);
  }

  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.dentalLabs.byId(id));
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.dentalLabs.base, request);
  }

  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.dentalLabs.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.dentalLabs.byId(id));
  }
}