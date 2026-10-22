import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentListItem } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule, RouterLink],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.scss'
})
export class PatientAppointments implements OnInit {
  @Input() patientId!: string;

  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  loading = signal(true);
  appointments = signal<AppointmentListItem[]>([]);

  upcoming = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(a => new Date(a.scheduledAt) > now && a.status !== 5 && a.status !== 6)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });

  past = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(a => new Date(a.scheduledAt) <= now || a.status === 4 || a.status === 5 || a.status === 6)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.appointments.set(response.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذّر تحميل المواعيد.'
        });
      }
    });
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مجدول', 2: 'مؤكد', 3: 'قيد التنفيذ', 4: 'مكتمل',
      5: 'ملغى', 6: 'لم يحضر', 7: 'أُعيدت جدولته'
    };
    return map[status] ?? '—';
  }

  getDayName(dateStr: string): string {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[new Date(dateStr).getDay()];
  }

}