import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilter
} from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private api = inject(ApiService);

  getAll(filter: ExpenseFilter): Observable<ApiResponse<PagedResult<Expense>>> {
    return this.api.getPaged<Expense>(API_ENDPOINTS.expenses.base, filter);
  }

  getById(id: string): Observable<ApiResponse<Expense>> {
    return this.api.get<Expense>(API_ENDPOINTS.expenses.byId(id));
  }

  getTotal(filter: ExpenseFilter): Observable<ApiResponse<number>> {
    return this.api.get<number>(`${API_ENDPOINTS.expenses.base}/total`, filter);
  }

  create(request: CreateExpenseRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.expenses.base, request);
  }

  update(id: string, request: UpdateExpenseRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.expenses.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.expenses.byId(id));
  }
}