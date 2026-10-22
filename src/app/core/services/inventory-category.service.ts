import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  InventoryCategory,
  CreateInventoryCategoryRequest,
  UpdateInventoryCategoryRequest,
  InventoryCategoryFilter
} from '../models/inventory-category.model';

@Injectable({ providedIn: 'root' })
export class InventoryCategoryService {
  private api = inject(ApiService);
  private baseUrl = '/api/v1/InventoryCategories';

  getAll(filter: InventoryCategoryFilter): Observable<ApiResponse<PagedResult<InventoryCategory>>> {
    return this.api.getPaged<InventoryCategory>(this.baseUrl, filter);
  }

  getById(id: string): Observable<ApiResponse<InventoryCategory>> {
    return this.api.get<InventoryCategory>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateInventoryCategoryRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(this.baseUrl, request);
  }

  update(id: string, request: UpdateInventoryCategoryRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }
}