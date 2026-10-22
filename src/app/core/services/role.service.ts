import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private api = inject(ApiService);

  getAll(): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.roles.base);
  }

  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.roles.byId(id));
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.roles.base, request);
  }
  
  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.roles.byId(id), request);
  }
  
  assignPermissions(id: string, permissionCodes: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.roles.permissions(id), { permissionCodes });
  }
  
  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.roles.byId(id));
  }
}