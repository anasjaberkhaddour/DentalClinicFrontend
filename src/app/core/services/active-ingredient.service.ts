import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  ActiveIngredientListItem,
  ActiveIngredientDetails,
  CreateActiveIngredientRequest,
  UpdateActiveIngredientRequest,
  ActiveIngredientFilter
} from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class ActiveIngredientService {
  private api = inject(ApiService);

  getAll(filter: ActiveIngredientFilter): Observable<ApiResponse<PagedResult<ActiveIngredientListItem>>> {
    return this.api.getPaged<ActiveIngredientListItem>(API_ENDPOINTS.activeIngredients.base, filter);
  }

  getById(id: string): Observable<ApiResponse<ActiveIngredientDetails>> {
    return this.api.get<ActiveIngredientDetails>(API_ENDPOINTS.activeIngredients.byId(id));
  }

  create(request: CreateActiveIngredientRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.activeIngredients.base, request);
  }

  update(id: string, request: UpdateActiveIngredientRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.activeIngredients.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.activeIngredients.byId(id));
  }

  getBrandNames(id: string): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>(`${API_ENDPOINTS.activeIngredients.base}/${id}/brand-names`);
  }
  
  assignBrandNames(id: string, brandNameIds: string[]): Observable<ApiResponse<void>> {
    return this.api.put<void>(`${API_ENDPOINTS.activeIngredients.base}/${id}/brand-names`, brandNameIds);
  }
}