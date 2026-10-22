import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClinicContextService {
  private readonly STORAGE_KEY = 'dc_current_clinic';
  private readonly NAME_KEY = 'dc_current_clinic_name';

  get clinicId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  get clinicName(): string | null {
    return localStorage.getItem(this.NAME_KEY);
  }

  get hasClinic(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  setClinic(id: string, name: string): void {
    localStorage.setItem(this.STORAGE_KEY, id);
    localStorage.setItem(this.NAME_KEY, name);
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.NAME_KEY);
  }
}