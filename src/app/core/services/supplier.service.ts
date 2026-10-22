import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  SupplierListItem,
  SupplierDetails,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilter
} from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private api = inject(ApiService);

  getAll(filter: SupplierFilter): Observable<ApiResponse<PagedResult<SupplierListItem>>> {
    return this.api.getPaged<SupplierListItem>(API_ENDPOINTS.suppliers.base, filter);
  }

  getById(id: string): Observable<ApiResponse<SupplierDetails>> {
    return this.api.get<SupplierDetails>(API_ENDPOINTS.suppliers.byId(id));
  }

  create(request: CreateSupplierRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.suppliers.base, request);
  }

  update(id: string, request: UpdateSupplierRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.suppliers.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.suppliers.byId(id));
  }
}