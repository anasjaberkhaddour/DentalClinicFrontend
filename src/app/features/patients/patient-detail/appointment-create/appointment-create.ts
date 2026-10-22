import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AppointmentService, CreateAppointmentRequest } from '../../../../core/services/appointment.service';
import { ClinicService } from '../../../../core/services/clinic.service';
import { UserService } from '../../../../core/services/user.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule
  ],
  templateUrl: './appointment-create.html',
  styleUrl: './appointment-create.scss'
})
export class AppointmentCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private clinicService = inject(ClinicService);
  private userService = inject(UserService);
  private tokenStorage = inject(TokenStorageService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  clinics = signal<{ label: string; value: string }[]>([]);
  doctors = signal<{ label: string; value: string }[]>([]);

  today = new Date();

  form = {
    clinicId: '',
    doctorId: '',
    date: null as Date | null,
    time: null as Date | null,
    durationMinutes: 30,
    reason: '',
    notes: ''
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.doctorId = this.getCurrentUserId();

    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    this.form.date = new Date(now);
    this.form.time = new Date(now);

    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.form.clinicId = this.clinics()[0].value;
        }
      }
    });
  }

  getCurrentUserId(): string {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }

  save(): void {
    if (!this.form.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!this.form.date || !this.form.time) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر التاريخ والوقت.' });
      return;
    }

    const scheduled = new Date(this.form.date);
    scheduled.setHours(this.form.time.getHours(), this.form.time.getMinutes(), 0, 0);

    const payload: CreateAppointmentRequest = {
      patientId: this.patientId,
      clinicId: this.form.clinicId,
      doctorId: this.form.doctorId,
      scheduledAt: scheduled.toISOString(),
      durationMinutes: this.form.durationMinutes,
      reason: this.form.reason,
      notes: this.form.notes
    };

    this.saving.set(true);
    this.appointmentService.create(payload).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حجز الموعد.' });
          this.router.navigate(['/patients', this.patientId]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حجز الموعد.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId]);
  }
}