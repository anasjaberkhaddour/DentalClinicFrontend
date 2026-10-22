import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ClinicService } from '../../../core/services/clinic.service';
import { ClinicContextService } from '../../../core/services/clinic-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-select-clinic',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './select-clinic.html',
  styleUrl: './select-clinic.scss'
})
export class SelectClinic implements OnInit {
  private clinicService = inject(ClinicService);
  private clinicContext = inject(ClinicContextService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);

  loading = signal(true);
  clinics = signal<any[]>([]);

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.loading.set(true);
    this.clinicService.getAll().subscribe({
      next: (res) => {
        this.clinics.set(res.value);
        this.loading.set(false);

        const user = this.tokenStorage.getUser();
        const isAdmin = user?.roles?.includes('Admin') ?? false;

        if (res.value.length === 1 ) {
          this.clinicContext.setClinic(res.value[0].id, res.value[0].name);
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل العيادات.' });
      }
    });
  }

  selectClinic(clinic: any): void {
    this.clinicContext.setClinic(clinic.id, clinic.name);
    this.router.navigateByUrl('/dashboard');
  }

  logout(): void {
    this.authService.logout();
  }
}