import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';

export interface RadiologyListItem {
  id: string;
  patientId: string;
  patientName: string;
  radiologyTypeId: string;
  radiologyTypeNameAr: string;
  visitId?: string;
  patientToothId?: string;
  toothNumber?: number;
  clinicId: string;
  clinicName: string;
  takenByUserId: string;
  takenAt: string;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
  findings?: string;
  notes?: string;
  createdAt: string;
  signedUrl?: string;
}

export interface RadiologyDetails extends RadiologyListItem {
  signedUrl?: string;
}

export interface RadiologyTypeDto {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class RadiologyService {
  private api = inject(ApiService);

  getByPatient(patientId: string, page = 1, pageSize = 50): Observable<ApiResponse<PagedResult<RadiologyListItem>>> {
    return this.api.getPaged<RadiologyListItem>(API_ENDPOINTS.radiology.base, {
      patientId, page, pageSize
    });
  }

  getById(id: string): Observable<ApiResponse<RadiologyDetails>> {
    return this.api.get<RadiologyDetails>(API_ENDPOINTS.radiology.byId(id));
  }

  getTypes(): Observable<ApiResponse<RadiologyTypeDto[]>> {
    return this.api.get<RadiologyTypeDto[]>(API_ENDPOINTS.radiology.types);
  }

  upload(formData: FormData): Observable<ApiResponse<string>> {
    return this.api.upload<string>(API_ENDPOINTS.radiology.upload, formData);
  }

  update(id: string, request: { findings?: string; notes?: string }): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.radiology.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.radiology.byId(id));
  }
}