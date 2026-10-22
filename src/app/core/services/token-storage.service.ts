import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  saveSession(response: LoginResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.accessTokenExpiry, response.accessTokenExpiresAt);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({
      userName: response.userName,
      fullName: response.fullName,
      roles: response.roles,
    }));
  }

  updateAccessToken(accessToken: string, refreshToken: string, expiresAt: string): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    localStorage.setItem(STORAGE_KEYS.accessTokenExpiry, expiresAt);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  getAccessTokenExpiry(): Date | null {
    const raw = localStorage.getItem(STORAGE_KEYS.accessTokenExpiry);
    return raw ? new Date(raw) : null;
  }

  getUser(): { userName: string; fullName: string; roles: string[] } | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.accessTokenExpiry);
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}