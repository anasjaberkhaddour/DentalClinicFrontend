import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from '../../../../core/services/appointment.service';

interface AppointmentDetails {
  id: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: number;
  reason?: string;
  notes?: string;
  visitId?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  completedAt?: string;
  createdAt: string;
}

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, InputTextModule, InputNumberModule,
    TextareaModule, DatePickerModule
  ],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss'
})
export class AppointmentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  appointment = signal<AppointmentDetails | null>(null);
  editing = signal(false);
  saving = signal(false);
  actionLoading = signal(false);

  patientId!: string;
  appointmentId!: string;

  form = {
    scheduledAt: '',
    durationMinutes: 30,
    reason: '',
    notes: ''
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId') ?? '';

    if (!this.patientId || !this.appointmentId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadAppointment();
  }

  loadAppointment(): void {
    this.loading.set(true);
    this.appointmentService.getById(this.appointmentId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.appointment.set(response.value);
          this.form = {
            scheduledAt: response.value.scheduledAt,
            durationMinutes: response.value.durationMinutes,
            reason: response.value.reason ?? '',
            notes: response.value.notes ?? ''
          };
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الموعد.' });
        this.router.navigate(['/patients', this.patientId]);
      }
    });
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.loadAppointment();
  }

  save(): void {
    this.saving.set(true);
    this.appointmentService.update(this.appointmentId, this.form).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تعديل الموعد.' });
          this.editing.set(false);
          this.loadAppointment();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تعديل الموعد.'
        });
      }
    });
  }

  updateStatus(newStatus: number): void {
    const labels: Record<number, string> = {
      2: 'تأكيد الموعد',
      3: 'بدء الجلسة',
      4: 'إكمال الموعد',
      5: 'إلغاء الموعد',
      6: 'تسجيل عدم الحضور'
    };

    this.confirmationService.confirm({
      message: `هل تريد ${labels[newStatus]}؟`,
      header: 'تأكيد',
      icon: 'pi pi-question-circle',
      acceptLabel: 'نعم',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: newStatus === 5 || newStatus === 6 ? 'p-button-danger' : 'p-button-primary',
      accept: () => {
        this.actionLoading.set(true);
        this.appointmentService.updateStatus(this.appointmentId, newStatus).subscribe({
          next: (res) => {
            this.actionLoading.set(false);
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث حالة الموعد.' });
              this.loadAppointment();
            }
          },
          error: () => {
            this.actionLoading.set(false);
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث الحالة.' });
          }
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الموعد؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteAppointment()
    });
  }

  deleteAppointment(): void {
    this.appointmentService.delete(this.appointmentId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الموعد.' });
          this.router.navigate(['/patients', this.patientId]);
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الموعد.' });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'appointments' } });
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مجدول', 2: 'مؤكد', 3: 'قيد التنفيذ', 4: 'مكتمل',
      5: 'ملغى', 6: 'لم يحضر', 7: 'أُعيدت جدولته'
    };
    return map[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-slate-100 text-slate-700';
      case 2: return 'bg-emerald-100 text-emerald-700';
      case 3: return 'bg-amber-100 text-amber-700';
      case 4: return 'bg-blue-100 text-blue-700';
      case 5: return 'bg-red-100 text-red-700';
      case 6: return 'bg-red-100 text-red-700';
      case 7: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  canConfirm(): boolean { return this.appointment()?.status === 1; }
  canStart(): boolean { return this.appointment()?.status === 2; }
  canComplete(): boolean { return this.appointment()?.status === 3; }
  canCancel(): boolean {
    const s = this.appointment()?.status;
    return s === 1 || s === 2 || s === 7;
  }
  canMarkNoShow(): boolean { return this.appointment()?.status === 1 || this.appointment()?.status === 2; }
  canEdit(): boolean {
    const s = this.appointment()?.status;
    return s === 1 || s === 2 || s === 7;
  }
  canDelete(): boolean {
    const s = this.appointment()?.status;
    return s === 4 || s === 5 || s === 6;
  }
  hasVisit(): boolean { return !!this.appointment()?.visitId; }
}