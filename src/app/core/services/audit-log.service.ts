import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { AuditLog, AuditLogFilter } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private api = inject(ApiService);
  private baseUrl = '/api/v1/AuditLogs';

  getAll(filter: AuditLogFilter): Observable<ApiResponse<PagedResult<AuditLog>>> {
    return this.api.getPaged<AuditLog>(this.baseUrl, filter);
  }

  getById(id: string): Observable<ApiResponse<AuditLog>> {
    return this.api.get<AuditLog>(`${this.baseUrl}/${id}`);
  }

  getActions(): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>(`${this.baseUrl}/actions`);
  }

  getEntities(): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>(`${this.baseUrl}/entities`);
  }
}