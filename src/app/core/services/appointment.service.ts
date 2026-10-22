import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { AppointmentListItem } from '../models/patient.model';

export interface CreateAppointmentRequest {
  patientId: string;
  clinicId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  reason?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ApiService);

  getByPatient(patientId: string, page = 1, pageSize = 100): Observable<ApiResponse<PagedResult<AppointmentListItem>>> {
    return this.api.getPaged<AppointmentListItem>(API_ENDPOINTS.appointments.base, {
      patientId, page, pageSize
    });
  }

  updateStatus(id: string, status: number, cancellationReason?: string): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.appointments.status(id), { status, cancellationReason });
  }

  create(request: CreateAppointmentRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.appointments.base, request);
  }
  
  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.appointments.byId(id));
  }
  
  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.appointments.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.appointments.byId(id));
  }

  getAll(params?: any): Observable<ApiResponse<PagedResult<AppointmentListItem>>> {
    return this.api.getPaged<AppointmentListItem>(API_ENDPOINTS.appointments.base, params);
  }
}