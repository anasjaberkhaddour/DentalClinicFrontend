import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  InventoryTransaction,
  CreateInventoryTransactionRequest,
  InventoryTransactionFilter
} from '../models/inventory-transaction.model';

@Injectable({ providedIn: 'root' })
export class InventoryTransactionService {
  private api = inject(ApiService);
  private baseUrl = '/api/v1/InventoryTransactions';

  getAll(filter: InventoryTransactionFilter): Observable<ApiResponse<PagedResult<InventoryTransaction>>> {
    return this.api.getPaged<InventoryTransaction>(this.baseUrl, filter);
  }

  getById(id: string): Observable<ApiResponse<InventoryTransaction>> {
    return this.api.get<InventoryTransaction>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateInventoryTransactionRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(this.baseUrl, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }
}