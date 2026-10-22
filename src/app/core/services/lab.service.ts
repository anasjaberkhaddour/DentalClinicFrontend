import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class LabService {
  private api = inject(ApiService);

  getAllLabs(): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.dentalLabs.base, { page: 1, pageSize: 200 });
  }

  getAllTypes(): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.labOrderTypes.base);
  }
}