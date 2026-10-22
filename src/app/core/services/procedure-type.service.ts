import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  ProcedureTypeListItem,
  ProcedureTypeDetails,
  CreateProcedureTypeRequest,
  UpdateProcedureTypeRequest,
  ProcedureTypeFilter
} from '../models/procedure-type.model';

@Injectable({ providedIn: 'root' })
export class ProcedureTypeService {
  private api = inject(ApiService);

  getAll(filter: ProcedureTypeFilter): Observable<ApiResponse<PagedResult<ProcedureTypeListItem>>> {
    return this.api.getPaged<ProcedureTypeListItem>(API_ENDPOINTS.procedureTypes.base, filter);
  }

  getById(id: string): Observable<ApiResponse<ProcedureTypeDetails>> {
    return this.api.get<ProcedureTypeDetails>(API_ENDPOINTS.procedureTypes.byId(id));
  }

  create(request: CreateProcedureTypeRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.procedureTypes.base, request);
  }

  update(id: string, request: UpdateProcedureTypeRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.procedureTypes.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.procedureTypes.byId(id));
  }
}