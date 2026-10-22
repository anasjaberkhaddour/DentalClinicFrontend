import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Profile, UpdateProfileRequest, ChangeOwnPasswordRequest } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiService);

  get(): Observable<ApiResponse<Profile>> {
    return this.api.get<Profile>(API_ENDPOINTS.profile.get);
  }

  update(request: UpdateProfileRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.profile.update, request);
  }

  changePassword(request: ChangeOwnPasswordRequest): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.profile.changePassword, request);
  }

  updatePhoto(file: File): Observable<ApiResponse<void>> {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.upload<void>(API_ENDPOINTS.profile.updatePhoto, fd);
  }

  deletePhoto(): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.profile.deletePhoto);
  }
}