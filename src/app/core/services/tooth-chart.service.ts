import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { ToothChart, PatientTooth, ToothHistory, ProcedureType } from '../models/tooth-chart.model';
import { MaterialDto } from '../models/tooth-chart.model';
import { map } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class ToothChartService {
  private api = inject(ApiService);

  getChart(patientId: string): Observable<ApiResponse<ToothChart>> {
    return this.api.get<ToothChart>(API_ENDPOINTS.toothChart.chart(patientId));
  }

  getTooth(patientToothId: string): Observable<ApiResponse<PatientTooth>> {
    return this.api.get<PatientTooth>(API_ENDPOINTS.toothChart.tooth(patientToothId));
  }

  updateToothStatus(patientToothId: string, request: { status: number; mobility: number; notes?: string }): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.toothChart.tooth(patientToothId), request);
  }

  getToothHistory(patientToothId: string): Observable<ApiResponse<ToothHistory[]>> {
    return this.api.get<ToothHistory[]>(API_ENDPOINTS.toothChart.toothHistory(patientToothId));
  }

  createToothHistory(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.toothChart.history, request);
  }

  deleteToothHistory(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.toothChart.deleteHistory(id));
  }

  getProcedureTypes(): Observable<ApiResponse<ProcedureType[]>> {
    return this.api.getPaged<ProcedureType>(API_ENDPOINTS.procedureTypes.base, { page: 1, pageSize: 200, isActive: true }).pipe(
      map((res: any) => ({
        value: res.value.items,
        isSuccess: res.isSuccess,
        isFailure: res.isFailure,
        error: res.error
      }))
    );
  }

  getMaterials(category?: string): Observable<ApiResponse<MaterialDto[]>> {
    return this.api.getPaged<MaterialDto>(API_ENDPOINTS.materials.base, { category, page: 1, pageSize: 200 }).pipe(
      map((res: any) => ({
        value: res.value.items,
        isSuccess: res.isSuccess,
        isFailure: res.isFailure,
        error: res.error
      }))
    );
  }
}