import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  private tokenStorage = inject(TokenStorageService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  clinics = signal<{ label: string; value: string; schedules: any[]; appointmentDurationMinutes: number }[]>([]);
  
  today = new Date();

  form = {
    clinicId: '',
    doctorId: '',
    date: null as Date | null,
    time: null as Date | null,
    //durationMinutes: 30,
    reason: '',
    notes: ''
  };

  availableSlots = signal<{ time: Date; label: string; isBooked: boolean }[]>([]);
  isLoadingSlots = signal(false);

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.doctorId = this.getCurrentUserId();
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ 
            label: c.name, 
            value: c.id,
            schedules: c.schedules || [],
            appointmentDurationMinutes: c.appointmentDurationMinutes || 30
          })));
          
          if (this.clinics().length === 1) {
            this.form.clinicId = this.clinics()[0].value;
          }
        }
      }
    });
  }

  onClinicChange(): void {
    this.generateSlots();
  }

  onDateChange(): void {
    this.generateSlots();
  }

 
  generateSlots(): void {
      const clinicId = this.form.clinicId;
      const date = this.form.date;
      
      this.form.time = null;
      this.availableSlots.set([]);
    
      if (!clinicId || !date) return;
    
      const selectedClinic = this.clinics().find(c => c.value === clinicId);
      if (!selectedClinic || !selectedClinic.schedules || selectedClinic.schedules.length === 0) {
        this.messageService.add({ severity: 'info', summary: 'تنبيه', detail: 'لا توجد أوقات دوام محددة لهذه العيادة.' });
        return;
      }
    
      const duration = selectedClinic.appointmentDurationMinutes || 30;
      this.isLoadingSlots.set(true);
    
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
    
      this.appointmentService.getAll({
        clinicId,
        dateFrom: startOfDay.toISOString(),
        dateTo: endOfDay.toISOString(),
        page: 1,
        pageSize: 100
      }).subscribe({
        next: (res) => {
          const bookedAppointments = res.isSuccess ? res.value.items : [];
          const slots: { time: Date; label: string; isBooked: boolean }[] = [];
    
          selectedClinic.schedules.forEach((schedule: any) => {
            const [startH, startM] = schedule.startTime.split(':').map(Number);
            const [endH, endM] = schedule.endTime.split(':').map(Number);
    
            let current = new Date(date);
            current.setHours(startH, startM, 0, 0);
    
            const end = new Date(date);
            end.setHours(endH, endM, 0, 0);
    
            while (current < end) {
              const slotTime = new Date(current);
              
              const isBooked = bookedAppointments.some((apt: any) => {
                const aptStart = new Date(apt.scheduledAt);
                const aptEnd = new Date(aptStart.getTime() + apt.durationMinutes * 60000);
                const slotEnd = new Date(slotTime.getTime() + duration * 60000);
                
                return slotTime < aptEnd && slotEnd > aptStart;
              });
    
              const timeString = slotTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              slots.push({ time: slotTime, label: timeString, isBooked });
    
              current.setMinutes(current.getMinutes() + duration);
            }
          });
    
          this.availableSlots.set(slots);
          this.isLoadingSlots.set(false);
        },
        error: () => {
          this.isLoadingSlots.set(false);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر جلب المواعيد المحجوزة.' });
        }
      });
    }

  selectSlot(time: Date): void {
    this.form.time = time;
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
    const duration = this.clinics().find(c => c.value === this.form.clinicId)?.appointmentDurationMinutes || 30;
    const payload: CreateAppointmentRequest = {
      patientId: this.patientId,
      clinicId: this.form.clinicId,
      doctorId: this.form.doctorId,
      scheduledAt: this.form.time.toISOString(),
      durationMinutes: duration,
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