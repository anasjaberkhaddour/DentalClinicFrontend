import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Currency, CreateCurrencyRequest, UpdateCurrencyRequest, CurrencyFilter } from '../models/currency.model';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private api = inject(ApiService);

  getAll(filter?: CurrencyFilter): Observable<ApiResponse<Currency[]>> {
    const params = { page: 1, pageSize: 200, ...(filter ?? {}) };
    return this.api.getPaged<Currency>(API_ENDPOINTS.currencies.base, params).pipe(
      map((res: any) => ({
        value: res.value.items,
        isSuccess: res.isSuccess,
        isFailure: res.isFailure,
        error: res.error
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Currency>> {
    return this.api.get<Currency>(API_ENDPOINTS.currencies.byId(id));
  }

  create(request: CreateCurrencyRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.currencies.base, request);
  }

  update(id: string, request: UpdateCurrencyRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.currencies.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.currencies.byId(id));
  }
}