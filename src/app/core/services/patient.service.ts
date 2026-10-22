import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  PatientListItem,
  PatientDetails,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientFilter,
  GuardianDto
} from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private api = inject(ApiService);

  getAll(filter: PatientFilter): Observable<ApiResponse<PagedResult<PatientListItem>>> {
    return this.api.getPaged<PatientListItem>(API_ENDPOINTS.patients.base, filter);
  }

  getById(id: string): Observable<ApiResponse<PatientDetails>> {
    return this.api.get<PatientDetails>(API_ENDPOINTS.patients.byId(id));
  }

  create(request: CreatePatientRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.patients.base, request);
  }

  update(id: string, request: UpdatePatientRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.patients.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.patients.byId(id));
  }

  updatePhoto(id: string, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.upload<void>(API_ENDPOINTS.patients.photo(id), formData);
  }

  deletePhoto(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.patients.photo(id));
  }

  addGuardian(patientId: string, data: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.patients.guardians(patientId), data);
  }

  removeGuardian(patientId: string, guardianId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.patients.guardian(patientId, guardianId));
  }

  updateMedicalHistory(patientId: string, data: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.patients.medicalHistory(patientId), data);
  }
}