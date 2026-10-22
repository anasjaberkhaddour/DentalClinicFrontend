import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private api = inject(ApiService);

  getAll(): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.clinics.base);
  }

  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.clinics.byId(id));
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.clinics.base, request);
  }

  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.clinics.byId(id), request);
  }

  assignUsers(id: string, userIds: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.clinics.users(id), { userIds });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.clinics.byId(id));
  }
}