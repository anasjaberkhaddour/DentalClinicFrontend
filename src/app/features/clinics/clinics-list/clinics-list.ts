import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ClinicService } from '../../../core/services/clinic.service';

@Component({
  selector: 'app-clinics-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './clinics-list.html',
  styleUrl: './clinics-list.scss'
})
export class ClinicsList implements OnInit {
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private router = inject(Router);

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
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل العيادات.' });
      }
    });
  }

  openClinic(id: string): void {
    this.router.navigate(['/clinics', id]);
  }

  createClinic(): void {
    this.router.navigate(['/clinics/create']);
  }
}