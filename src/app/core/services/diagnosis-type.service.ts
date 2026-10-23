import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { DiagnosisType, DiagnosisTypeFilter } from '../models/diagnosis-type.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DiagnosisTypeService {
  private api = inject(ApiService);
  private baseUrl = '/api/v1/DiagnosisTypes';

  getAll(filter: DiagnosisTypeFilter): Observable<ApiResponse<DiagnosisType[]>> {
    return this.api.get<DiagnosisType[]>(this.baseUrl, filter).pipe(
      map((res: any) => ({
        value: res.value,
        isSuccess: res.isSuccess,
        isFailure: res.isFailure,
        error: res.error
      }))
    );
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(this.baseUrl, request);
  }

  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }
}