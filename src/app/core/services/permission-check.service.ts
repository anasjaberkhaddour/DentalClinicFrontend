import { Injectable, inject } from '@angular/core';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class PermissionCheckService {
  private tokenStorage = inject(TokenStorageService);

  private get permissions(): string[] {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const perms = payload['permission'];
      if (!perms) return [];
      return Array.isArray(perms) ? perms : [perms];
    } catch {
      return [];
    }
  }

  has(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.has(p));
  }

  isAdmin(): boolean {
    const user = this.tokenStorage.getUser();
    return user?.roles?.includes('Admin') ?? false;
  }
}