import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryItemFilter
} from '../models/inventory-item.model';

@Injectable({ providedIn: 'root' })
export class InventoryItemService {
  private api = inject(ApiService);
  private baseUrl = '/api/v1/InventoryItems';

  getAll(filter: InventoryItemFilter): Observable<ApiResponse<PagedResult<InventoryItem>>> {
    return this.api.getPaged<InventoryItem>(this.baseUrl, filter);
  }

  getById(id: string): Observable<ApiResponse<InventoryItem>> {
    return this.api.get<InventoryItem>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateInventoryItemRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(this.baseUrl, request);
  }

  update(id: string, request: UpdateInventoryItemRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }
}