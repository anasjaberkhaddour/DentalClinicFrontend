import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import {
  LabOrderTypeListItem,
  LabOrderTypeDetails,
  CreateLabOrderTypeRequest,
  UpdateLabOrderTypeRequest,
  LabOrderTypeFilter
} from '../models/lab-order-type.model';

@Injectable({ providedIn: 'root' })
export class LabOrderTypeService {
  private api = inject(ApiService);

  getAll(filter: LabOrderTypeFilter): Observable<ApiResponse<PagedResult<LabOrderTypeListItem>>> {
    return this.api.getPaged<LabOrderTypeListItem>(API_ENDPOINTS.labOrderTypes.base, filter);
  }

  getById(id: string): Observable<ApiResponse<LabOrderTypeDetails>> {
    return this.api.get<LabOrderTypeDetails>(API_ENDPOINTS.labOrderTypes.byId(id));
  }

  create(request: CreateLabOrderTypeRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.labOrderTypes.base, request);
  }

  update(id: string, request: UpdateLabOrderTypeRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.labOrderTypes.byId(id), request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.labOrderTypes.byId(id));
  }
}