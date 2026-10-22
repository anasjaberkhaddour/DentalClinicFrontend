import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, RefreshTokenRequest } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';
import { ClinicContextService } from './clinic-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  private clinicContext = inject(ClinicContextService);
  private baseUrl = environment.apiUrl;

  private readonly _isLoggedIn = signal<boolean>(this.tokenStorage.isLoggedIn());
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}${API_ENDPOINTS.auth.login}`,
      request
    ).pipe(
      tap(response => {
        if (response.isSuccess && response.value) {
          this.tokenStorage.saveSession(response.value);
          this._isLoggedIn.set(true);
        }
      })
    );
  }

  refresh(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}${API_ENDPOINTS.auth.refresh}`,
      request
    ).pipe(
      tap(response => {
        if (response.isSuccess && response.value) {
          this.tokenStorage.updateAccessToken(
            response.value.accessToken,
            response.value.refreshToken,
            response.value.accessTokenExpiresAt
          );
        }
      })
    );
  }

  logout(): void {
    this.http.post<ApiResponse<void>>(
      `${this.baseUrl}${API_ENDPOINTS.auth.logout}`,
      {}
    ).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    this.tokenStorage.clear();
    this.clinicContext.clear();
    this._isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  forceLogout(): void {
    this.tokenStorage.clear();
    this.clinicContext.clear();
    this._isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }
}