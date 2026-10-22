import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { ContactDto } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = inject(ApiService);

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.contacts.base, request);
  }

  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.contacts.byId(id), request);
  }

  setPrimary(id: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.contacts.setPrimary(id), {});
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.contacts.byId(id));
  }

  getByOwner(ownerType: number, ownerId: string): Observable<ApiResponse<ContactDto[]>> {
    return this.api.get<ContactDto[]>(API_ENDPOINTS.contacts.byOwner, { ownerType, ownerId });
  }
}