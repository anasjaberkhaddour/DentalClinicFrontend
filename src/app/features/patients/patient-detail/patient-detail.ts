import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PatientService } from '../../../core/services/patient.service';
import { PatientDetails } from '../../../core/models/patient.model';
import { PatientHistory } from './patient-history/patient-history';
import { PatientAppointments } from './patient-appointments/patient-appointments';
import { PatientInvoices } from './patient-invoices/patient-invoices';
import { PatientRadiology } from './patient-radiology/patient-radiology';
import { PatientLabOrders } from './patient-lab-orders/patient-lab-orders';
import { PatientToothChart } from './patient-tooth-chart/patient-tooth-chart';
import { PatientTreatmentCases } from './patient-treatment-cases/patient-treatment-cases';
import { GuardianRelationshipOptions } from '../../../core/constants/enums';

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, ButtonModule, SkeletonModule, TagModule,
    TooltipModule, TabsModule, DialogModule, InputTextModule, SelectModule, ToggleSwitchModule,
    PatientHistory, PatientAppointments, PatientInvoices,
    PatientRadiology, PatientLabOrders, PatientToothChart, PatientTreatmentCases
  ],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  uploading = signal(false);
  loading = signal(true);
  patient = signal<PatientDetails | null>(null);
  activeTab = signal<string>('overview');

  guardianDialog = signal(false);
  guardianSaving = signal(false);
  guardianRelationshipOptions = GuardianRelationshipOptions;
  guardianForm = {
    firstName: '',
    fatherName: '',
    motherName: '',
    lastName: '',
    nationalId: '',
    relationship: 1,
    isLegalGuardian: false
  };

  tabs: TabItem[] = [
    { key: 'overview', label: 'نظرة عامة', icon: 'pi-user' },
    { key: 'history', label: 'القصة المرضية', icon: 'pi-heart' },
    { key: 'tooth-chart', label: 'مخطط الأسنان', icon: 'pi-th-large' },
    { key: 'treatment-cases', label: 'الحالات العلاجية', icon: 'pi-briefcase' },
    { key: 'appointments', label: 'المواعيد', icon: 'pi-calendar' },
    { key: 'invoices', label: 'الفواتير', icon: 'pi-receipt' },
    { key: 'radiology', label: 'الأشعة', icon: 'pi-image' },
    { key: 'lab-orders', label: 'طلبات المخبر', icon: 'pi-send' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/patients']);
      return;
    }
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab) this.activeTab.set(tab);
    this.loadPatient(id);
  }

  loadPatient(id: string): void {
    this.loading.set(true);
    this.patientService.getById(id).subscribe({
      next: (response) => {
        if (response.isSuccess) this.patient.set(response.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل بيانات المريض.' });
        this.router.navigate(['/patients']);
      }
    });
  }

  reloadPatient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientService.getById(id).subscribe({
        next: (response) => {
          if (response.isSuccess) this.patient.set(response.value);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  onTabChange(value: string | number | undefined): void {
    if (value !== undefined && value !== null) this.activeTab.set(String(value));
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

  calculateAge(dateOfBirth?: string): string {
    const age = this.calculateAgeNumber(dateOfBirth);
    return age !== null ? `${age} سنة` : '—';
  }

  getGenderName(gender?: number): string {
    if (gender === 1) return 'ذكر';
    if (gender === 2) return 'أنثى';
    return '—';
  }

  getBloodTypeName(type?: number): string {
    const map: Record<number, string> = {
      1: 'A+', 2: 'A-', 3: 'B+', 4: 'B-',
      5: 'AB+', 6: 'AB-', 7: 'O+', 8: 'O-', 99: 'غير معروف'
    };
    return type ? map[type] ?? '—' : '—';
  }

  getAvatarIcon(): string {
    const p = this.patient();
    if (!p) return 'mdi:human';
    const age = this.calculateAgeNumber(p.dateOfBirth);
    const isMale = p.gender === 1;
    if (age !== null && age < 18) return isMale ? 'mdi:human-male-boy' : 'mdi:human-female-girl';
    if (age !== null && age >= 60) return isMale ? 'mdi:human-male-old' : 'mdi:human-female-old';
    return isMale ? 'mdi:human-male' : 'mdi:human-female';
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الحد الأقصى 5 ميغابايت.' });
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الصيغة غير مدعومة.' });
      return;
    }
    const p = this.patient();
    if (!p) return;
    this.uploading.set(true);
    this.patientService.updatePhoto(p.id, file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم رفع الصورة.' });
          this.reloadPatient();
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر رفع الصورة.'
        });
      }
    });
    event.target.value = '';
  }

  confirmDeletePhoto(): void {
    const p = this.patient();
    if (!p) return;
    this.confirmationService.confirm({
      message: 'هل تريد حذف صورة المريض؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.patientService.deletePhoto(p.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الصورة.' });
              this.reloadPatient();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الصورة.'
            });
          }
        });
      }
    });
  }

  // ============ Guardians ============

  openGuardianDialog(): void {
    this.guardianForm = {
      firstName: '', fatherName: '', motherName: '', lastName: '',
      nationalId: '', relationship: 1, isLegalGuardian: false
    };
    this.guardianDialog.set(true);
  }

  saveGuardian(): void {
    const p = this.patient();
    if (!p) return;
    if (!this.guardianForm.firstName.trim() || !this.guardianForm.lastName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم الأول والكنية مطلوبان.' });
      return;
    }
    this.guardianSaving.set(true);
    this.patientService.addGuardian(p.id, this.guardianForm).subscribe({
      next: (res) => {
        this.guardianSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تمت إضافة ولي الأمر.' });
          this.guardianDialog.set(false);
          this.reloadPatient();
        }
      },
      error: (err) => {
        this.guardianSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إضافة ولي الأمر.'
        });
      }
    });
  }

  confirmDeleteGuardian(g: any): void {
    const p = this.patient();
    if (!p) return;
    this.confirmationService.confirm({
      message: `هل تريد حذف ولي الأمر "${g.firstName} ${g.lastName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.patientService.removeGuardian(p.id, g.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف ولي الأمر.' });
              this.reloadPatient();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف ولي الأمر.'
            });
          }
        });
      }
    });
  }

  getRelationshipName(r: number): string {
    return GuardianRelationshipOptions.find(o => o.value === r)?.label ?? '—';
  }
}