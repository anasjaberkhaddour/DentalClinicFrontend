import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private api = inject(ApiService);

  getAll(): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.permissions.base);
  }
}