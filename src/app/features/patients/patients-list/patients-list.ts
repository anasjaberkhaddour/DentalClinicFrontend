import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PatientService } from '../../../core/services/patient.service';
import { PatientListItem, PatientFilter } from '../../../core/models/patient.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, SelectModule,
    PaginatorModule, SkeletonModule, TooltipModule
  ],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientsList implements OnInit {
  private patientService = inject(PatientService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  patients = signal<PatientListItem[]>([]);
  totalRecords = signal(0);
  viewMode = signal<'grid' | 'list'>('grid');

  filter: PatientFilter = {
    page: 1,
    pageSize: 20,
    search: '',
  };

  emergencyOptions = [
    { label: 'الكل', value: null },
    { label: 'طارئ فقط', value: true },
    { label: 'غير طارئ', value: false },
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.patientService.getAll(this.filter).subscribe({
      next: (response) => {
        this.patients.set(response.value.items);
        this.totalRecords.set(response.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذّر تحميل قائمة المرضى.'
        });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.loadPatients();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadPatients();
  }

  toggleView(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  openPatient(id: string): void {
    this.router.navigate(['/patients', id]);
  }

  createPatient(): void {
    this.router.navigate(['/patients/create']);
  }

  getInitials(first: string, last: string): string {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }

  // calculateAge(dateOfBirth?: string): string {
  //   if (!dateOfBirth) return '—';
  //   const birth = new Date(dateOfBirth);
  //   const today = new Date();
  //   let age = today.getFullYear() - birth.getFullYear();
  //   const m = today.getMonth() - birth.getMonth();
  //   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  //   return `${age} سنة`;
  // }
  calculateAge(dateOfBirth?: string): string {
    const age = this.calculateAgeNumber(dateOfBirth);
    return age !== null ? `${age} سنة` : '—';
  }

  getAvatarIcon(gender?: number, dateOfBirth?: string): string {
    const age = this.calculateAgeNumber(dateOfBirth);
  
    const isMale = gender === 1;
  
    if (age !== null && age < 18) {
      return isMale ? 'mdi:human-male-boy' : 'mdi:human-female-girl';
    }
    if (age !== null && age >= 60) {
      return isMale ? 'mdi:human-male-old' : 'mdi:human-female-old';
    }
    return isMale ? 'mdi:human-male' : 'mdi:human-female';
  }
  
  calculateAgeNumber(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
}