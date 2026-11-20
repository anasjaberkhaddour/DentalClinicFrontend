import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  BrandNameListItem,
  BrandNameDetails,
  CreateBrandNameRequest,
  UpdateBrandNameRequest,
  BrandNameFilter
} from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class BrandNameService {
  private api = inject(ApiService);

  getAll(filter: BrandNameFilter): Observable<ApiResponse<PagedResult<BrandNameListItem>>> {
    return this.api.getPaged<BrandNameListItem>(API_ENDPOINTS.brandNames.base, filter);
  }

  getById(id: string): Observable<ApiResponse<BrandNameDetails>> {
    return this.api.get<BrandNameDetails>(API_ENDPOINTS.brandNames.byId(id));
  }

  create(request: CreateBrandNameRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.brandNames.base, request);
  }

  update(id: string, request: UpdateBrandNameRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.brandNames.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.brandNames.byId(id));
  }

  search(term: string): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(`${API_ENDPOINTS.brandNames.base}/search?term=${encodeURIComponent(term)}`);
  }
}