import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  ExpenseCategory,
  CreateExpenseCategoryRequest,
  UpdateExpenseCategoryRequest
} from '../models/expense-category.model';

export interface ExpenseCategoryFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private api = inject(ApiService);

  getAll(filter: ExpenseCategoryFilter): Observable<ApiResponse<PagedResult<ExpenseCategory>>> {
    return this.api.getPaged<ExpenseCategory>(API_ENDPOINTS.expenseCategories.base, filter);
  }

  getById(id: string): Observable<ApiResponse<ExpenseCategory>> {
    return this.api.get<ExpenseCategory>(API_ENDPOINTS.expenseCategories.byId(id));
  }

  create(request: CreateExpenseCategoryRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.expenseCategories.base, request);
  }

  update(id: string, request: UpdateExpenseCategoryRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.expenseCategories.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.expenseCategories.byId(id));
  }
}