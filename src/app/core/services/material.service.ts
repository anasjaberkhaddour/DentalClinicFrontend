import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  MaterialListItem,
  MaterialDetails,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialFilter
} from '../models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private api = inject(ApiService);

  getAll(filter: MaterialFilter): Observable<ApiResponse<PagedResult<MaterialListItem>>> {
    return this.api.getPaged<MaterialListItem>(API_ENDPOINTS.materials.base, filter);
  }

  getById(id: string): Observable<ApiResponse<MaterialDetails>> {
    return this.api.get<MaterialDetails>(API_ENDPOINTS.materials.byId(id));
  }

  create(request: CreateMaterialRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.materials.base, request);
  }

  update(id: string, request: UpdateMaterialRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.materials.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.materials.byId(id));
  }
}