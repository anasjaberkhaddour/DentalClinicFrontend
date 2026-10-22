import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<ApiResponse<PagedResult<any>>> {
    return this.api.getPaged<any>(API_ENDPOINTS.users.base, params);
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.users.base, request);
  }
  
  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.users.byId(id));
  }
  
  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.users.byId(id), request);
  }
  
  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.users.byId(id));
  }

  updateRoles(id: string, roles: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.users.roles(id), { roles });
  }
  
  updatePermissions(id: string, permissionCodes: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.users.permissions(id), { permissionCodes });
  }
  
  lock(id: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.users.lock(id), {});
  }
  
  unlock(id: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.users.unlock(id), {});
  }
  
  resetPassword(id: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.users.resetPassword(id), { newPassword });
  }

  updatePhoto(id: string, file: File): Observable<ApiResponse<void>> {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.upload<void>(API_ENDPOINTS.users.photo(id), fd);
  }
  
  deletePhoto(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.users.photo(id));
  }
  
  getClinics(id: string): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>(API_ENDPOINTS.users.clinics(id));
  }
  
  assignClinics(id: string, clinicIds: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.users.clinics(id), { clinicIds });
  }
}